from fastapi import APIRouter

from app.api.v1.routes import (
    alerts,
    analytics,
    audit,
    auth,
    billing,
    energy_data,
    open_access,
    power_purchase,
    reports,
    uploads,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(power_purchase.router)
api_router.include_router(open_access.router)
api_router.include_router(energy_data.generation_router)
api_router.include_router(energy_data.consumption_router)
api_router.include_router(energy_data.peak_demand_router)
api_router.include_router(billing.router)
api_router.include_router(billing.settlement_router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)
api_router.include_router(alerts.router)
api_router.include_router(uploads.router)
api_router.include_router(audit.router)
