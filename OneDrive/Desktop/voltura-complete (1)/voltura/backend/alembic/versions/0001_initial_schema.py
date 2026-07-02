"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-29 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop all enums first in case a previous migration attempt left them behind
    bind = op.get_bind()
    for enum_name in [
        "user_status", "source_type", "power_purchase_status",
        "open_access_status", "billing_status", "settlement_status",
        "alert_metric", "alert_condition", "alert_severity",
        "upload_file_type", "upload_status", "upload_data_type",
    ]:
        bind.execute(sa.text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))

    # --- Roles & permissions ---
    op.create_table(
        "roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(50), nullable=False, unique=True),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "role_permissions",
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    )

    # --- Users ---
    user_status_enum = postgresql.ENUM("active", "inactive", "pending", "suspended", name="user_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended')"))

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("status", user_status_enum, nullable=False, server_default="pending"),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("last_active_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # --- Audit logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(100), nullable=False),
        sa.Column("entity_id", sa.String(100), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # --- Master data ---
    source_type_enum = postgresql.ENUM("thermal", "solar", "wind", "hydro", "other", name="source_type", create_type=False)
    bind.execute(sa.text("CREATE TYPE source_type AS ENUM ('thermal', 'solar', 'wind', 'hydro', 'other')"))

    op.create_table(
        "power_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", source_type_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "plants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("capacity_mw", sa.Numeric(12, 2), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("power_sources.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "feeders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("region", sa.String(150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # --- Power purchase ---
    pp_status_enum = postgresql.ENUM("draft", "approved", "rejected", "settled", name="power_purchase_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE power_purchase_status AS ENUM ('draft', 'approved', 'rejected', 'settled')"))

    op.create_table(
        "power_purchase",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("power_sources.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("quantity_mu", sa.Numeric(14, 3), nullable=False),
        sa.Column("rate_per_unit", sa.Numeric(10, 4), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("status", pp_status_enum, nullable=False, server_default="draft"),
        sa.Column("remarks", sa.String(500), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_power_purchase_source_date", "power_purchase", ["source_id", "date"])

    # --- Open access ---
    oa_status_enum = postgresql.ENUM("pending", "approved", "rejected", "settled", name="open_access_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE open_access_status AS ENUM ('pending', 'approved', 'rejected', 'settled')"))

    op.create_table(
        "open_access_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("consumer_name", sa.String(200), nullable=False),
        sa.Column("generator_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("plants.id"), nullable=True),
        sa.Column("quantity_mu", sa.Numeric(14, 3), nullable=False),
        sa.Column("wheeling_charges", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("transmission_charges", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("total_charges", sa.Numeric(14, 2), nullable=False),
        sa.Column("status", oa_status_enum, nullable=False, server_default="pending"),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_open_access_date", "open_access_transactions", ["date"])

    # --- Generation ---
    op.create_table(
        "energy_generation",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("plants.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time_block", sa.SmallInteger(), nullable=True),
        sa.Column("quantity_mwh", sa.Numeric(14, 3), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_generation_plant_date", "energy_generation", ["plant_id", "date"])

    # --- Consumption ---
    op.create_table(
        "power_consumption",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("feeder_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feeders.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time_block", sa.SmallInteger(), nullable=True),
        sa.Column("quantity_mwh", sa.Numeric(14, 3), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_consumption_feeder_date", "power_consumption", ["feeder_id", "date"])

    # --- Peak demand ---
    op.create_table(
        "peak_demand",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("feeder_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feeders.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("time_block", sa.SmallInteger(), nullable=True),
        sa.Column("demand_mw", sa.Numeric(12, 3), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_peak_demand_feeder_date", "peak_demand", ["feeder_id", "date"])

    # --- Billing & settlement ---
    billing_status_enum = postgresql.ENUM("draft", "pending", "settled", "overdue", name="billing_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE billing_status AS ENUM ('draft', 'pending', 'settled', 'overdue')"))

    settlement_status_enum = postgresql.ENUM("pending", "processing", "completed", "failed", name="settlement_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed')"))

    op.create_table(
        "billing",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("feeder_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feeders.id"), nullable=True),
        sa.Column("units_consumed_mu", sa.Numeric(14, 3), nullable=False),
        sa.Column("rate_per_unit", sa.Numeric(10, 4), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("status", billing_status_enum, nullable=False, server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_billing_period", "billing", ["period_start", "period_end"])

    op.create_table(
        "settlement",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("billing_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("billing.id"), nullable=False),
        sa.Column("paid_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("settlement_date", sa.Date(), nullable=False),
        sa.Column("reference_number", sa.String(100), nullable=True),
        sa.Column("status", settlement_status_enum, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # --- Alerts ---
    alert_metric_enum = postgresql.ENUM(
        "peak_demand", "consumption", "generation", "outstanding_billing", name="alert_metric", create_type=False
    )
    bind.execute(sa.text("CREATE TYPE alert_metric AS ENUM ('peak_demand', 'consumption', 'generation', 'outstanding_billing')"))

    alert_condition_enum = postgresql.ENUM("gt", "lt", "eq", name="alert_condition", create_type=False)
    bind.execute(sa.text("CREATE TYPE alert_condition AS ENUM ('gt', 'lt', 'eq')"))

    alert_severity_enum = postgresql.ENUM("critical", "warning", "info", name="alert_severity", create_type=False)
    bind.execute(sa.text("CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info')"))

    op.create_table(
        "alert_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("metric", alert_metric_enum, nullable=False),
        sa.Column("condition", alert_condition_enum, nullable=False),
        sa.Column("threshold", sa.Numeric(14, 3), nullable=False),
        sa.Column("severity", alert_severity_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "alert_notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("rule_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alert_rules.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("triggered_value", sa.Numeric(14, 3), nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("acknowledged_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # --- File uploads ---
    upload_file_type_enum = postgresql.ENUM("excel", "csv", "json", name="upload_file_type", create_type=False)
    bind.execute(sa.text("CREATE TYPE upload_file_type AS ENUM ('excel', 'csv', 'json')"))

    upload_status_enum = postgresql.ENUM("validating", "validated", "committed", "failed", name="upload_status", create_type=False)
    bind.execute(sa.text("CREATE TYPE upload_status AS ENUM ('validating', 'validated', 'committed', 'failed')"))

    upload_data_type_enum = postgresql.ENUM(
        "power_purchase", "open_access", "generation", "consumption", "peak_demand", name="upload_data_type", create_type=False
    )
    bind.execute(sa.text("CREATE TYPE upload_data_type AS ENUM ('power_purchase', 'open_access', 'generation', 'consumption', 'peak_demand')"))

    op.create_table(
        "file_uploads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_type", upload_file_type_enum, nullable=False),
        sa.Column("data_type", upload_data_type_enum, nullable=False),
        sa.Column("uploaded_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", upload_status_enum, nullable=False, server_default="validating"),
        sa.Column("total_rows", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("valid_rows", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_rows", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("staged_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "file_upload_errors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("upload_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("file_uploads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.String(500), nullable=False),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("file_upload_errors")
    op.drop_table("file_uploads")
    op.drop_table("alert_notifications")
    op.drop_table("alert_rules")
    op.drop_table("settlement")
    op.drop_table("billing")
    op.drop_table("peak_demand")
    op.drop_table("power_consumption")
    op.drop_table("energy_generation")
    op.drop_table("open_access_transactions")
    op.drop_table("power_purchase")
    op.drop_table("feeders")
    op.drop_table("plants")
    op.drop_table("power_sources")
    op.drop_table("audit_logs")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")

    bind = op.get_bind()
    for enum_name in [
        "upload_data_type", "upload_status", "upload_file_type",
        "alert_severity", "alert_condition", "alert_metric",
        "settlement_status", "billing_status",
        "open_access_status", "power_purchase_status",
        "source_type", "user_status",
    ]:
        bind.execute(sa.text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))