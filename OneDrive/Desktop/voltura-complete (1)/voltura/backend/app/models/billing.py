import enum
import uuid
from datetime import date as date_type

# from sqlalchemy import Date, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy import Date, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum

class BillingStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    SETTLED = "settled"
    OVERDUE = "overdue"


class SettlementStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Billing(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "billing"
    __table_args__ = (
        Index("ix_billing_period", "period_start", "period_end"),
    )

    period_start: Mapped[date_type] = mapped_column(Date, nullable=False)
    period_end: Mapped[date_type] = mapped_column(Date, nullable=False)
    feeder_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("feeders.id"), nullable=True)

    units_consumed_mu: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    rate_per_unit: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    due_date: Mapped[date_type] = mapped_column(Date, nullable=False)

    # status: Mapped[BillingStatus] = mapped_column(
    #     Enum(BillingStatus, name="billing_status"), default=BillingStatus.DRAFT, nullable=False
    # )
    status: Mapped[BillingStatus] = mapped_column(
        PgEnum(BillingStatus, name="billing_status"), default=BillingStatus.DRAFT, nullable=False
    )

    feeder: Mapped["Feeder"] = relationship(lazy="joined")
    settlements: Mapped[list["Settlement"]] = relationship(back_populates="billing")

    def __repr__(self) -> str:
        return f"<Billing {self.period_start}-{self.period_end} {self.amount}>"


class Settlement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "settlement"

    billing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("billing.id"), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    settlement_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # status: Mapped[SettlementStatus] = mapped_column(
    #     Enum(SettlementStatus, name="settlement_status"), default=SettlementStatus.PENDING, nullable=False
    # )
    status: Mapped[SettlementStatus] = mapped_column(
        PgEnum(SettlementStatus, name="settlement_status"), default=SettlementStatus.PENDING, nullable=False
    )

    billing: Mapped["Billing"] = relationship(back_populates="settlements", lazy="joined")

    def __repr__(self) -> str:
        return f"<Settlement {self.settlement_date} {self.paid_amount}>"
