import uuid
from datetime import date as date_type

from sqlalchemy import Date, ForeignKey, Index, Numeric, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PowerConsumption(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "power_consumption"
    __table_args__ = (
        Index("ix_consumption_feeder_date", "feeder_id", "date"),
    )

    feeder_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("feeders.id"), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    time_block: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    quantity_mwh: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)

    feeder: Mapped["Feeder"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<PowerConsumption {self.date} feeder={self.feeder_id}>"
