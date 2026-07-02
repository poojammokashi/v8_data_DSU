import enum
import uuid

# from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.base import PgEnum


class UploadFileType(str, enum.Enum):
    EXCEL = "excel"
    CSV = "csv"
    JSON = "json"


class UploadStatus(str, enum.Enum):
    VALIDATING = "validating"
    VALIDATED = "validated"  # validation done, awaiting commit
    COMMITTED = "committed"
    FAILED = "failed"


class UploadDataType(str, enum.Enum):
    POWER_PURCHASE = "power_purchase"
    OPEN_ACCESS = "open_access"
    GENERATION = "generation"
    CONSUMPTION = "consumption"
    PEAK_DEMAND = "peak_demand"


class FileUpload(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "file_uploads"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    # file_type: Mapped[UploadFileType] = mapped_column(Enum(UploadFileType, name="upload_file_type"), nullable=False)
    # data_type: Mapped[UploadDataType] = mapped_column(Enum(UploadDataType, name="upload_data_type"), nullable=False)
    file_type: Mapped[UploadFileType] = mapped_column(PgEnum(UploadFileType, name="upload_file_type"), nullable=False)
    data_type: Mapped[UploadDataType] = mapped_column(PgEnum(UploadDataType, name="upload_data_type"), nullable=False)

    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # status: Mapped[UploadStatus] = mapped_column(
    #     Enum(UploadStatus, name="upload_status"), default=UploadStatus.VALIDATING, nullable=False
    # )
    status: Mapped[UploadStatus] = mapped_column(
        PgEnum(UploadStatus, name="upload_status"), default=UploadStatus.VALIDATING, nullable=False
    )
    total_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    valid_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Staged, validated rows kept here until /commit is called — avoids a
    # separate staging table while still allowing inspect-before-commit.
    staged_data: Mapped[list | None] = mapped_column(JSON, nullable=True)

    uploaded_by: Mapped["User"] = relationship(lazy="joined")
    errors: Mapped[list["FileUploadError"]] = relationship(back_populates="upload", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<FileUpload {self.filename} ({self.status})>"


class FileUploadError(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "file_upload_errors"

    upload_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("file_uploads.id", ondelete="CASCADE"), nullable=False
    )
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    error_message: Mapped[str] = mapped_column(String(500), nullable=False)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    upload: Mapped["FileUpload"] = relationship(back_populates="errors")

    def __repr__(self) -> str:
        return f"<FileUploadError row={self.row_number}>"
