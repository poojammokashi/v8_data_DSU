"""
Background task for alert evaluation. In production this is invoked on a
schedule (e.g. APScheduler, Celery beat, or a cron-triggered script calling
this module) after each data ingestion cycle, so newly uploaded data is
checked against active alert rules without requiring a manual API call.

The manual trigger remains available at POST /alerts/rules/evaluate for
on-demand checks; this module is the unattended path.
"""

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.services.alert_service import AlertEvaluationService

logger = get_logger("app.tasks.alert_evaluation")


def run_alert_evaluation() -> int:
    """
    Evaluate all active alert rules against the latest data and create
    notifications for any breaches. Returns the number of alerts triggered.
    Safe to call repeatedly — re-evaluating an already-breached condition
    creates a new notification each time it's called, by design, so callers
    (the scheduler) control the cadence rather than this function debouncing
    internally.
    """
    db = SessionLocal()
    try:
        service = AlertEvaluationService(db)
        triggered = service.evaluate_all_rules()
        if triggered:
            logger.info(f"Alert evaluation: {len(triggered)} new notification(s) created")
        return len(triggered)
    except Exception:
        logger.exception("Alert evaluation task failed")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Allows running as a standalone script: python -m app.tasks.alert_evaluation
    # (e.g. from a cron entry or container scheduled job).
    run_alert_evaluation()
