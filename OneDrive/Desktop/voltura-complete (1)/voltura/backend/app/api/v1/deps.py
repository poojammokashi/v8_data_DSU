from typing import Optional

from fastapi import Depends, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientPermissionError
from app.core.permissions import Permission, role_has_permission
from app.core.security import TOKEN_TYPE_ACCESS, decode_token
from app.db.session import get_db
from app.models.user import User, UserStatus
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=True)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Decodes the bearer JWT, loads the user, and verifies the account is
    still active. Every protected route depends on this (directly or via
    require_permission below) — it's the single place identity is resolved.
    """
    payload = decode_token(token, expected_type=TOKEN_TYPE_ACCESS)
    user_id = payload["sub"]

    user = UserRepository(db).get_by_id(user_id)
    if not user or user.status != UserStatus.ACTIVE:
        from app.core.exceptions import AuthenticationError

        raise AuthenticationError("User no longer has access")

    return user


def require_permission(permission: Permission):
    """
    Dependency factory for RBAC enforcement on a route:
        @router.get("/", dependencies=[Depends(require_permission(Permission.BILLING_VIEW))])
    Checked against the role->permission matrix in app/core/permissions.py —
    never a hardcoded role-name comparison, so adding a 5th role later
    doesn't require touching every route.
    """

    def _check(current_user: User = Depends(get_current_user)) -> User:
        if not role_has_permission(current_user.role.name, permission):
            raise InsufficientPermissionError(
                f"Your role does not have the '{permission.value}' permission"
            )
        return current_user

    return _check


class PaginationParams:
    """Shared pagination + sort query params — identical contract across every list endpoint."""

    def __init__(
        self,
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        sort_by: Optional[str] = Query(None),
        sort_order: str = Query("desc", pattern="^(asc|desc)$"),
        search: Optional[str] = Query(None),
    ):
        self.page = page
        self.page_size = page_size
        self.sort_by = sort_by
        self.sort_order = sort_order
        self.search = search


class DateRangeParams:
    """Shared date-range query params for analytics/summary endpoints."""

    def __init__(
        self,
        date_from: Optional[str] = Query(None, description="ISO date, e.g. 2026-06-01"),
        date_to: Optional[str] = Query(None, description="ISO date, e.g. 2026-06-29"),
    ):
        from datetime import date, timedelta

        self.date_to = date.fromisoformat(date_to) if date_to else date.today()
        self.date_from = date.fromisoformat(date_from) if date_from else self.date_to - timedelta(days=30)
