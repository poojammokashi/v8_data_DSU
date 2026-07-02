from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException
from app.core.logging import get_logger

logger = get_logger("app.errors")


def _error_response(status_code: int, code: str, message: str, details=None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": {"code": code, "message": message, "details": details}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Single place every exception type is mapped to an HTTP response.
    Routes never write their own try/except — they let domain exceptions
    (raised by services) propagate up to here.
    """

    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException):
        if exc.status_code >= 500:
            logger.error(f"{exc.error_code}: {exc.message}", exc_info=True)
        return _error_response(exc.status_code, exc.error_code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        # Pydantic/FastAPI request validation (bad query params, malformed body, etc.)
        details = [
            {"field": ".".join(str(p) for p in err["loc"]), "message": err["msg"]} for err in exc.errors()
        ]
        return _error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", "Request validation failed", details
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException):
        # Covers HTTPException raised directly in routes (e.g. file-size 413)
        return _error_response(exc.status_code, "HTTP_ERROR", str(exc.detail))

    @app.exception_handler(Exception)
    async def handle_unhandled_exception(request: Request, exc: Exception):
        logger.exception("Unhandled exception")
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "An unexpected error occurred. Please try again.",
        )
