"""seed roles and permissions

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-29 00:05:00

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ROLES = ["super_admin", "admin", "analyst", "viewer"]

ALL_PERMISSIONS = [
    "dashboard:view", "analytics:view",
    "energy_data:view", "energy_data:write",
    "billing:view", "billing:write", "settlement:write",
    "reports:view", "reports:generate",
    "alerts:view", "alerts:manage",
    "uploads:view", "uploads:write",
    "users:view", "users:manage",
    "settings:view",
    "audit:view",
]

ROLE_PERMISSION_MAP = {
    "super_admin": ALL_PERMISSIONS,
    "admin": [
        "dashboard:view", "analytics:view", "energy_data:view", "energy_data:write",
        "billing:view", "billing:write", "settlement:write", "reports:view", "reports:generate",
        "alerts:view", "alerts:manage", "uploads:view", "uploads:write",
        "users:view", "users:manage", "settings:view",
    ],
    "analyst": [
        "dashboard:view", "analytics:view", "energy_data:view", "energy_data:write",
        "billing:view", "reports:view", "reports:generate", "alerts:view",
        "uploads:view", "uploads:write", "settings:view",
    ],
    "viewer": [
        "dashboard:view", "analytics:view", "energy_data:view", "billing:view",
        "reports:view", "alerts:view", "settings:view",
    ],
}


def upgrade() -> None:
    bind = op.get_bind()

    roles_table = sa.table(
        "roles",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )
    permissions_table = sa.table(
        "permissions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String),
        sa.column("description", sa.String),
    )
    role_permissions_table = sa.table(
        "role_permissions",
        sa.column("role_id", postgresql.UUID(as_uuid=True)),
        sa.column("permission_id", postgresql.UUID(as_uuid=True)),
    )

    role_ids = {name: uuid.uuid4() for name in ROLES}
    permission_ids = {code: uuid.uuid4() for code in ALL_PERMISSIONS}

    bind.execute(
        roles_table.insert(),
        [{"id": role_ids[name], "name": name, "description": f"{name.replace('_', ' ').title()} role"} for name in ROLES],
    )

    bind.execute(
        permissions_table.insert(),
        [{"id": permission_ids[code], "code": code, "description": None} for code in ALL_PERMISSIONS],
    )

    role_permission_rows = []
    for role_name, codes in ROLE_PERMISSION_MAP.items():
        for code in codes:
            role_permission_rows.append({"role_id": role_ids[role_name], "permission_id": permission_ids[code]})

    bind.execute(role_permissions_table.insert(), role_permission_rows)


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("DELETE FROM role_permissions"))
    bind.execute(sa.text("DELETE FROM permissions"))
    bind.execute(sa.text("DELETE FROM roles"))
