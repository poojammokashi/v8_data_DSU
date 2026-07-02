import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.permissions import Permission
from app.models.user import User
from app.schemas.alert import (
    AcknowledgeAlertRequest,
    AlertNotificationRead,
    AlertRuleCreate,
    AlertRuleRead,
    AlertRuleUpdate,
)
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.services.alert_service import AlertEvaluationService, AlertNotificationService, AlertRuleService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# --- Rule configuration (Admin) ---

@router.get(
    "/rules", response_model=SuccessResponse[list[AlertRuleRead]],
    dependencies=[Depends(require_permission(Permission.ALERTS_VIEW))],
)
def list_alert_rules(db: Session = Depends(get_db)):
    service = AlertRuleService(db)
    return {"data": service.list_all()}


@router.post(
    "/rules", response_model=SuccessResponse[AlertRuleRead], status_code=201,
    dependencies=[Depends(require_permission(Permission.ALERTS_MANAGE))],
)
def create_alert_rule(payload: AlertRuleCreate, db: Session = Depends(get_db)):
    service = AlertRuleService(db)
    return {"data": service.create(payload)}


@router.put(
    "/rules/{id}", response_model=SuccessResponse[AlertRuleRead],
    dependencies=[Depends(require_permission(Permission.ALERTS_MANAGE))],
)
def update_alert_rule(id: uuid.UUID, payload: AlertRuleUpdate, db: Session = Depends(get_db)):
    service = AlertRuleService(db)
    return {"data": service.update(id, payload)}


@router.delete(
    "/rules/{id}", status_code=204,
    dependencies=[Depends(require_permission(Permission.ALERTS_MANAGE))],
)
def delete_alert_rule(id: uuid.UUID, db: Session = Depends(get_db)):
    service = AlertRuleService(db)
    service.delete(id)


@router.post(
    "/rules/evaluate", response_model=SuccessResponse[dict],
    dependencies=[Depends(require_permission(Permission.ALERTS_MANAGE))],
)
def evaluate_alert_rules(db: Session = Depends(get_db)):
    """
    Manual trigger for the evaluation engine. In production this also runs
    automatically after each data ingestion (see app/tasks/alert_evaluation.py).
    """
    service = AlertEvaluationService(db)
    triggered = service.evaluate_all_rules()
    return {"data": {"triggered_count": len(triggered)}}


# --- Notifications (everyone views their own feed) ---

@router.get(
    "/notifications", response_model=PaginatedResponse[AlertNotificationRead],
    dependencies=[Depends(require_permission(Permission.ALERTS_VIEW))],
)
def list_notifications(
    severity: str | None = Query(None),
    acknowledged: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = AlertNotificationService(db)
    rows, total = service.list(severity=severity, acknowledged=acknowledged, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@router.put(
    "/notifications/{id}/acknowledge", response_model=SuccessResponse[AlertNotificationRead],
    dependencies=[Depends(require_permission(Permission.ALERTS_VIEW))],
)
def acknowledge_notification(
    id: uuid.UUID,
    payload: AcknowledgeAlertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AlertNotificationService(db)
    return {"data": service.acknowledge(id, acknowledged_by_id=current_user.id)}
