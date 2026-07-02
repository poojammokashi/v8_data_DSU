from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import AuthenticationError, TokenExpiredError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"
TOKEN_TYPE_RESET = "reset"


# --- Password hashing ---

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# --- JWT tokens ---

def _create_token(subject: str, expires_delta: timedelta, token_type: str, extra_claims: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + expires_delta,
        "type": token_type,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, role: str) -> str:
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type=TOKEN_TYPE_ACCESS,
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type=TOKEN_TYPE_REFRESH,
    )


def create_reset_token(user_id: str) -> str:
    """
    Short-lived, single-purpose token for the forgot-password flow. Kept as
    its own token type (not a refresh/access token) so it can never be used
    to authenticate API calls even if intercepted — decode_token() rejects
    it everywhere except the reset-password endpoint, which is the only
    caller that requests TOKEN_TYPE_RESET.
    """
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        token_type=TOKEN_TYPE_RESET,
    )


def decode_token(token: str, expected_type: str = TOKEN_TYPE_ACCESS) -> dict:
    """
    Decode and validate a JWT. Raises AuthenticationError / TokenExpiredError
    (domain exceptions) rather than leaking jose's exception types upward.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except JWTError:
        raise AuthenticationError("Invalid token")

    if payload.get("type") != expected_type:
        raise AuthenticationError(f"Expected a {expected_type} token")

    return payload
