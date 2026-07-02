import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_permission
from app.core.permissions import Permission
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.schemas.energy_data import (
    ConsumptionCreate,
    ConsumptionRead,
    FeederConsumptionPoint,
    GenerationCreate,
    GenerationRead,
    PeakDemandCreate,
    PeakDemandRead,
    SourceMixPoint,
)
from app.services.energy_data_service import ConsumptionService, GenerationService, PeakDemandService

generation_router = APIRouter(prefix="/generation", tags=["Generation"])
consumption_router = APIRouter(prefix="/consumption", tags=["Consumption"])
peak_demand_router = APIRouter(prefix="/peak-demand", tags=["Peak Demand"])


# --- Generation ---

@generation_router.get("/", response_model=PaginatedResponse[GenerationRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def list_generation(
    date_from: date = Query(...), date_to: date = Query(...), plant_id: uuid.UUID | None = Query(None),
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db),
):
    service = GenerationService(db)
    rows, total = service.list(date_from=date_from, date_to=date_to, plant_id=plant_id, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@generation_router.post("/", response_model=SuccessResponse[GenerationRead], status_code=201, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def create_generation(payload: GenerationCreate, db: Session = Depends(get_db)):
    service = GenerationService(db)
    return {"data": service.create(payload)}


@generation_router.get("/source-wise", response_model=SuccessResponse[list[SourceMixPoint]], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_generation_source_mix(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = GenerationService(db)
    return {"data": service.get_source_wise_mix(date_from=date_from, date_to=date_to)}


# --- Consumption ---

@consumption_router.get("/", response_model=PaginatedResponse[ConsumptionRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def list_consumption(
    date_from: date = Query(...), date_to: date = Query(...), feeder_id: uuid.UUID | None = Query(None),
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db),
):
    service = ConsumptionService(db)
    rows, total = service.list(date_from=date_from, date_to=date_to, feeder_id=feeder_id, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@consumption_router.post("/", response_model=SuccessResponse[ConsumptionRead], status_code=201, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def create_consumption(payload: ConsumptionCreate, db: Session = Depends(get_db)):
    service = ConsumptionService(db)
    return {"data": service.create(payload)}


@consumption_router.get("/by-feeder", response_model=SuccessResponse[list[FeederConsumptionPoint]], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_consumption_by_feeder(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = ConsumptionService(db)
    return {"data": service.get_by_feeder(date_from=date_from, date_to=date_to)}


# --- Peak demand ---

@peak_demand_router.get("/", response_model=PaginatedResponse[PeakDemandRead], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def list_peak_demand(
    date_from: date = Query(...), date_to: date = Query(...), feeder_id: uuid.UUID | None = Query(None),
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db),
):
    service = PeakDemandService(db)
    rows, total = service.list(date_from=date_from, date_to=date_to, feeder_id=feeder_id, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@peak_demand_router.post("/", response_model=SuccessResponse[PeakDemandRead], status_code=201, dependencies=[Depends(require_permission(Permission.ENERGY_DATA_WRITE))])
def create_peak_demand(payload: PeakDemandCreate, db: Session = Depends(get_db)):
    service = PeakDemandService(db)
    return {"data": service.create(payload)}


@peak_demand_router.get("/trend", response_model=SuccessResponse[list[dict]], dependencies=[Depends(require_permission(Permission.ENERGY_DATA_VIEW))])
def get_peak_demand_trend(date_from: date = Query(...), date_to: date = Query(...), db: Session = Depends(get_db)):
    service = PeakDemandService(db)
    return {"data": service.get_trend(date_from=date_from, date_to=date_to)}
