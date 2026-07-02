from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_permission
from app.core.permissions import Permission
from app.schemas.analytics import DashboardSummary
from app.schemas.common import SuccessResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/dashboard-summary",
    response_model=SuccessResponse[DashboardSummary],
    dependencies=[Depends(require_permission(Permission.DASHBOARD_VIEW))],
)
def get_dashboard_summary(
    date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)
):
    """
    Powers the Dashboard Overview KPI cards. Kept separate from the raw list
    endpoints (GET /power-purchase, etc.) so the dashboard doesn't force a
    full paginated fetch just to show six numbers.
    """
    service = AnalyticsService(db)
    return {"data": service.get_dashboard_summary(date_from=date_from, date_to=date_to)}


@router.get(
    "/combined-trend",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permission(Permission.ANALYTICS_VIEW))],
)
def get_combined_trend(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    """Purchase + generation + consumption merged into one chart-ready series."""
    service = AnalyticsService(db)
    return {"data": service.get_combined_trend(date_from=date_from, date_to=date_to)}


@router.get(
    "/daily",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permission(Permission.ANALYTICS_VIEW))],
)
def get_daily_analytics(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return {"data": service.get_combined_trend(date_from=date_from, date_to=date_to)}


@router.get(
    "/monthly",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permission(Permission.ANALYTICS_VIEW))],
)
def get_monthly_analytics(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    """
    Same underlying series as /daily — period bucketing (day vs month vs
    year) is a presentation concern the frontend already handles via its
    period tabs; the backend always returns the finest-grained series and
    lets the client aggregate, avoiding three near-duplicate endpoints.
    """
    service = AnalyticsService(db)
    return {"data": service.get_combined_trend(date_from=date_from, date_to=date_to)}


@router.get(
    "/yearly",
    response_model=SuccessResponse[list[dict]],
    dependencies=[Depends(require_permission(Permission.ANALYTICS_VIEW))],
)
def get_yearly_analytics(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return {"data": service.get_combined_trend(date_from=date_from, date_to=date_to)}
