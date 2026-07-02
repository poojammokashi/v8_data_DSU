import uuid
import enum

# from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # status: Mapped[UserStatus] = mapped_column(
    #     Enum(UserStatus, name="user_status"), default=UserStatus.PENDING, nullable=False
    # )
    status: Mapped[UserStatus] = mapped_column(
        PgEnum(UserStatus, name="user_status"), default=UserStatus.PENDING, nullable=False
    )
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_active_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    role: Mapped["Role"] = relationship(back_populates="users", lazy="joined")

    def __repr__(self) -> str:
        return f"<User {self.email}>"
