import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Append-only. Never updated or deleted. Decoupled from business tables
    so financial records aren't bloated with audit columns, but every
    sensitive mutation (billing changes, role changes, settlement) writes
    a row here via the service layer.
    """

    __tablename__ = "audit_logs"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "billing.update"
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "Billing"
    entity_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    user: Mapped["User"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity_type}>"
