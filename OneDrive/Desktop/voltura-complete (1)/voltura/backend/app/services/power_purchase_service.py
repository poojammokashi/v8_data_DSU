import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.power_purchase import PowerPurchase, PowerPurchaseStatus
from app.repositories.power_purchase_repository import PowerPurchaseRepository
from app.schemas.power_purchase import PowerPurchaseCreate, PowerPurchaseUpdate


class PowerPurchaseService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PowerPurchaseRepository(db)

    def list(self, **filters):
        return self.repo.search(**filters)

    def get(self, id: uuid.UUID) -> PowerPurchase:
        obj = self.repo.get_by_id(id)
        if not obj:
            raise NotFoundError("Power purchase record", id)
        return obj

    def create(self, payload: PowerPurchaseCreate, created_by_id: uuid.UUID) -> PowerPurchase:
        amount = payload.quantity_mu * payload.rate_per_unit
        obj = PowerPurchase(
            source_id=payload.source_id,
            date=payload.date,
            quantity_mu=payload.quantity_mu,
            rate_per_unit=payload.rate_per_unit,
            amount=amount,
            remarks=payload.remarks,
            created_by_id=created_by_id,
            status=PowerPurchaseStatus.DRAFT,
        )
        self.repo.create(obj)
        self.db.commit()
        return obj

    def update(self, id: uuid.UUID, payload: PowerPurchaseUpdate) -> PowerPurchase:
        obj = self.get(id)

        if obj.status == PowerPurchaseStatus.SETTLED:
            raise BusinessRuleError("Cannot modify a settled power purchase record")

        update_data = payload.model_dump(exclude_unset=True)
        # Recompute amount if either factor changed
        new_quantity = update_data.get("quantity_mu", obj.quantity_mu)
        new_rate = update_data.get("rate_per_unit", obj.rate_per_unit)
        update_data["amount"] = new_quantity * new_rate

        self.repo.update(obj, **update_data)
        self.db.commit()
        return obj

    def update_status(self, id: uuid.UUID, status: str) -> PowerPurchase:
        obj = self.get(id)
        new_status = PowerPurchaseStatus(status)

        if obj.status == PowerPurchaseStatus.SETTLED and new_status != PowerPurchaseStatus.SETTLED:
            raise BusinessRuleError("A settled record cannot be reverted to a previous status")

        self.repo.update(obj, status=new_status)
        self.db.commit()
        return obj

    def delete(self, id: uuid.UUID) -> None:
        obj = self.get(id)
        if obj.status == PowerPurchaseStatus.SETTLED:
            raise BusinessRuleError("Cannot delete a settled power purchase record")
        self.repo.soft_delete(obj)
        self.db.commit()

    def get_summary(self, *, date_from: date, date_to: date) -> dict:
        return self.repo.get_summary(date_from=date_from, date_to=date_to)

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_daily_trend(date_from=date_from, date_to=date_to)
