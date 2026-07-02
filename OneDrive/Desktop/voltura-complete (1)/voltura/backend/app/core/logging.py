import logging
import sys
from contextvars import ContextVar

from pythonjsonlogger import jsonlogger

from app.core.config import settings

# Holds the current request's correlation ID so every log line within
# that request can be tied back to it, without threading it through
# every function signature.
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get()
        return True


class JsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["request_id"] = getattr(record, "request_id", "-")


def configure_logging() -> None:
    """
    Configure root logger once at app startup. Plain text in development
    for readability, structured JSON in production for log aggregation.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)

    # Clear default handlers (uvicorn attaches its own otherwise duplicates appear)
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())

    if settings.LOG_JSON:
        formatter = JsonFormatter("%(timestamp)s %(level)s %(logger)s %(request_id)s %(message)s")
    else:
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | req=%(request_id)s | %(name)s | %(message)s"
        )

    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

    # Quiet noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
