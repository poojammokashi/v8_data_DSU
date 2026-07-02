"""
Domain-level exceptions. These carry no FastAPI/HTTP knowledge — services
and repositories raise these, and the global exception handler (see
app/middleware/error_handler_middleware.py) maps them to HTTP responses.
This keeps the service layer testable independent of the web framework.
"""


class AppException(Exception):
    """Base class for all domain exceptions."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(self, message: str = "An unexpected error occurred", details=None):
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(AppException):
    status_code = 404
    error_code = "NOT_FOUND"

    def __init__(self, resource: str = "Resource", identifier=None):
        message = f"{resource} not found"
        if identifier is not None:
            message += f" (id={identifier})"
        super().__init__(message)


class ValidationError(AppException):
    status_code = 422
    error_code = "VALIDATION_ERROR"

    def __init__(self, message: str = "Validation failed", details=None):
        super().__init__(message, details)


class DuplicateResourceError(AppException):
    status_code = 409
    error_code = "DUPLICATE_RESOURCE"

    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message)


class AuthenticationError(AppException):
    status_code = 401
    error_code = "AUTHENTICATION_ERROR"

    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message)


class TokenExpiredError(AppException):
    status_code = 401
    error_code = "TOKEN_EXPIRED"

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message)


class InsufficientPermissionError(AppException):
    status_code = 403
    error_code = "INSUFFICIENT_PERMISSION"

    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(message)


class FileProcessingError(AppException):
    status_code = 400
    error_code = "FILE_PROCESSING_ERROR"

    def __init__(self, message: str = "Failed to process uploaded file", details=None):
        super().__init__(message, details)


class BusinessRuleError(AppException):
    """Raised when an action violates a domain business rule (e.g. closing an already-settled bill)."""

    status_code = 400
    error_code = "BUSINESS_RULE_VIOLATION"

    def __init__(self, message: str):
        super().__init__(message)
