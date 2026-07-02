from datetime import date
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.consumption import PowerConsumption
from app.models.master_data import Feeder
from app.repositories.base_repository import BaseRepository


class ConsumptionRepository(BaseRepository[PowerConsumption]):
    model = PowerConsumption

    def __init__(self, db: Session):
        super().__init__(db)

    def list_by_range(
        self, *, date_from: date, date_to: date, feeder_id=None, page: int = 1, page_size: int = 20
    ) -> tuple[Sequence[PowerConsumption], int]:
        stmt = select(PowerConsumption).where(
            PowerConsumption.date >= date_from, PowerConsumption.date <= date_to
        )
        if feeder_id:
            stmt = stmt.where(PowerConsumption.feeder_id == feeder_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(PowerConsumption.date.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        stmt = (
            select(
                PowerConsumption.date,
                func.coalesce(func.sum(PowerConsumption.quantity_mwh), 0).label("quantity_mwh"),
            )
            .where(PowerConsumption.date >= date_from, PowerConsumption.date <= date_to)
            .group_by(PowerConsumption.date)
            .order_by(PowerConsumption.date)
        )
        rows = self.db.execute(stmt).all()
        return [{"date": r.date, "quantity_mwh": float(r.quantity_mwh)} for r in rows]

    def get_by_feeder(self, *, date_from: date, date_to: date) -> list[dict]:
        stmt = (
            select(
                Feeder.name,
                func.coalesce(func.sum(PowerConsumption.quantity_mwh), 0).label("quantity_mwh"),
            )
            .join(Feeder, Feeder.id == PowerConsumption.feeder_id)
            .where(PowerConsumption.date >= date_from, PowerConsumption.date <= date_to)
            .group_by(Feeder.name)
            .order_by(func.sum(PowerConsumption.quantity_mwh).desc())
        )
        rows = self.db.execute(stmt).all()
        return [{"feeder_name": r.name, "quantity_mwh": float(r.quantity_mwh)} for r in rows]

    def get_total(self, *, date_from: date, date_to: date) -> float:
        stmt = select(func.coalesce(func.sum(PowerConsumption.quantity_mwh), 0)).where(
            PowerConsumption.date >= date_from, PowerConsumption.date <= date_to
        )
        return float(self.db.execute(stmt).scalar_one())
