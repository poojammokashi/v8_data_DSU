import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


from app.schemas.common import ORMBaseSchema


class BillingCreate(BaseModel):
    period_start: date
    period_end: date
    feeder_id: Optional[uuid.UUID] = None
    units_consumed_mu: Decimal = Field(gt=0, decimal_places=3)
    rate_per_unit: Decimal = Field(gt=0, decimal_places=4)
    due_date: date


class BillingRead(ORMBaseSchema):
    id: uuid.UUID
    period_start: date
    period_end: date
    feeder_id: Optional[uuid.UUID] = None
    units_consumed_mu: Decimal
    rate_per_unit: Decimal
    amount: Decimal
    due_date: date
    status: str
    created_at: datetime


class SettlementCreate(BaseModel):
    billing_id: uuid.UUID
    paid_amount: Decimal = Field(gt=0, decimal_places=2)
    settlement_date: date
    reference_number: Optional[str] = Field(default=None, max_length=100)


class SettlementStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|processing|completed|failed)$")


class SettlementRead(ORMBaseSchema):
    id: uuid.UUID
    billing_id: uuid.UUID
    paid_amount: Decimal
    settlement_date: date
    reference_number: Optional[str] = None
    status: str
    created_at: datetime


class MonthlyBillingPoint(BaseModel):
    month: date
    billed: float
    settled: float
