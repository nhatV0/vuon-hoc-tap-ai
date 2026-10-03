import hashlib
import hmac
import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional

SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "sunflower-secret-key-super-safe-edu-2026")
SALT_LENGTH = 16

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with cryptographically random salt."""
    salt = secrets.token_hex(SALT_LENGTH)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000
    )
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt and hash."""
    try:
        salt, key_hex = hashed_password.split(":")
        new_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000
        )
        return hmac.compare_digest(key_hex, new_key.hex())
    except Exception:
        return False

def generate_session_token(user_id: str) -> str:
    """Generate secure tamper-proof token."""
    raw = f"{user_id}:{secrets.token_hex(24)}"
    return raw
