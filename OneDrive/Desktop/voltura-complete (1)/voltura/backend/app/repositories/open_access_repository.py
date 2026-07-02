from datetime import date
from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.open_access import OpenAccessTransaction
from app.repositories.base_repository import BaseRepository


class OpenAccessRepository(BaseRepository[OpenAccessTransaction]):
    model = OpenAccessTransaction

    def __init__(self, db: Session):
        super().__init__(db)

    def search(
        self,
        *,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status=None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> tuple[Sequence[OpenAccessTransaction], int]:
        stmt = select(OpenAccessTransaction).where(OpenAccessTransaction.deleted_at.is_(None))

        if date_from:
            stmt = stmt.where(OpenAccessTransaction.date >= date_from)
        if date_to:
            stmt = stmt.where(OpenAccessTransaction.date <= date_to)
        if status:
            stmt = stmt.where(OpenAccessTransaction.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        sort_column = getattr(OpenAccessTransaction, sort_by, OpenAccessTransaction.date)
        stmt = stmt.order_by(sort_column.desc() if sort_order == "desc" else sort_column.asc())
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def get_summary(self, *, date_from: date, date_to: date) -> dict:
        stmt = select(
            func.coalesce(func.sum(OpenAccessTransaction.quantity_mu), 0).label("total_quantity_mu"),
            func.coalesce(func.sum(OpenAccessTransaction.total_charges), 0).label("total_charges"),
            func.count(OpenAccessTransaction.id).label("transaction_count"),
        ).where(
            OpenAccessTransaction.deleted_at.is_(None),
            OpenAccessTransaction.date >= date_from,
            OpenAccessTransaction.date <= date_to,
        )
        row = self.db.execute(stmt).one()
        return {
            "total_quantity_mu": float(row.total_quantity_mu),
            "total_charges": float(row.total_charges),
            "transaction_count": row.transaction_count,
        }
