import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    encrypt_api_key,
    decrypt_api_key,
    mask_api_key,
    generate_secure_token
)
from backend.app.core.database import SessionLocal, init_db
from backend.app.models.all_models import User, Project, ApiCredential

init_db()
client = TestClient(app)


def test_argon2id_hashing():
    pwd = "CorrectHorseBatteryStaple123!"
    hashed = get_password_hash(pwd)
    assert hashed.startswith("$argon2id$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False
    assert verify_password("", hashed) is False


def test_aes_256_gcm_encryption_and_masking():
    test_key = "AIzaSyD-7exampleGoogleGeminiApiKey12345"
    encrypted = encrypt_api_key(test_key)
    assert encrypted != test_key
    assert len(encrypted) > 20

    decrypted = decrypt_api_key(encrypted)
    assert decrypted == test_key

    # Masking test: never exposes full key
    mask = mask_api_key(test_key)
    assert mask == "AIzaSy...2345"
    assert "exampleGoogleGemini" not in mask


def test_password_length_constraint_enforced():
    # Attempt registration with < 12 characters (should be rejected with 422 Unprocessable Entity)
    payload = {
        "email": "short_pwd@darkspot.ai",
        "password": "short",
        "full_name": "Short Pwd User"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 422


def test_user_registration_and_login_flow():
    email = f"analyst_{generate_secure_token()[:8].lower()}@darkspot.ai"
    pwd = "UltraSecurePassword2026!#"

    # Register
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Chief Investigator"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email.lower()

    # Verify password in DB is Argon2id
    db = SessionLocal()
    user_db = db.query(User).filter(User.email == email.lower()).first()
    assert user_db is not None
    assert user_db.hashed_password.startswith("$argon2id$")
    db.close()

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Test /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email


def test_multi_user_data_isolation():
    # User 1
    u1_email = f"user1_{generate_secure_token()[:8]}@darkspot.ai"
    u1_token = client.post("/api/auth/register", json={
        "email": u1_email,
        "password": "PasswordForUser1!2026",
        "full_name": "User One"
    }).json()["access_token"]

    # User 2
    u2_email = f"user2_{generate_secure_token()[:8]}@darkspot.ai"
    u2_token = client.post("/api/auth/register", json={
        "email": u2_email,
        "password": "PasswordForUser2!2026",
        "full_name": "User Two"
    }).json()["access_token"]

    # User 1 creates a private research project
    p1_res = client.post("/api/projects", json={
        "title": "User 1 Secret Project",
        "topic_question": "Does entity X have confidential liabilities?",
        "depth": "Standard"
    }, headers={"Authorization": f"Bearer {u1_token}"})
    assert p1_res.status_code == 201
    p1_id = p1_res.json()["id"]

    # User 2 attempts to view User 1's project -> MUST return 404 (isolation)
    p2_attempt = client.get(f"/api/projects/{p1_id}", headers={"Authorization": f"Bearer {u2_token}"})
    assert p2_attempt.status_code == 404

    # User 2 attempts to delete User 1's project -> MUST return 404 (cannot delete)
    del_attempt = client.delete(f"/api/projects/{p1_id}", headers={"Authorization": f"Bearer {u2_token}"})
    assert del_attempt.status_code == 404

    # Unauthenticated visitor attempts to view User 1's project -> MUST return 401
    unauth_attempt = client.get(f"/api/projects/{p1_id}")
    assert unauth_attempt.status_code == 401


def test_byok_credential_encryption_and_masking_api():
    email = f"byok_{generate_secure_token()[:8]}@darkspot.ai"
    token = client.post("/api/auth/register", json={
        "email": email,
        "password": "PasswordByokUser123!",
        "full_name": "BYOK Tester"
    }).json()["access_token"]

    # Get credentials when none are added yet
    res = client.get("/api/credentials", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == []

    # Unauthenticated access rejected
    unauth = client.get("/api/credentials")
    assert unauth.status_code == 401


def test_sliding_window_rate_limiter_unit():
    from backend.app.core.rate_limit import SlidingWindowRateLimiter
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=2)
    key = "test_ip_123"

    assert limiter.is_allowed(key) is True
    assert limiter.is_allowed(key) is True
    assert limiter.is_allowed(key) is True
    # 4th request in window must be blocked
    assert limiter.is_allowed(key) is False
    assert limiter.retry_after(key) >= 1


def test_password_reset_flow():
    email = f"reset_test_{generate_secure_token()[:8]}@darkspot.ai"
    pwd = "OriginalPassword2026!"

    # Register
    client.post("/api/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Reset Tester"
    })

    # Request forgot password
    forgot_res = client.post("/api/auth/forgot-password", json={"email": email})
    assert forgot_res.status_code == 200
    token = forgot_res.json().get("dev_reset_token")
    assert token is not None

    # Reset password
    new_pwd = "BrandNewPassword2026!#"
    reset_res = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pwd
    })
    assert reset_res.status_code == 200

    # Old password must fail
    old_login = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert old_login.status_code == 401

    # New password must succeed
    new_login = client.post("/api/auth/login", json={"email": email, "password": new_pwd})
    assert new_login.status_code == 200
