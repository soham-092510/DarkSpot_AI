from datetime import datetime, timezone
from typing import List, Tuple
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import encrypt_api_key, mask_api_key
from backend.app.core.rate_limit import credential_test_limiter, get_client_ip, enforce_rate_limit
from backend.app.models.all_models import User, ApiCredential
from backend.app.schemas.all_schemas import (
    ApiCredentialCreate,
    ApiCredentialOut,
    ApiCredentialTestRequest,
    ApiCredentialTestResponse
)
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/credentials", tags=["BYOK API Credentials"])


def _verify_key_live(provider: str, api_key: str) -> Tuple[bool, str]:
    """
    Validates user-submitted API key directly against Google Gemini or Tavily Search API.
    Returns (is_valid, status_message).
    """
    clean_key = api_key.strip()
    if provider == "gemini":
        test_url = "https://generativelanguage.googleapis.com/v1beta/models"
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(test_url, params={"key": clean_key})
                if resp.status_code == 200:
                    return True, "Google Gemini API key successfully validated and active."
                elif resp.status_code in (400, 403):
                    data = resp.json().get("error", {})
                    msg = data.get("message", "Invalid API key or insufficient permissions.")
                    return False, f"Google Gemini validation failed: {msg}"
                else:
                    return False, f"Google Gemini returned status {resp.status_code}: {resp.text[:100]}"
        except Exception as e:
            return False, f"Failed to connect to Google Gemini validation endpoint: {str(e)}"

    elif provider == "tavily":
        test_url = "https://api.tavily.com/search"
        payload = {
            "api_key": clean_key,
            "query": "DarkSpot AI Connectivity Test",
            "search_depth": "basic",
            "max_results": 1
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(test_url, json=payload)
                if resp.status_code == 200:
                    return True, "Tavily Search API key successfully validated and active."
                elif resp.status_code in (401, 403):
                    return False, "Tavily validation failed: Invalid API key or quota exceeded."
                else:
                    return False, f"Tavily returned status {resp.status_code}: {resp.text[:100]}"
        except Exception as e:
            return False, f"Failed to connect to Tavily validation endpoint: {str(e)}"

    return False, f"Unsupported provider '{provider}'"


@router.get("", response_model=List[ApiCredentialOut])
def list_user_credentials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated user's configured credentials with masked keys.
    Plaintext and encrypted ciphertexts are NEVER exposed to the client.
    """
    creds = db.query(ApiCredential).filter(ApiCredential.user_id == current_user.id).all()
    return creds


@router.post("/test", response_model=ApiCredentialTestResponse)
def test_user_credential(
    request: Request,
    payload: ApiCredentialTestRequest,
    current_user: User = Depends(get_current_user)
):
    """Tests an API key live against provider without persisting it."""
    ip = get_client_ip(request)
    enforce_rate_limit(credential_test_limiter, f"{current_user.id}:{ip}", "key test")

    is_valid, message = _verify_key_live(payload.provider, payload.api_key)
    return {
        "valid": is_valid,
        "provider": payload.provider,
        "message": message
    }


@router.post("", response_model=ApiCredentialOut)
def save_user_credential(
    request: Request,
    payload: ApiCredentialCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validates, encrypts with AES-256-GCM, and persists an API key for the user.
    """
    ip = get_client_ip(request)
    enforce_rate_limit(credential_test_limiter, f"{current_user.id}:{ip}", "save credential")

    # Validate live first
    is_valid, validation_msg = _verify_key_live(payload.provider, payload.api_key)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API key validation failed: {validation_msg}"
        )

    # Encrypt key with AES-256-GCM
    encrypted = encrypt_api_key(payload.api_key)
    masked = mask_api_key(payload.api_key)
    now = datetime.now(timezone.utc)

    existing = db.query(ApiCredential).filter(
        ApiCredential.user_id == current_user.id,
        ApiCredential.provider == payload.provider
    ).first()

    if existing:
        existing.encrypted_key = encrypted
        existing.key_mask = masked
        existing.status = "valid"
        existing.last_validated_at = now
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_cred = ApiCredential(
            user_id=current_user.id,
            provider=payload.provider,
            encrypted_key=encrypted,
            key_mask=masked,
            status="valid",
            last_validated_at=now,
        )
        db.add(new_cred)
        db.commit()
        db.refresh(new_cred)
        return new_cred


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_credential(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cred = db.query(ApiCredential).filter(
        ApiCredential.user_id == current_user.id,
        ApiCredential.provider == provider
    ).first()
    if not cred:
        raise HTTPException(status_code=404, detail=f"No credential configured for '{provider}'")

    db.delete(cred)
    db.commit()
    return None
