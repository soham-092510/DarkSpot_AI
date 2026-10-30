import base64
import hashlib
import ipaddress
import os
import secrets
import socket
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from urllib.parse import urlparse

import argon2
from argon2 import PasswordHasher, Type
from argon2.exceptions import VerifyMismatchError
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import JWTError, jwt
from passlib.context import CryptContext
from backend.app.core.config import settings

# Initialize Argon2id password hasher with RFC-recommended parameters
argon2_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=1,
    hash_len=32,
    type=Type.ID
)
fallback_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hashes password securely using Argon2id."""
    return argon2_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id or legacy bcrypt hash."""
    if not hashed_password or not plain_password:
        return False
    if hashed_password.startswith("$argon2"):
        try:
            return argon2_hasher.verify(hashed_password, plain_password)
        except (VerifyMismatchError, Exception):
            return False
    # Legacy bcrypt fallback
    try:
        return fallback_pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def generate_secure_token() -> str:
    """Generates a cryptographically secure 256-bit URL-safe token for email verification / password reset."""
    return secrets.token_urlsafe(32)


# ==============================================================================
# AES-256-GCM BYOK Credential Encryption
# ==============================================================================

def _get_aes_key() -> bytes:
    """Derives a deterministic 256-bit AES master key from SECRET_KEY."""
    raw = settings.SECRET_KEY.encode()
    return hashlib.sha256(raw).digest()


def encrypt_api_key(plain_key: str) -> str:
    """
    Encrypts a user's API key using AES-256-GCM with a unique 96-bit random nonce.
    Returns base64-encoded nonce + ciphertext.
    """
    if not plain_key or not plain_key.strip():
        raise ValueError("Cannot encrypt an empty API key")
    clean = plain_key.strip().encode("utf-8")
    aesgcm = AESGCM(_get_aes_key())
    nonce = os.urandom(12)  # 96-bit unique nonce per encryption
    ciphertext = aesgcm.encrypt(nonce, clean, None)
    return base64.urlsafe_b64encode(nonce + ciphertext).decode("utf-8")


def decrypt_api_key(encrypted_str: str) -> str:
    """
    Decrypts an AES-256-GCM encrypted API key string.
    Decryption is restricted to server-side execution.
    """
    if not encrypted_str:
        return ""
    try:
        raw = base64.urlsafe_b64decode(encrypted_str.encode("utf-8"))
        if len(raw) < 13:
            return ""
        nonce, ciphertext = raw[:12], raw[12:]
        aesgcm = AESGCM(_get_aes_key())
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        return ""


def mask_api_key(plain_key: str) -> str:
    """
    Returns a safe masked version of the key for UI display (e.g. AIzaSy...4f9a).
    Never exposes the full key.
    """
    if not plain_key or len(plain_key) < 8:
        return "••••••••"
    return f"{plain_key[:6]}...{plain_key[-4:]}"


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ==============================================================================
# SSRF Protection System
# ==============================================================================

# Private & dangerous IPv4/IPv6 networks that user-submitted URLs MUST NOT resolve to
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # Current network
    ipaddress.ip_network("10.0.0.0/8"),         # Private RFC1918
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-Local / Cloud Metadata (AWS/GCP/Azure)
    ipaddress.ip_network("172.16.0.0/12"),      # Private RFC1918
    ipaddress.ip_network("192.168.0.0/16"),     # Private RFC1918
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("::1/128"),            # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),           # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),          # IPv6 Link-Local
]


def is_safe_url(url: str) -> tuple[bool, str]:
    """
    Validates a URL against Server-Side Request Forgery (SSRF) vulnerabilities.
    Returns (is_safe, error_reason).
    """
    if not url or not isinstance(url, str):
        return False, "URL must be a non-empty string"

    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Malformed URL format: {str(e)}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported scheme: {parsed.scheme}. Only HTTP/HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL does not contain a valid hostname"

    # Block localhost string literals
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        return False, "Access to localhost or loopback addresses is blocked."

    # Prevent internal cloud metadata domains
    if hostname.lower() in ("metadata.google.internal", "instance-data"):
        return False, "Access to cloud metadata endpoints is blocked."

    # Resolve hostname to IP addresses and verify against blocked networks
    try:
        resolved_ips = socket.getaddrinfo(hostname, None)
        for res in resolved_ips:
            ip_str = res[4][0]
            ip_obj = ipaddress.ip_address(ip_str)
            for blocked_net in BLOCKED_IP_NETWORKS:
                if ip_obj in blocked_net:
                    return False, f"Target IP ({ip_str}) resolves to a restricted internal or private address."
    except socket.gaierror:
        return False, f"Hostname '{hostname}' could not be resolved."
    except Exception as e:
        return False, f"Failed resolving hostname: {str(e)}"

    return True, ""
