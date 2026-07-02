import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_permission
from app.core.permissions import Permission
from app.schemas.common import PaginatedResponse, paginate
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit-logs", tags=["Audit"])


class AuditLogRead(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get(
    "/", response_model=PaginatedResponse[AuditLogRead],
    dependencies=[Depends(require_permission(Permission.AUDIT_VIEW))],
)
def list_audit_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    service = AuditService(db)
    rows, total = service.list_recent(page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)
