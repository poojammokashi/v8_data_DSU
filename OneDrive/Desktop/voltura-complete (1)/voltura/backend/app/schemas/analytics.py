from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class DateRangeQuery(BaseModel):
    date_from: date
    date_to: date

    def model_post_init(self, __context) -> None:
        if self.date_from > self.date_to:
            raise ValueError("date_from must be before date_to")


class KpiCard(BaseModel):
    label: str
    value: float
    unit: str
    change_percent: Optional[float] = None


class DashboardSummary(BaseModel):
    power_purchase_mu: KpiCard
    generation_mwh: KpiCard
    peak_demand_mw: KpiCard
    open_access_mu: KpiCard
    outstanding_billing: KpiCard
    active_alerts: KpiCard


class AnalyticsPeriod(BaseModel):
    period: str = Field(pattern="^(daily|monthly|yearly)$")
    date_from: date
    date_to: date
