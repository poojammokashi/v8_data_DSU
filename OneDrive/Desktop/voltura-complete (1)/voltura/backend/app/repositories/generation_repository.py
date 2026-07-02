from datetime import date
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.generation import EnergyGeneration
from app.models.master_data import Plant, PowerSource
from app.repositories.base_repository import BaseRepository


class GenerationRepository(BaseRepository[EnergyGeneration]):
    model = EnergyGeneration

    def __init__(self, db: Session):
        super().__init__(db)

    def list_by_range(
        self, *, date_from: date, date_to: date, plant_id=None, page: int = 1, page_size: int = 20
    ) -> tuple[Sequence[EnergyGeneration], int]:
        stmt = select(EnergyGeneration).where(
            EnergyGeneration.date >= date_from, EnergyGeneration.date <= date_to
        )
        if plant_id:
            stmt = stmt.where(EnergyGeneration.plant_id == plant_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(EnergyGeneration.date.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        stmt = (
            select(
                EnergyGeneration.date,
                func.coalesce(func.sum(EnergyGeneration.quantity_mwh), 0).label("quantity_mwh"),
            )
            .where(EnergyGeneration.date >= date_from, EnergyGeneration.date <= date_to)
            .group_by(EnergyGeneration.date)
            .order_by(EnergyGeneration.date)
        )
        rows = self.db.execute(stmt).all()
        return [{"date": r.date, "quantity_mwh": float(r.quantity_mwh)} for r in rows]

    def get_source_wise_mix(self, *, date_from: date, date_to: date) -> list[dict]:
        """Generation volume grouped by power source type — feeds the donut chart."""
        stmt = (
            select(
                PowerSource.type,
                PowerSource.name,
                func.coalesce(func.sum(EnergyGeneration.quantity_mwh), 0).label("quantity_mwh"),
            )
            .join(Plant, Plant.id == EnergyGeneration.plant_id)
            .join(PowerSource, PowerSource.id == Plant.source_id)
            .where(EnergyGeneration.date >= date_from, EnergyGeneration.date <= date_to)
            .group_by(PowerSource.type, PowerSource.name)
            .order_by(func.sum(EnergyGeneration.quantity_mwh).desc())
        )
        rows = self.db.execute(stmt).all()
        return [{"source_type": r.type, "source_name": r.name, "quantity_mwh": float(r.quantity_mwh)} for r in rows]

    def get_total(self, *, date_from: date, date_to: date) -> float:
        stmt = select(func.coalesce(func.sum(EnergyGeneration.quantity_mwh), 0)).where(
            EnergyGeneration.date >= date_from, EnergyGeneration.date <= date_to
        )
        return float(self.db.execute(stmt).scalar_one())
