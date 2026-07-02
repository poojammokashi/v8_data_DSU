import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBaseSchema


class AlertRuleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    metric: str = Field(pattern="^(peak_demand|consumption|generation|outstanding_billing)$")
    condition: str = Field(pattern="^(gt|lt|eq)$")
    threshold: Decimal
    severity: str = Field(pattern="^(critical|warning|info)$")
    is_active: bool = True


class AlertRuleUpdate(BaseModel):
    threshold: Optional[Decimal] = None
    is_active: Optional[bool] = None


class AlertRuleRead(ORMBaseSchema):
    id: uuid.UUID
    name: str
    metric: str
    condition: str
    threshold: Decimal
    severity: str
    is_active: bool


class AlertNotificationRead(ORMBaseSchema):
    id: uuid.UUID
    rule_id: uuid.UUID
    title: str
    triggered_value: Decimal
    triggered_at: datetime
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    rule: AlertRuleRead


class AcknowledgeAlertRequest(BaseModel):
    note: Optional[str] = Field(default=None, max_length=500)
