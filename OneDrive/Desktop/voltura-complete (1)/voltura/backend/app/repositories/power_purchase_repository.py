from datetime import date
from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.power_purchase import PowerPurchase
from app.repositories.base_repository import BaseRepository


class PowerPurchaseRepository(BaseRepository[PowerPurchase]):
    model = PowerPurchase

    def __init__(self, db: Session):
        super().__init__(db)

    def search(
        self,
        *,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        source_id=None,
        status=None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> tuple[Sequence[PowerPurchase], int]:
        stmt = select(PowerPurchase).where(PowerPurchase.deleted_at.is_(None))

        if date_from:
            stmt = stmt.where(PowerPurchase.date >= date_from)
        if date_to:
            stmt = stmt.where(PowerPurchase.date <= date_to)
        if source_id:
            stmt = stmt.where(PowerPurchase.source_id == source_id)
        if status:
            stmt = stmt.where(PowerPurchase.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        sort_column = getattr(PowerPurchase, sort_by, PowerPurchase.date)
        stmt = stmt.order_by(sort_column.desc() if sort_order == "desc" else sort_column.asc())
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_summary(self, *, date_from: date, date_to: date) -> dict:
        """Aggregate totals for the dashboard/analytics summary endpoints."""
        stmt = select(
            func.coalesce(func.sum(PowerPurchase.quantity_mu), 0).label("total_quantity_mu"),
            func.coalesce(func.sum(PowerPurchase.amount), 0).label("total_amount"),
            func.count(PowerPurchase.id).label("transaction_count"),
        ).where(
            PowerPurchase.deleted_at.is_(None),
            PowerPurchase.date >= date_from,
            PowerPurchase.date <= date_to,
        )
        row = self.db.execute(stmt).one()
        return {
            "total_quantity_mu": float(row.total_quantity_mu),
            "total_amount": float(row.total_amount),
            "transaction_count": row.transaction_count,
        }

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        stmt = (
            select(
                PowerPurchase.date,
                func.coalesce(func.sum(PowerPurchase.quantity_mu), 0).label("quantity_mu"),
            )
            .where(
                PowerPurchase.deleted_at.is_(None),
                PowerPurchase.date >= date_from,
                PowerPurchase.date <= date_to,
            )
            .group_by(PowerPurchase.date)
            .order_by(PowerPurchase.date)
        )
        rows = self.db.execute(stmt).all()
        return [{"date": r.date, "quantity_mu": float(r.quantity_mu)} for r in rows]
