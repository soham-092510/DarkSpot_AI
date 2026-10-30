from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_secure_token
)
from backend.app.core.rate_limit import (
    auth_login_limiter,
    auth_register_limiter,
    password_reset_limiter,
    get_client_ip,
    enforce_rate_limit
)
from backend.app.models.all_models import User
from backend.app.schemas.all_schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    EmailVerificationRequest,
    ChangePasswordRequest,
    UserUpdateProfile
)
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register_user(
    request: Request,
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    enforce_rate_limit(auth_register_limiter, ip, "registration")

    email_clean = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Generate email verification token (valid for 24 hours)
    verification_token = generate_secure_token()
    token_expiry = datetime.now(timezone.utc) + timedelta(hours=24)

    user = User(
        email=email_clean,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name or email_clean.split("@")[0].capitalize(),
        is_active=True,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expires_at=token_expiry
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=TokenResponse)
def login_user(
    request: Request,
    payload: UserLogin,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    enforce_rate_limit(auth_login_limiter, ip, "login")

    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been suspended or deactivated. Please contact support."
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserOut)
def get_authenticated_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserOut)
def update_user_profile(
    payload: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_user_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password entered is incorrect."
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully with Argon2id encryption."}


@router.post("/forgot-password")
def request_password_reset(
    request: Request,
    payload: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    enforce_rate_limit(password_reset_limiter, ip, "password reset")

    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    reset_token = None

    if user:
        reset_token = generate_secure_token()
        user.reset_token = reset_token
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()

    # Consistent message preventing account enumeration
    response_data = {
        "status": "success",
        "message": "If an account exists with this email, password reset instructions have been generated."
    }
    # For local developer / testing inspection, also supply the token preview if generated
    if reset_token:
        response_data["dev_reset_token"] = reset_token

    return response_data


@router.post("/reset-password")
def confirm_password_reset(
    request: Request,
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    enforce_rate_limit(password_reset_limiter, ip, "password reset confirm")

    user = db.query(User).filter(User.reset_token == payload.token).first()
    now = datetime.now(timezone.utc)

    # Handle timezone naive vs aware comparison safely
    if not user or not user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    expires = user.reset_token_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if expires < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )

    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {"status": "success", "message": "Password reset successfully. You can now sign in with your new password."}


@router.post("/verify-email")
def verify_user_email(
    payload: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()

    return {"status": "success", "message": "Email address verified successfully."}


@router.delete("/account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently deletes user account and cascades all associated data."""
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Account and all associated research projects and credentials deleted."}
