import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.billing import Billing, BillingStatus, Settlement, SettlementStatus
from app.repositories.billing_repository import BillingRepository
from app.schemas.billing import BillingCreate, SettlementCreate


class BillingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BillingRepository(db)

    def list(self, **filters):
        return self.repo.search(**filters)

    def get(self, id: uuid.UUID) -> Billing:
        obj = self.repo.get_by_id(id)
        if not obj:
            raise NotFoundError("Billing record", id)
        return obj

    def create(self, payload: BillingCreate) -> Billing:
        amount = payload.units_consumed_mu * payload.rate_per_unit
        obj = Billing(
            period_start=payload.period_start,
            period_end=payload.period_end,
            feeder_id=payload.feeder_id,
            units_consumed_mu=payload.units_consumed_mu,
            rate_per_unit=payload.rate_per_unit,
            amount=amount,
            due_date=payload.due_date,
            status=BillingStatus.PENDING,
        )
        self.repo.create(obj)
        self.db.commit()
        return obj

    def finalize(self, id: uuid.UUID) -> Billing:
        """Locks a draft bill into pending — no further amount edits after this."""
        obj = self.get(id)
        if obj.status != BillingStatus.DRAFT:
            raise BusinessRuleError("Only draft bills can be finalized")
        self.repo.update(obj, status=BillingStatus.PENDING)
        self.db.commit()
        return obj

    def get_outstanding_amount(self) -> float:
        return self.repo.get_outstanding_amount()

    def get_monthly_billed_vs_settled(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_monthly_billed_vs_settled(date_from=date_from, date_to=date_to)

    def record_settlement(self, payload: SettlementCreate) -> Settlement:
        billing = self.get(payload.billing_id)
        if billing.status == BillingStatus.SETTLED:
            raise BusinessRuleError("This bill has already been settled")

        settlement = Settlement(
            billing_id=payload.billing_id,
            paid_amount=payload.paid_amount,
            settlement_date=payload.settlement_date,
            reference_number=payload.reference_number,
            status=SettlementStatus.COMPLETED,
        )
        self.db.add(settlement)

        # Mark the parent bill settled once the paid amount covers it in full
        if payload.paid_amount >= billing.amount:
            billing.status = BillingStatus.SETTLED

        self.db.commit()
        self.db.refresh(settlement)
        return settlement

    def update_settlement_status(self, settlement_id: uuid.UUID, status: str) -> Settlement:
        settlement = self.db.get(Settlement, settlement_id)
        if not settlement:
            raise NotFoundError("Settlement", settlement_id)
        settlement.status = SettlementStatus(status)
        self.db.commit()
        self.db.refresh(settlement)
        return settlement
