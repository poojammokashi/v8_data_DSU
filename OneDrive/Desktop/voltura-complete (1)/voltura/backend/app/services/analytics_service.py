from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.repositories.alert_repository import AlertNotificationRepository
from app.repositories.billing_repository import BillingRepository
from app.repositories.consumption_repository import ConsumptionRepository
from app.repositories.generation_repository import GenerationRepository
from app.repositories.peak_demand_repository import PeakDemandRepository
from app.repositories.power_purchase_repository import PowerPurchaseRepository
from app.repositories.open_access_repository import OpenAccessRepository


def _percent_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None
    return round(((current - previous) / previous) * 100, 1)


class AnalyticsService:
    """
    Cross-domain aggregation — the one service allowed to read from many
    repositories at once, since dashboard/analytics summaries are inherently
    cross-cutting. Domain services stay single-repository; this one composes.
    """

    def __init__(self, db: Session):
        self.db = db
        self.power_purchase_repo = PowerPurchaseRepository(db)
        self.open_access_repo = OpenAccessRepository(db)
        self.generation_repo = GenerationRepository(db)
        self.consumption_repo = ConsumptionRepository(db)
        self.peak_demand_repo = PeakDemandRepository(db)
        self.billing_repo = BillingRepository(db)
        self.alert_repo = AlertNotificationRepository(db)

    def get_dashboard_summary(self, *, date_from: date, date_to: date) -> dict:
        period_length = (date_to - date_from).days + 1
        prev_date_to = date_from - timedelta(days=1)
        prev_date_from = prev_date_to - timedelta(days=period_length - 1)

        purchase_now = self.power_purchase_repo.get_summary(date_from=date_from, date_to=date_to)
        purchase_prev = self.power_purchase_repo.get_summary(date_from=prev_date_from, date_to=prev_date_to)

        generation_now = self.generation_repo.get_total(date_from=date_from, date_to=date_to)
        generation_prev = self.generation_repo.get_total(date_from=prev_date_from, date_to=prev_date_to)

        peak_now = self.peak_demand_repo.get_current_peak(date_from=date_from, date_to=date_to)
        peak_prev = self.peak_demand_repo.get_current_peak(date_from=prev_date_from, date_to=prev_date_to)

        open_access_now = self.open_access_repo.get_summary(date_from=date_from, date_to=date_to)
        open_access_prev = self.open_access_repo.get_summary(date_from=prev_date_from, date_to=prev_date_to)

        outstanding = self.billing_repo.get_outstanding_amount()
        active_alerts = self.alert_repo.count_unacknowledged()

        return {
            "power_purchase_mu": {
                "label": "Power Purchase",
                "value": purchase_now["total_quantity_mu"],
                "unit": "MU",
                "change_percent": _percent_change(purchase_now["total_quantity_mu"], purchase_prev["total_quantity_mu"]),
            },
            "generation_mwh": {
                "label": "Energy Generation",
                "value": generation_now,
                "unit": "MWh",
                "change_percent": _percent_change(generation_now, generation_prev),
            },
            "peak_demand_mw": {
                "label": "Peak Demand",
                "value": peak_now,
                "unit": "MW",
                "change_percent": _percent_change(peak_now, peak_prev),
            },
            "open_access_mu": {
                "label": "Open Access Volume",
                "value": open_access_now["total_quantity_mu"],
                "unit": "MU",
                "change_percent": _percent_change(
                    open_access_now["total_quantity_mu"], open_access_prev["total_quantity_mu"]
                ),
            },
            "outstanding_billing": {
                "label": "Outstanding Billing",
                "value": outstanding,
                "unit": "INR",
                "change_percent": None,
            },
            "active_alerts": {
                "label": "Active Alerts",
                "value": float(active_alerts),
                "unit": "count",
                "change_percent": None,
            },
        }

    def get_combined_trend(self, *, date_from: date, date_to: date) -> list[dict]:
        """Merges purchase/generation/consumption daily series into one chart-ready list."""
        purchase = {p["date"]: p["quantity_mu"] for p in self.power_purchase_repo.get_daily_trend(date_from=date_from, date_to=date_to)}
        generation = {p["date"]: p["quantity_mwh"] for p in self.generation_repo.get_daily_trend(date_from=date_from, date_to=date_to)}
        consumption = {p["date"]: p["quantity_mwh"] for p in self.consumption_repo.get_daily_trend(date_from=date_from, date_to=date_to)}

        all_dates = sorted(set(purchase) | set(generation) | set(consumption))
        return [
            {
                "date": d,
                "purchase": purchase.get(d, 0.0),
                "generation": generation.get(d, 0.0),
                "consumption": consumption.get(d, 0.0),
            }
            for d in all_dates
        ]
