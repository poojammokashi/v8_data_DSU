import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBaseSchema


# --- Generation ---

class GenerationCreate(BaseModel):
    plant_id: uuid.UUID
    date: date
    time_block: Optional[int] = Field(default=None, ge=1, le=96)
    quantity_mwh: Decimal = Field(gt=0, decimal_places=3)


class GenerationRead(ORMBaseSchema):
    id: uuid.UUID
    plant_id: uuid.UUID
    date: date
    time_block: Optional[int] = None
    quantity_mwh: Decimal
    created_at: datetime


class SourceMixPoint(BaseModel):
    source_type: str
    source_name: str
    quantity_mwh: float


# --- Consumption ---

class ConsumptionCreate(BaseModel):
    feeder_id: uuid.UUID
    date: date
    time_block: Optional[int] = Field(default=None, ge=1, le=96)
    quantity_mwh: Decimal = Field(gt=0, decimal_places=3)


class ConsumptionRead(ORMBaseSchema):
    id: uuid.UUID
    feeder_id: uuid.UUID
    date: date
    time_block: Optional[int] = None
    quantity_mwh: Decimal
    created_at: datetime


class FeederConsumptionPoint(BaseModel):
    feeder_name: str
    quantity_mwh: float


# --- Peak demand ---

class PeakDemandCreate(BaseModel):
    feeder_id: uuid.UUID
    date: date
    time_block: Optional[int] = Field(default=None, ge=1, le=96)
    demand_mw: Decimal = Field(gt=0, decimal_places=3)


class PeakDemandRead(ORMBaseSchema):
    id: uuid.UUID
    feeder_id: uuid.UUID
    date: date
    time_block: Optional[int] = None
    demand_mw: Decimal
    created_at: datetime
