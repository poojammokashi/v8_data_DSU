"""
RBAC permission matrix. This is the backend's single source of truth for
"which role can do what" — mirrors app/config/constants.js on the frontend
so both layers agree, but the backend copy is authoritative since it's
what actually enforces access.
"""

from enum import Enum


class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class Permission(str, Enum):
    # Dashboard & analytics
    DASHBOARD_VIEW = "dashboard:view"
    ANALYTICS_VIEW = "analytics:view"

    # Domain data — power purchase, open access, generation, consumption
    ENERGY_DATA_VIEW = "energy_data:view"
    ENERGY_DATA_WRITE = "energy_data:write"

    # Billing & settlement
    BILLING_VIEW = "billing:view"
    BILLING_WRITE = "billing:write"
    SETTLEMENT_WRITE = "settlement:write"

    # Reports
    REPORTS_VIEW = "reports:view"
    REPORTS_GENERATE = "reports:generate"

    # Alerts
    ALERTS_VIEW = "alerts:view"
    ALERTS_MANAGE = "alerts:manage"

    # File uploads
    UPLOADS_VIEW = "uploads:view"
    UPLOADS_WRITE = "uploads:write"

    # Users & roles
    USERS_VIEW = "users:view"
    USERS_MANAGE = "users:manage"

    # Settings
    SETTINGS_VIEW = "settings:view"

    # Audit
    AUDIT_VIEW = "audit:view"


ROLE_PERMISSIONS: dict[Role, list[Permission]] = {
    Role.SUPER_ADMIN: list(Permission),  # everything
    Role.ADMIN: [
        Permission.DASHBOARD_VIEW,
        Permission.ANALYTICS_VIEW,
        Permission.ENERGY_DATA_VIEW,
        Permission.ENERGY_DATA_WRITE,
        Permission.BILLING_VIEW,
        Permission.BILLING_WRITE,
        Permission.SETTLEMENT_WRITE,
        Permission.REPORTS_VIEW,
        Permission.REPORTS_GENERATE,
        Permission.ALERTS_VIEW,
        Permission.ALERTS_MANAGE,
        Permission.UPLOADS_VIEW,
        Permission.UPLOADS_WRITE,
        Permission.USERS_VIEW,
        Permission.USERS_MANAGE,
        Permission.SETTINGS_VIEW,
    ],
    Role.ANALYST: [
        Permission.DASHBOARD_VIEW,
        Permission.ANALYTICS_VIEW,
        Permission.ENERGY_DATA_VIEW,
        Permission.ENERGY_DATA_WRITE,
        Permission.BILLING_VIEW,
        Permission.REPORTS_VIEW,
        Permission.REPORTS_GENERATE,
        Permission.ALERTS_VIEW,
        Permission.UPLOADS_VIEW,
        Permission.UPLOADS_WRITE,
        Permission.SETTINGS_VIEW,
    ],
    Role.VIEWER: [
        Permission.DASHBOARD_VIEW,
        Permission.ANALYTICS_VIEW,
        Permission.ENERGY_DATA_VIEW,
        Permission.BILLING_VIEW,
        Permission.REPORTS_VIEW,
        Permission.ALERTS_VIEW,
        Permission.SETTINGS_VIEW,
    ],
}


def role_has_permission(role: str, permission: Permission) -> bool:
    try:
        role_enum = Role(role)
    except ValueError:
        return False
    return permission in ROLE_PERMISSIONS.get(role_enum, [])
