import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ORMBaseSchema


class PowerPurchaseCreate(BaseModel):
    source_id: uuid.UUID
    date: date
    quantity_mu: Decimal = Field(gt=0, decimal_places=3)
    rate_per_unit: Decimal = Field(gt=0, decimal_places=4)
    remarks: Optional[str] = Field(default=None, max_length=500)

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Transaction date cannot be in the future")
        return v


class PowerPurchaseUpdate(BaseModel):
    quantity_mu: Optional[Decimal] = Field(default=None, gt=0, decimal_places=3)
    rate_per_unit: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    remarks: Optional[str] = Field(default=None, max_length=500)


class PowerPurchaseStatusUpdate(BaseModel):
    status: str = Field(pattern="^(draft|approved|rejected|settled)$")


class PowerPurchaseRead(ORMBaseSchema):
    id: uuid.UUID
    source_id: uuid.UUID
    date: date
    quantity_mu: Decimal
    rate_per_unit: Decimal
    amount: Decimal
    status: str
    remarks: Optional[str] = None
    created_at: datetime


class PowerPurchaseSummary(BaseModel):
    total_quantity_mu: float
    total_amount: float
    transaction_count: int


class DailyTrendPoint(BaseModel):
    date: date
    quantity_mu: Optional[float] = None
    quantity_mwh: Optional[float] = None
