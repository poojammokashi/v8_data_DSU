import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.generation import EnergyGeneration
from app.models.consumption import PowerConsumption
from app.models.peak_demand import PeakDemand
from app.repositories.generation_repository import GenerationRepository
from app.repositories.consumption_repository import ConsumptionRepository
from app.repositories.peak_demand_repository import PeakDemandRepository
from app.schemas.energy_data import ConsumptionCreate, GenerationCreate, PeakDemandCreate


class GenerationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = GenerationRepository(db)

    def list(self, **filters):
        return self.repo.list_by_range(**filters)

    def create(self, payload: GenerationCreate) -> EnergyGeneration:
        obj = EnergyGeneration(**payload.model_dump())
        self.repo.create(obj)
        self.db.commit()
        return obj

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_daily_trend(date_from=date_from, date_to=date_to)

    def get_source_wise_mix(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_source_wise_mix(date_from=date_from, date_to=date_to)

    def get_total(self, *, date_from: date, date_to: date) -> float:
        return self.repo.get_total(date_from=date_from, date_to=date_to)


class ConsumptionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ConsumptionRepository(db)

    def list(self, **filters):
        return self.repo.list_by_range(**filters)

    def create(self, payload: ConsumptionCreate) -> PowerConsumption:
        obj = PowerConsumption(**payload.model_dump())
        self.repo.create(obj)
        self.db.commit()
        return obj

    def get_daily_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_daily_trend(date_from=date_from, date_to=date_to)

    def get_by_feeder(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_by_feeder(date_from=date_from, date_to=date_to)

    def get_total(self, *, date_from: date, date_to: date) -> float:
        return self.repo.get_total(date_from=date_from, date_to=date_to)


class PeakDemandService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PeakDemandRepository(db)

    def list(self, **filters):
        return self.repo.list_by_range(**filters)

    def create(self, payload: PeakDemandCreate) -> PeakDemand:
        obj = PeakDemand(**payload.model_dump())
        self.repo.create(obj)
        self.db.commit()
        return obj

    def get_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        return self.repo.get_trend(date_from=date_from, date_to=date_to)

    def get_current_peak(self, *, date_from: date, date_to: date) -> float:
        return self.repo.get_current_peak(date_from=date_from, date_to=date_to)
