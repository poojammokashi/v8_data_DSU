"""
Email dispatch utility. This is intentionally a logging stub rather than a
real SMTP/SES/SendGrid integration — wiring a specific provider is an
infrastructure decision that belongs to deployment configuration, not the
application code. Swap send_email's body for a real provider call when
deploying; every caller in the codebase already goes through this one
function, so that's the only place that needs to change.
"""

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("app.email")


def send_email(*, to: str, subject: str, body: str) -> None:
    """
    Send a transactional email. Currently logs instead of dispatching, so
    local development and tests never accidentally send real email. Replace
    the body of this function with a call to your provider's SDK (SES,
    SendGrid, Postmark, etc.) for production use.
    """
    if settings.is_production:
        logger.warning(
            "send_email called in production with no email provider configured — "
            "email was NOT sent. Wire a real provider in app/utils/email.py."
        )

    logger.info(f"[email stub] To: {to} | Subject: {subject}\n{body}")


def send_password_reset_email(*, to: str, reset_token: str) -> None:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    send_email(
        to=to,
        subject="Reset your Voltura password",
        body=(
            "We received a request to reset your password. This link expires in "
            f"{settings.RESET_TOKEN_EXPIRE_MINUTES} minutes:\n\n{reset_url}\n\n"
            "If you didn't request this, you can safely ignore this email."
        ),
    )


def send_user_invite_email(*, to: str, name: str, invite_token: str) -> None:
    invite_url = f"{settings.FRONTEND_URL}/reset-password?token={invite_token}"
    send_email(
        to=to,
        subject="You've been invited to Voltura",
        body=(
            f"Hi {name},\n\nYou've been invited to join Voltura. Set your password "
            f"to get started:\n\n{invite_url}"
        ),
    )
