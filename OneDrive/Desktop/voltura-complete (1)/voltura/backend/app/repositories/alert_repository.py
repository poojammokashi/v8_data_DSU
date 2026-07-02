from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.alert import AlertNotification, AlertRule
from app.repositories.base_repository import BaseRepository


class AlertRuleRepository(BaseRepository[AlertRule]):
    model = AlertRule

    def __init__(self, db: Session):
        super().__init__(db)

    def list_active(self) -> list[AlertRule]:
        stmt = select(AlertRule).where(AlertRule.is_active.is_(True))
        return list(self.db.execute(stmt).scalars().all())


class AlertNotificationRepository(BaseRepository[AlertNotification]):
    model = AlertNotification

    def __init__(self, db: Session):
        super().__init__(db)

    def search(
        self,
        *,
        severity: Optional[str] = None,
        acknowledged: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[Sequence[AlertNotification], int]:
        stmt = select(AlertNotification)

        if severity:
            stmt = stmt.join(AlertRule).where(AlertRule.severity == severity)
        if acknowledged is not None:
            stmt = stmt.where(AlertNotification.acknowledged == acknowledged)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(AlertNotification.triggered_at.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def count_unacknowledged(self) -> int:
        stmt = select(func.count()).select_from(AlertNotification).where(AlertNotification.acknowledged.is_(False))
        return self.db.execute(stmt).scalar_one()
