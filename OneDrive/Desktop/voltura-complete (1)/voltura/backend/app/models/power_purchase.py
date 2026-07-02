import enum
import uuid
from datetime import date as date_type

# from sqlalchemy import Date, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy import Date, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum


class PowerPurchaseStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    REJECTED = "rejected"
    SETTLED = "settled"


class PowerPurchase(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "power_purchase"
    __table_args__ = (
        Index("ix_power_purchase_source_date", "source_id", "date"),
    )

    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("power_sources.id"), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)

    quantity_mu: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)  # Million Units
    rate_per_unit: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    # status: Mapped[PowerPurchaseStatus] = mapped_column(
    #     Enum(PowerPurchaseStatus, name="power_purchase_status"),
    #     default=PowerPurchaseStatus.DRAFT,
    #     nullable=False,
    # )
    status: Mapped[PowerPurchaseStatus] = mapped_column(
        PgEnum(PowerPurchaseStatus, name="power_purchase_status"),
        default=PowerPurchaseStatus.DRAFT,
        nullable=False,
    )
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    source: Mapped["PowerSource"] = relationship(lazy="joined")
    created_by: Mapped["User"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<PowerPurchase {self.date} {self.quantity_mu}MU>"
