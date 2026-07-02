import enum
import uuid
from datetime import date as date_type

# from sqlalchemy import Date, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy import Date, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum

class OpenAccessStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SETTLED = "settled"


class OpenAccessTransaction(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "open_access_transactions"
    __table_args__ = (
        Index("ix_open_access_date", "date"),
    )

    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    consumer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    generator_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plants.id"), nullable=True
    )

    quantity_mu: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    wheeling_charges: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    transmission_charges: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    total_charges: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    # status: Mapped[OpenAccessStatus] = mapped_column(
    #     Enum(OpenAccessStatus, name="open_access_status"),
    #     default=OpenAccessStatus.PENDING,
    #     nullable=False,
    # )
    status: Mapped[OpenAccessStatus] = mapped_column(
        PgEnum(OpenAccessStatus, name="open_access_status"),
        default=OpenAccessStatus.PENDING,
        nullable=False,
    )

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    generator: Mapped["Plant"] = relationship(lazy="joined")
    created_by: Mapped["User"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<OpenAccessTransaction {self.date} {self.consumer_name}>"
