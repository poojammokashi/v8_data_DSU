import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBaseSchema


class OpenAccessCreate(BaseModel):
    date: date
    consumer_name: str = Field(min_length=2, max_length=200)
    generator_id: Optional[uuid.UUID] = None
    quantity_mu: Decimal = Field(gt=0, decimal_places=3)
    wheeling_charges: Decimal = Field(default=Decimal("0"), ge=0, decimal_places=2)
    transmission_charges: Decimal = Field(default=Decimal("0"), ge=0, decimal_places=2)


class OpenAccessUpdate(BaseModel):
    quantity_mu: Optional[Decimal] = Field(default=None, gt=0, decimal_places=3)
    wheeling_charges: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    transmission_charges: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)


class OpenAccessStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|approved|rejected|settled)$")


class OpenAccessRead(ORMBaseSchema):
    id: uuid.UUID
    date: date
    consumer_name: str
    generator_id: Optional[uuid.UUID] = None
    quantity_mu: Decimal
    wheeling_charges: Decimal
    transmission_charges: Decimal
    total_charges: Decimal
    status: str
    created_at: datetime


class OpenAccessSummary(BaseModel):
    total_quantity_mu: float
    total_charges: float
    transaction_count: int
