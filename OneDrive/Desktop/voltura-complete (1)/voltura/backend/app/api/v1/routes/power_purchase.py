import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.permissions import Permission
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.schemas.power_purchase import (
    PowerPurchaseCreate,
    PowerPurchaseRead,
    PowerPurchaseStatusUpdate,
    PowerPurchaseSummary,
    PowerPurchaseUpdate,
)
from app.services.power_purchase_service import PowerPurchaseService

router = APIRouter(prefix="/power-purchase", tags=["Power Purchase"])


@router.get("/", response_model=PaginatedResponse[PowerPurchaseRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def list_power_purchase(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    source_id: uuid.UUID | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    service = PowerPurchaseService(db)
    rows, total = service.list(
        date_from=date_from, date_to=date_to, source_id=source_id, status=status,
        page=page, page_size=page_size, sort_by=sort_by, sort_order=sort_order,
    )
    return paginate(rows, total, page, page_size)


@router.get("/summary", response_model=SuccessResponse[PowerPurchaseSummary], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_power_purchase_summary(
    date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)
):
    service = PowerPurchaseService(db)
    return {"data": service.get_summary(date_from=date_from, date_to=date_to)}


@router.get("/{id}", response_model=SuccessResponse[PowerPurchaseRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_power_purchase(id: uuid.UUID, db: Session = Depends(get_db)):
    service = PowerPurchaseService(db)
    return {"data": service.get(id)}


@router.post("/", response_model=SuccessResponse[PowerPurchaseRead], status_code=201, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def create_power_purchase(
    payload: PowerPurchaseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    service = PowerPurchaseService(db)
    return {"data": service.create(payload, created_by_id=current_user.id)}


@router.put("/{id}", response_model=SuccessResponse[PowerPurchaseRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def update_power_purchase(id: uuid.UUID, payload: PowerPurchaseUpdate, db: Session = Depends(get_db)):
    service = PowerPurchaseService(db)
    return {"data": service.update(id, payload)}


@router.put("/{id}/status", response_model=SuccessResponse[PowerPurchaseRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def update_power_purchase_status(id: uuid.UUID, payload: PowerPurchaseStatusUpdate, db: Session = Depends(get_db)):
    service = PowerPurchaseService(db)
    return {"data": service.update_status(id, payload.status)}


@router.delete("/{id}", status_code=204, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def delete_power_purchase(id: uuid.UUID, db: Session = Depends(get_db)):
    service = PowerPurchaseService(db)
    service.delete(id)
