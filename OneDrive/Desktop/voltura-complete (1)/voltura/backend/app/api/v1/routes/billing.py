import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_permission
from app.core.permissions import Permission
from app.schemas.billing import (
    BillingCreate,
    BillingRead,
    MonthlyBillingPoint,
    SettlementCreate,
    SettlementRead,
    SettlementStatusUpdate,
)
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.services.billing_service import BillingService

router = APIRouter(prefix="/billing", tags=["Billing"])
settlement_router = APIRouter(prefix="/settlement", tags=["Settlement"])


@router.get("/", response_model=PaginatedResponse[BillingRead], dependencies=[Depends(require_permission(Permission.BILLING_VIEW))])
def list_billing(
    status: str | None = Query(None), page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = BillingService(db)
    rows, total = service.list(status=status, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@router.get("/monthly-summary", response_model=SuccessResponse[list[MonthlyBillingPoint]], dependencies=[Depends(require_permission(Permission.BILLING_VIEW))])
def get_monthly_billing_summary(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.get_monthly_billed_vs_settled(date_from=date_from, date_to=date_to)}


@router.get("/{id}", response_model=SuccessResponse[BillingRead], dependencies=[Depends(require_permission(Permission.BILLING_VIEW))])
def get_billing(id: uuid.UUID, db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.get(id)}


@router.post("/", response_model=SuccessResponse[BillingRead], status_code=201, dependencies=[Depends(require_permission(Permission.BILLING_WRITE))])
def create_billing(payload: BillingCreate, db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.create(payload)}


@router.post("/{id}/finalize", response_model=SuccessResponse[BillingRead], dependencies=[Depends(require_permission(Permission.BILLING_WRITE))])
def finalize_billing(id: uuid.UUID, db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.finalize(id)}


# --- Settlement ---

@settlement_router.post("/", response_model=SuccessResponse[SettlementRead], status_code=201, dependencies=[Depends(require_permission(Permission.SETTLEMENT_WRITE))])
def create_settlement(payload: SettlementCreate, db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.record_settlement(payload)}


@settlement_router.put("/{id}/status", response_model=SuccessResponse[SettlementRead], dependencies=[Depends(require_permission(Permission.SETTLEMENT_WRITE))])
def update_settlement_status(id: uuid.UUID, payload: SettlementStatusUpdate, db: Session = Depends(get_db)):
    service = BillingService(db)
    return {"data": service.update_settlement_status(id, payload.status)}
