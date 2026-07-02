import enum
import uuid
from datetime import datetime

# from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum


class AlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class AlertCondition(str, enum.Enum):
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    EQUAL_TO = "eq"


class AlertMetric(str, enum.Enum):
    PEAK_DEMAND = "peak_demand"
    CONSUMPTION = "consumption"
    GENERATION = "generation"
    OUTSTANDING_BILLING = "outstanding_billing"


class AlertRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "alert_rules"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    # metric: Mapped[AlertMetric] = mapped_column(Enum(AlertMetric, name="alert_metric"), nullable=False)
    # condition: Mapped[AlertCondition] = mapped_column(Enum(AlertCondition, name="alert_condition"), nullable=False)
    metric: Mapped[AlertMetric] = mapped_column(PgEnum(AlertMetric, name="alert_metric"), nullable=False)
    condition: Mapped[AlertCondition] = mapped_column(PgEnum(AlertCondition, name="alert_condition"), nullable=False)
    threshold: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    # severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity, name="alert_severity"), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(PgEnum(AlertSeverity, name="alert_severity"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    notifications: Mapped[list["AlertNotification"]] = relationship(back_populates="rule")

    def __repr__(self) -> str:
        return f"<AlertRule {self.name}>"


class AlertNotification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "alert_notifications"

    rule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("alert_rules.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    triggered_value: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    acknowledged_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    rule: Mapped["AlertRule"] = relationship(back_populates="notifications", lazy="joined")
    acknowledged_by: Mapped["User"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<AlertNotification {self.title}>"
