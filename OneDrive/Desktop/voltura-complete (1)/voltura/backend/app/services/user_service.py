import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateResourceError, NotFoundError
from app.core.security import create_reset_token, hash_password
from app.models.user import User, UserStatus
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.utils.email import send_user_invite_email


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)

    def list_users(self, *, query=None, status=None, page=1, page_size=20):
        return self.user_repo.search(query=query, status=status, page=page, page_size=page_size)

    def get_user(self, user_id: uuid.UUID) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return user

    def invite_user(self, payload: UserCreate, invited_by: User) -> User:
        if self.user_repo.email_exists(payload.email):
            raise DuplicateResourceError(f"A user with email {payload.email} already exists")

        role = self.role_repo.get_by_name(payload.role.value)
        if not role:
            raise NotFoundError("Role", payload.role.value)

        # Unusable random password — the invitee never sees or uses this
        # directly. They set a real password via the invite link below,
        # which reuses the same reset-token flow as forgot-password.
        import secrets

        unusable_password = secrets.token_urlsafe(32)

        user = User(
            name=payload.name,
            email=payload.email.lower(),
            password_hash=hash_password(unusable_password),
            phone=payload.phone,
            role_id=role.id,
            status=UserStatus.PENDING,
        )
        self.user_repo.create(user)
        self.db.commit()

        invite_token = create_reset_token(str(user.id))
        send_user_invite_email(to=user.email, name=user.name, invite_token=invite_token)

        return user

    def update_user(self, user_id: uuid.UUID, payload: UserUpdate) -> User:
        user = self.get_user(user_id)
        update_data = payload.model_dump(exclude_unset=True)
        self.user_repo.update(user, **update_data)
        self.db.commit()
        return user

    def update_role(self, user_id: uuid.UUID, role_name: str) -> User:
        user = self.get_user(user_id)
        role = self.role_repo.get_by_name(role_name)
        if not role:
            raise NotFoundError("Role", role_name)

        user.role_id = role.id
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_status(self, user_id: uuid.UUID, status: str) -> User:
        user = self.get_user(user_id)
        user.status = UserStatus(status)
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: uuid.UUID) -> User:
        return self.update_status(user_id, UserStatus.SUSPENDED.value)
