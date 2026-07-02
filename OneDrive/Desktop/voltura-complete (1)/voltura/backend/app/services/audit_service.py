import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditService:
    """
    Called by other services after sensitive mutations (billing changes,
    role changes, settlement, user suspension) to write an immutable trail
    entry. Kept as its own thin service so call sites stay one-liners:
    AuditService(db).log(user_id=..., action="billing.update", ...)
    """

    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        *,
        user_id: Optional[uuid.UUID],
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_json=metadata,
            ip_address=ip_address,
        )
        self.db.add(entry)
        self.db.commit()
        return entry

    def list_recent(self, *, page: int = 1, page_size: int = 50):
        from sqlalchemy import select, func

        count_stmt = select(func.count()).select_from(AuditLog)
        total = self.db.execute(count_stmt).scalar_one()

        stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total
