from datetime import date
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.peak_demand import PeakDemand
from app.repositories.base_repository import BaseRepository


class PeakDemandRepository(BaseRepository[PeakDemand]):
    model = PeakDemand

    def __init__(self, db: Session):
        super().__init__(db)

    def list_by_range(
        self, *, date_from: date, date_to: date, feeder_id=None, page: int = 1, page_size: int = 20
    ) -> tuple[Sequence[PeakDemand], int]:
        stmt = select(PeakDemand).where(PeakDemand.date >= date_from, PeakDemand.date <= date_to)
        if feeder_id:
            stmt = stmt.where(PeakDemand.feeder_id == feeder_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(PeakDemand.date.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        """Daily peak (max across time blocks) — what the trend chart needs, not a sum."""
        stmt = (
            select(PeakDemand.date, func.coalesce(func.max(PeakDemand.demand_mw), 0).label("demand_mw"))
            .where(PeakDemand.date >= date_from, PeakDemand.date <= date_to)
            .group_by(PeakDemand.date)
            .order_by(PeakDemand.date)
        )
        rows = self.db.execute(stmt).all()
        return [{"date": r.date, "demand_mw": float(r.demand_mw)} for r in rows]

    def get_current_peak(self, *, date_from: date, date_to: date) -> float:
        stmt = select(func.coalesce(func.max(PeakDemand.demand_mw), 0)).where(
            PeakDemand.date >= date_from, PeakDemand.date <= date_to
        )
        return float(self.db.execute(stmt).scalar_one())
