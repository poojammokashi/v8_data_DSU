import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.open_access import OpenAccessStatus, OpenAccessTransaction
from app.repositories.open_access_repository import OpenAccessRepository
from app.schemas.open_access import OpenAccessCreate, OpenAccessUpdate


class OpenAccessService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OpenAccessRepository(db)

    def list(self, **filters):
        return self.repo.search(**filters)

    def get(self, id: uuid.UUID) -> OpenAccessTransaction:
        obj = self.repo.get_by_id(id)
        if not obj:
            raise NotFoundError("Open access transaction", id)
        return obj

    def create(self, payload: OpenAccessCreate, created_by_id: uuid.UUID) -> OpenAccessTransaction:
        total_charges = payload.wheeling_charges + payload.transmission_charges
        obj = OpenAccessTransaction(
            date=payload.date,
            consumer_name=payload.consumer_name,
            generator_id=payload.generator_id,
            quantity_mu=payload.quantity_mu,
            wheeling_charges=payload.wheeling_charges,
            transmission_charges=payload.transmission_charges,
            total_charges=total_charges,
            created_by_id=created_by_id,
            status=OpenAccessStatus.PENDING,
        )
        self.repo.create(obj)
        self.db.commit()
        return obj

    def update(self, id: uuid.UUID, payload: OpenAccessUpdate) -> OpenAccessTransaction:
        obj = self.get(id)
        if obj.status == OpenAccessStatus.SETTLED:
            raise BusinessRuleError("Cannot modify a settled open access transaction")

        update_data = payload.model_dump(exclude_unset=True)
        new_wheeling = update_data.get("wheeling_charges", obj.wheeling_charges)
        new_transmission = update_data.get("transmission_charges", obj.transmission_charges)
        update_data["total_charges"] = new_wheeling + new_transmission

        self.repo.update(obj, **update_data)
        self.db.commit()
        return obj

    def update_status(self, id: uuid.UUID, status: str) -> OpenAccessTransaction:
        obj = self.get(id)
        new_status = OpenAccessStatus(status)

        if obj.status == OpenAccessStatus.REJECTED and new_status == OpenAccessStatus.SETTLED:
            raise BusinessRuleError("A rejected transaction cannot be settled directly")

        self.repo.update(obj, status=new_status)
        self.db.commit()
        return obj

    def delete(self, id: uuid.UUID) -> None:
        obj = self.get(id)
        if obj.status == OpenAccessStatus.SETTLED:
            raise BusinessRuleError("Cannot delete a settled open access transaction")
        self.repo.soft_delete(obj)
        self.db.commit()

    def get_summary(self, *, date_from: date, date_to: date) -> dict:
        return self.repo.get_summary(date_from=date_from, date_to=date_to)
