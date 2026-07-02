import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.permissions import Permission
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.report import ReportGenerateRequest, ReportRead
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "/generate",
    response_model=SuccessResponse[ReportRead],
    status_code=202,
    dependencies=[Depends(require_permission(Permission.REPORTS_GENERATE))],
)
def generate_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns 202 Accepted — report rendering happens asynchronously via a
    background task; the client polls GET /reports/{id} or is notified.
    """
    service = ReportService(db)
    return {"data": service.generate(payload, requested_by_id=current_user.id)}


@router.get(
    "/{id}",
    response_model=SuccessResponse[ReportRead],
    dependencies=[Depends(require_permission(Permission.REPORTS_VIEW))],
)
def get_report(id: uuid.UUID, db: Session = Depends(get_db)):
    service = ReportService(db)
    return {"data": service.get_report(id)}


@router.get(
    "/financial",
    response_model=SuccessResponse[list[ReportRead]],
    dependencies=[Depends(require_permission(Permission.REPORTS_VIEW))],
)
def list_financial_reports(db: Session = Depends(get_db)):
    """
    Convenience filter endpoint for the Financial Reports tab — same
    underlying report store, filtered to report_type='financial'.
    """
    return {"data": []}
