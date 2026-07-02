"""
Background task for report rendering. ReportService.generate() (see
app/services/report_service.py) returns immediately with status="processing"
— this module is where the actual PDF/Excel rendering would run, invoked
asynchronously (FastAPI BackgroundTasks for low volume, or a real task
queue like Celery/RQ once report volume justifies it).

Not yet wired to a persistence layer: ReportService currently has no
`reports` table to update on completion (see the TODO in report_service.py).
This task is structured so that wiring it in later is a matter of replacing
the two TODO-marked lines below, without changing the calling convention.
"""

from app.core.logging import get_logger

logger = get_logger("app.tasks.report_generation")


def render_report(*, report_id: str, report_type: str, date_from: str, date_to: str) -> None:
    """
    Renders the requested report to a file and (once a reports table
    exists) updates its status to "approved" with a populated file_path,
    or "draft" with an error note on failure.
    """
    logger.info(f"Rendering report {report_id} ({report_type}, {date_from} to {date_to})")

    try:
        # TODO: query the relevant repositories for the date range, build a
        # PDF/Excel via the pdf/xlsx generation utilities, and save it to
        # durable storage (S3, local disk, etc).
        file_path = f"/files/reports/{report_id}.pdf"

        # TODO: once a `reports` table exists, update its row here:
        #   report = report_repo.get_by_id(report_id)
        #   report.status = "approved"
        #   report.generated_at = datetime.now(timezone.utc)
        #   report.file_path = file_path
        #   db.commit()

        logger.info(f"Report {report_id} rendered to {file_path}")
    except Exception:
        logger.exception(f"Report {report_id} failed to render")
        raise
