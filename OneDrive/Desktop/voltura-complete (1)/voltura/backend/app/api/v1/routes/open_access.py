import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.permissions import Permission
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.schemas.open_access import (
    OpenAccessCreate,
    OpenAccessRead,
    OpenAccessStatusUpdate,
    OpenAccessSummary,
    OpenAccessUpdate,
)
from app.services.open_access_service import OpenAccessService

router = APIRouter(prefix="/open-access", tags=["Open Access"])


@router.get("/", response_model=PaginatedResponse[OpenAccessRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def list_open_access(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    service = OpenAccessService(db)
    rows, total = service.list(
        date_from=date_from, date_to=date_to, status=status,
        page=page, page_size=page_size, sort_by=sort_by, sort_order=sort_order,
    )
    return paginate(rows, total, page, page_size)


@router.get("/summary", response_model=SuccessResponse[OpenAccessSummary], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_open_access_summary(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = OpenAccessService(db)
    return {"data": service.get_summary(date_from=date_from, date_to=date_to)}


@router.get("/{id}", response_model=SuccessResponse[OpenAccessRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_open_access(id: uuid.UUID, db: Session = Depends(get_db)):
    service = OpenAccessService(db)
    return {"data": service.get(id)}


@router.post("/", response_model=SuccessResponse[OpenAccessRead], status_code=201, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def create_open_access(
    payload: OpenAccessCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    service = OpenAccessService(db)
    return {"data": service.create(payload, created_by_id=current_user.id)}


@router.put("/{id}", response_model=SuccessResponse[OpenAccessRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def update_open_access(id: uuid.UUID, payload: OpenAccessUpdate, db: Session = Depends(get_db)):
    service = OpenAccessService(db)
    return {"data": service.update(id, payload)}


@router.put("/{id}/status", response_model=SuccessResponse[OpenAccessRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def update_open_access_status(id: uuid.UUID, payload: OpenAccessStatusUpdate, db: Session = Depends(get_db)):
    service = OpenAccessService(db)
    return {"data": service.update_status(id, payload.status)}


@router.delete("/{id}", status_code=204, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def delete_open_access(id: uuid.UUID, db: Session = Depends(get_db)):
    service = OpenAccessService(db)
    service.delete(id)
