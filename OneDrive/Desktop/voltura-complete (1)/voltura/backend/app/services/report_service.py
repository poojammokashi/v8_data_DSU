import uuid
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.repositories.billing_repository import BillingRepository
from app.repositories.power_purchase_repository import PowerPurchaseRepository
from app.schemas.report import ReportGenerateRequest

REPORT_TYPE_LABELS = {
    "financial": "Monthly Financial Summary",
    "settlement": "Power Purchase Settlement",
    "open_access": "Open Access Transaction Log",
    "analytics": "Peak Demand Analysis",
    "generation": "Annual Generation Report",
}


class ReportService:
    """
    Generates report metadata + delegates the actual file rendering to a
    background task (app/tasks/report_generation.py) so the request returns
    immediately. The PDF/Excel rendering itself isn't business logic — it's
    handled by the pdf/xlsx generation utilities, kept out of this service.
    """

    def __init__(self, db: Session):
        self.db = db
        self.billing_repo = BillingRepository(db)
        self.power_purchase_repo = PowerPurchaseRepository(db)

    def generate(self, payload: ReportGenerateRequest, requested_by_id: uuid.UUID) -> dict:
        label = REPORT_TYPE_LABELS.get(payload.report_type, payload.report_type.title())
        name = f"{label} — {payload.date_from.isoformat()} to {payload.date_to.isoformat()}"

        # In production this would: (1) insert a `reports` row with status="processing",
        # (2) enqueue a background task that renders the file and updates status to
        # "approved"/"draft" with a file_path, (3) notify the user on completion.
        # Wired here as a synchronous stub returning a pending report descriptor.
        return {
            "id": uuid.uuid4(),
            "name": name,
            "report_type": payload.report_type,
            "status": "processing",
            "generated_at": None,
            "file_path": None,
        }

    def get_report(self, report_id: uuid.UUID) -> dict:
        # TODO: back this with a real `reports` table once report persistence is added
        raise NotFoundError("Report", report_id)
