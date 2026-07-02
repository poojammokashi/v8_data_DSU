import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ORMBaseSchema


class ReportGenerateRequest(BaseModel):
    report_type: str = Field(pattern="^(financial|settlement|open_access|analytics|generation)$")
    date_from: date
    date_to: date


class ReportRead(ORMBaseSchema):
    id: uuid.UUID
    name: str
    report_type: str
    status: str
    generated_at: Optional[datetime] = None
    file_path: Optional[str] = None
