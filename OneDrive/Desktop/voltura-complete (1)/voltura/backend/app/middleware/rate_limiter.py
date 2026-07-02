from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi import FastAPI

limiter = Limiter(key_func=get_remote_address)


def register_rate_limiter(app: FastAPI) -> None:
    """
    Attaches the shared limiter instance to app.state (required by slowapi)
    and registers the 429 handler. Route-level limits (e.g. on /auth/login)
    are declared via @limiter.limit(...) decorators on those routes.
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
