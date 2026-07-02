import uuid
from datetime import date as date_type

from sqlalchemy import Date, ForeignKey, Index, Numeric, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EnergyGeneration(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Generation volume per plant per day (optionally per 15-min time block,
    block=None means a daily aggregate row). High write volume — candidate
    for monthly range partitioning once data grows (see DB architecture notes).
    """

    __tablename__ = "energy_generation"
    __table_args__ = (
        Index("ix_generation_plant_date", "plant_id", "date"),
    )

    plant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plants.id"), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    time_block: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-96 for 15-min blocks

    quantity_mwh: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)

    plant: Mapped["Plant"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<EnergyGeneration {self.date} plant={self.plant_id}>"
