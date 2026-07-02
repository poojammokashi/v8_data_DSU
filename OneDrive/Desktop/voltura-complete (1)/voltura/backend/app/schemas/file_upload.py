import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBaseSchema


class FileUploadErrorRead(ORMBaseSchema):
    row_number: int
    error_message: str
    raw_data: Optional[dict] = None


class FileUploadValidationResult(BaseModel):
    """Returned immediately after POST /uploads/{type} — before commit."""

    upload_id: uuid.UUID
    filename: str
    data_type: str
    status: str
    total_rows: int
    valid_rows: int
    error_rows: int
    errors: list[FileUploadErrorRead] = Field(default_factory=list)
    preview: list[dict] = Field(default_factory=list)  # first N valid rows for UI preview


class FileUploadCommitRequest(BaseModel):
    upload_id: uuid.UUID


class FileUploadCommitResult(BaseModel):
    upload_id: uuid.UUID
    status: str
    rows_committed: int


class FileUploadRead(ORMBaseSchema):
    id: uuid.UUID
    filename: str
    file_type: str
    data_type: str
    status: str
    total_rows: int
    valid_rows: int
    error_rows: int
    created_at: datetime
