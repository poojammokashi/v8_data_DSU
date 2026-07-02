import enum
import uuid

# from sqlalchemy import Enum, ForeignKey, Numeric, String
from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum


class SourceType(str, enum.Enum):
    THERMAL = "thermal"
    SOLAR = "solar"
    WIND = "wind"
    HYDRO = "hydro"
    OTHER = "other"


class PowerSource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Reference data: a category of energy source (Thermal, Solar, Wind, Hydro)."""

    __tablename__ = "power_sources"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    # type: Mapped[SourceType] = mapped_column(Enum(SourceType, name="source_type"), nullable=False)
    type: Mapped[SourceType] = mapped_column(PgEnum(SourceType, name="source_type"), nullable=False)

    plants: Mapped[list["Plant"]] = relationship(back_populates="source")

    def __repr__(self) -> str:
        return f"<PowerSource {self.name}>"


class Plant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A generation plant/station tied to a power source."""

    __tablename__ = "plants"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    capacity_mw: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("power_sources.id"), nullable=False)
    source: Mapped["PowerSource"] = relationship(back_populates="plants", lazy="joined")

    def __repr__(self) -> str:
        return f"<Plant {self.name}>"


class Feeder(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A feeder/substation — the unit consumption and peak demand are measured against."""

    __tablename__ = "feeders"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    region: Mapped[str | None] = mapped_column(String(150), nullable=True)

    def __repr__(self) -> str:
        return f"<Feeder {self.name}>"
