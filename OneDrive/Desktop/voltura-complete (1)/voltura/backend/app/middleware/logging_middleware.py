import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logging import get_logger, request_id_ctx

logger = get_logger("app.request")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Assigns a correlation ID to every request (propagated via contextvar so
    every log line emitted during the request — including from deep inside
    a service — carries it), and logs a single structured access-log line
    per request with method, path, status, and duration.
    """

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        token = request_id_ctx.set(request_id)

        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.exception(
                "Unhandled exception",
                extra={"method": request.method, "path": request.url.path, "duration_ms": duration_ms},
            )
            raise
        finally:
            request_id_ctx.reset(token)

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Request-ID"] = request_id

        log_level = logger.warning if response.status_code >= 400 else logger.info
        log_level(
            f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )

        return response
