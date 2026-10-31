from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.all_models import User

# HTTPBearer security scheme
security = HTTPBearer(auto_error=False)

DEFAULT_DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_PROJECT_ID = "00000000-0000-0000-0000-000000000099"
PUBLIC_PROJECT_IDS = {DEMO_PROJECT_ID, "3840ef08-55dc-4a69-a2c7-9a43697c06a4"}


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Enforces strict JWT token authentication for multi-user SaaS isolation.
    Validates token and returns active User record.
    Raises HTTP 401 Unauthorized if token is missing, invalid, or expired.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to your account.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been deactivated.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional user dependency for public demo or preview endpoints.
    Returns User if valid token is provided, otherwise None.
    """
    if credentials and credentials.credentials:
        user_id = decode_access_token(credentials.credentials)
        if user_id:
            return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return None
