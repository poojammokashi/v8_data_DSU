from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.db.init_db import seed_super_admin
from app.db.session import SessionLocal
from app.middleware.error_handler_middleware import register_exception_handlers
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limiter import register_rate_limiter

configure_logging()
logger = get_logger("app.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info(f"Starting {settings.APP_NAME} ({settings.APP_ENV})")
    db = SessionLocal()
    try:
        seed_super_admin(db)
    finally:
        db.close()

    yield

    # --- Shutdown ---
    logger.info("Shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description="Electricity Management Dashboard API — Power Purchase, Open Access, "
        "Generation, Consumption, Billing & Settlement, Analytics, and Alerts.",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # --- CORS ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # --- Custom middleware (order matters: outermost added last runs first) ---
    app.add_middleware(LoggingMiddleware)

    # --- Rate limiting ---
    register_rate_limiter(app)

    # --- Exception handlers ---
    register_exception_handlers(app)

    # --- Routes ---
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["Health"])
    def health_check():
        """Liveness/readiness probe for load balancers and orchestrators."""
        return {"status": "ok", "service": settings.APP_NAME, "env": settings.APP_ENV}

    return app


app = create_app()
