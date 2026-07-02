from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, ValidationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
    TOKEN_TYPE_REFRESH,
    TOKEN_TYPE_RESET,
)
from app.models.user import User, UserStatus
from app.repositories.user_repository import UserRepository
from app.utils.email import send_password_reset_email


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def authenticate(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)

        # Same generic error whether the email doesn't exist or the password
        # is wrong — never reveal which one to avoid account enumeration.
        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        if user.status == UserStatus.SUSPENDED:
            raise AuthenticationError("This account has been suspended. Contact your administrator.")
        if user.status == UserStatus.INACTIVE:
            raise AuthenticationError("This account is inactive. Contact your administrator.")

        user.last_active_at = datetime.now(timezone.utc)
        self.db.commit()

        access_token = create_access_token(str(user.id), user.role.name)
        refresh_token = create_refresh_token(str(user.id))

        return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

    def refresh_access_token(self, refresh_token: str) -> str:
        payload = decode_token(refresh_token, expected_type=TOKEN_TYPE_REFRESH)
        user_id = payload["sub"]

        user = self.user_repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise AuthenticationError("User no longer has access")

        return create_access_token(str(user.id), user.role.name)

    def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.password_hash):
            raise ValidationError("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        self.db.commit()

    def request_password_reset(self, email: str) -> None:
        """
        Always succeeds from the caller's perspective (no account-enumeration
        signal) even if the email doesn't exist — the early return below is
        silent on purpose.
        """
        user = self.user_repo.get_by_email(email)
        if not user:
            return

        reset_token = create_reset_token(str(user.id))
        send_password_reset_email(to=user.email, reset_token=reset_token)

    def reset_password(self, token: str, new_password: str) -> None:
        try:
            payload = decode_token(token, expected_type=TOKEN_TYPE_RESET)
        except AuthenticationError:
            raise ValidationError("This reset link is invalid or has expired. Request a new one.")

        user = self.user_repo.get_by_id(payload["sub"])
        if not user:
            raise ValidationError("This reset link is invalid or has expired. Request a new one.")

        user.password_hash = hash_password(new_password)
        # A pending invite is implicitly accepted by successfully resetting
        # the password, since invited users land here via the same flow.
        if user.status == UserStatus.PENDING:
            user.status = UserStatus.ACTIVE
            user.is_email_verified = True
        self.db.commit()
