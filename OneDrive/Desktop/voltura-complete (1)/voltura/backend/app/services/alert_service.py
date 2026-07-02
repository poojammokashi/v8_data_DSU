import uuid
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.alert import AlertCondition, AlertMetric, AlertNotification, AlertRule
from app.repositories.alert_repository import AlertNotificationRepository, AlertRuleRepository
from app.repositories.consumption_repository import ConsumptionRepository
from app.repositories.generation_repository import GenerationRepository
from app.repositories.peak_demand_repository import PeakDemandRepository
from app.repositories.billing_repository import BillingRepository
from app.schemas.alert import AlertRuleCreate, AlertRuleUpdate


def _condition_met(condition: AlertCondition, value: float, threshold: float) -> bool:
    if condition == AlertCondition.GREATER_THAN:
        return value > threshold
    if condition == AlertCondition.LESS_THAN:
        return value < threshold
    return value == threshold


class AlertRuleService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AlertRuleRepository(db)

    def list_all(self) -> list[AlertRule]:
        stmt_rows, _ = self.repo.list(page=1, page_size=100)
        return list(stmt_rows)

    def get(self, id: uuid.UUID) -> AlertRule:
        obj = self.repo.get_by_id(id)
        if not obj:
            raise NotFoundError("Alert rule", id)
        return obj

    def create(self, payload: AlertRuleCreate) -> AlertRule:
        obj = AlertRule(**payload.model_dump())
        self.repo.create(obj)
        self.db.commit()
        return obj

    def update(self, id: uuid.UUID, payload: AlertRuleUpdate) -> AlertRule:
        obj = self.get(id)
        update_data = payload.model_dump(exclude_unset=True)
        self.repo.update(obj, **update_data)
        self.db.commit()
        return obj

    def delete(self, id: uuid.UUID) -> None:
        obj = self.get(id)
        self.repo.delete(obj)
        self.db.commit()


class AlertEvaluationService:
    """
    The rule evaluation engine. Intended to run on a schedule (background
    task / cron) after each data ingestion — checks every active rule
    against the latest metric value and creates a notification if breached.
    """

    def __init__(self, db: Session):
        self.db = db
        self.rule_repo = AlertRuleRepository(db)
        self.notification_repo = AlertNotificationRepository(db)
        self.consumption_repo = ConsumptionRepository(db)
        self.generation_repo = GenerationRepository(db)
        self.peak_demand_repo = PeakDemandRepository(db)
        self.billing_repo = BillingRepository(db)

    def _get_latest_metric_value(self, metric: AlertMetric, check_date: date) -> float:
        if metric == AlertMetric.PEAK_DEMAND:
            return self.peak_demand_repo.get_current_peak(date_from=check_date, date_to=check_date)
        if metric == AlertMetric.CONSUMPTION:
            return self.consumption_repo.get_total(date_from=check_date, date_to=check_date)
        if metric == AlertMetric.GENERATION:
            return self.generation_repo.get_total(date_from=check_date, date_to=check_date)
        if metric == AlertMetric.OUTSTANDING_BILLING:
            return self.billing_repo.get_outstanding_amount()
        return 0.0

    def evaluate_all_rules(self, *, check_date: date | None = None) -> list[AlertNotification]:
        check_date = check_date or datetime.now(timezone.utc).date()
        triggered: list[AlertNotification] = []

        for rule in self.rule_repo.list_active():
            value = self._get_latest_metric_value(rule.metric, check_date)

            if _condition_met(rule.condition, value, float(rule.threshold)):
                notification = AlertNotification(
                    rule_id=rule.id,
                    title=self._build_title(rule, value),
                    triggered_value=value,
                    triggered_at=datetime.now(timezone.utc),
                    acknowledged=False,
                )
                self.db.add(notification)
                triggered.append(notification)

        if triggered:
            self.db.commit()

        return triggered

    @staticmethod
    def _build_title(rule: AlertRule, value: float) -> str:
        metric_label = rule.metric.value.replace("_", " ").title()
        return f"{metric_label} {rule.condition.value} {rule.threshold} — current value {value:.2f}"


class AlertNotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AlertNotificationRepository(db)

    def list(self, **filters):
        return self.repo.search(**filters)

    def acknowledge(self, id: uuid.UUID, acknowledged_by_id: uuid.UUID) -> AlertNotification:
        obj = self.repo.get_by_id(id)
        if not obj:
            raise NotFoundError("Alert notification", id)

        obj.acknowledged = True
        obj.acknowledged_by_id = acknowledged_by_id
        obj.acknowledged_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def count_unacknowledged(self) -> int:
        return self.repo.count_unacknowledged()
