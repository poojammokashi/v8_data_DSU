from datetime import date
from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.billing import Billing, BillingStatus, Settlement
from app.repositories.base_repository import BaseRepository


class BillingRepository(BaseRepository[Billing]):
    model = Billing

    def __init__(self, db: Session):
        super().__init__(db)

    def search(
        self,
        *,
        status: Optional[BillingStatus] = None,
        feeder_id=None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[Sequence[Billing], int]:
        stmt = select(Billing).where(Billing.deleted_at.is_(None))
        if status:
            stmt = stmt.where(Billing.status == status)
        if feeder_id:
            stmt = stmt.where(Billing.feeder_id == feeder_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(Billing.due_date.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_outstanding_amount(self) -> float:
        stmt = select(func.coalesce(func.sum(Billing.amount), 0)).where(
            Billing.deleted_at.is_(None),
            Billing.status.in_([BillingStatus.PENDING, BillingStatus.OVERDUE]),
        )
        return float(self.db.execute(stmt).scalar_one())

    def get_monthly_billed_vs_settled(self, *, date_from: date, date_to: date) -> list[dict]:
        billed_stmt = (
            select(
                func.date_trunc("month", Billing.period_start).label("month"),
                func.coalesce(func.sum(Billing.amount), 0).label("billed"),
            )
            .where(Billing.deleted_at.is_(None), Billing.period_start >= date_from, Billing.period_start <= date_to)
            .group_by(func.date_trunc("month", Billing.period_start))
        )
        billed_rows = {r.month.date(): float(r.billed) for r in self.db.execute(billed_stmt).all()}

        settled_stmt = (
            select(
                func.date_trunc("month", Settlement.settlement_date).label("month"),
                func.coalesce(func.sum(Settlement.paid_amount), 0).label("settled"),
            )
            .where(Settlement.settlement_date >= date_from, Settlement.settlement_date <= date_to)
            .group_by(func.date_trunc("month", Settlement.settlement_date))
        )
        settled_rows = {r.month.date(): float(r.settled) for r in self.db.execute(settled_stmt).all()}

        months = sorted(set(billed_rows) | set(settled_rows))
        return [
            {"month": m, "billed": billed_rows.get(m, 0.0), "settled": settled_rows.get(m, 0.0)} for m in months
        ]
