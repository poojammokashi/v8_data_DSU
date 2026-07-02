"""
Import every model here so:
1. Alembic's autogenerate can discover all tables via Base.metadata.
2. SQLAlchemy can resolve string-based relationship() references
   (e.g. Mapped["User"]) regardless of import order elsewhere.
"""

from app.db.base import Base  # noqa: F401

from app.models.role import Role, Permission, role_permissions  # noqa: F401
from app.models.user import User, UserStatus  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.master_data import PowerSource, Plant, Feeder, SourceType  # noqa: F401
from app.models.power_purchase import PowerPurchase, PowerPurchaseStatus  # noqa: F401
from app.models.open_access import OpenAccessTransaction, OpenAccessStatus  # noqa: F401
from app.models.generation import EnergyGeneration  # noqa: F401
from app.models.consumption import PowerConsumption  # noqa: F401
from app.models.peak_demand import PeakDemand  # noqa: F401
from app.models.billing import Billing, Settlement, BillingStatus, SettlementStatus  # noqa: F401
from app.models.alert import AlertRule, AlertNotification, AlertSeverity, AlertCondition, AlertMetric  # noqa: F401
from app.models.file_upload import FileUpload, FileUploadError, UploadFileType, UploadStatus, UploadDataType  # noqa: F401

__all__ = [
    "Base",
    "Role", "Permission", "role_permissions",
    "User", "UserStatus",
    "AuditLog",
    "PowerSource", "Plant", "Feeder", "SourceType",
    "PowerPurchase", "PowerPurchaseStatus",
    "OpenAccessTransaction", "OpenAccessStatus",
    "EnergyGeneration",
    "PowerConsumption",
    "PeakDemand",
    "Billing", "Settlement", "BillingStatus", "SettlementStatus",
    "AlertRule", "AlertNotification", "AlertSeverity", "AlertCondition", "AlertMetric",
    "FileUpload", "FileUploadError", "UploadFileType", "UploadStatus", "UploadDataType",
]
