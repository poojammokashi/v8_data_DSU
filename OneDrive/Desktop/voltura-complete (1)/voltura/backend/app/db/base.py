# import uuid
# from datetime import datetime

# from sqlalchemy import DateTime, func
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def PgEnum(enum_cls, name):
    """Postgres ENUM that stores the member's .value (lowercase) instead of its .name (uppercase)."""
    return SAEnum(enum_cls, name=name, values_callable=lambda x: [e.value for e in x])


class Base(DeclarativeBase):
    """Shared declarative base for every ORM model in the app."""
    pass


class UUIDPrimaryKeyMixin:
    """Adds a UUID primary key column. Used by every domain table."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )


class TimestampMixin:
    """Adds created_at / updated_at columns, maintained by the database itself."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class SoftDeleteMixin:
    """Adds deleted_at for soft-delete on financial/master records (never hard-deleted)."""

    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
