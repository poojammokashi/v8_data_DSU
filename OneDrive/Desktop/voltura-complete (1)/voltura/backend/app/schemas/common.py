from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict

DataT = TypeVar("DataT")


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[DataT]):
    success: bool = True
    data: list[DataT]
    meta: PaginationMeta


class SuccessResponse(BaseModel, Generic[DataT]):
    success: bool = True
    data: DataT


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


class ORMBaseSchema(BaseModel):
    """Base for response schemas that read directly from SQLAlchemy ORM objects."""

    model_config = ConfigDict(from_attributes=True)


def paginate(items: list, total: int, page: int, page_size: int) -> dict:
    """Helper to build the meta block consistently across every list endpoint."""
    total_pages = max(1, (total + page_size - 1) // page_size)
    return {
        "data": items,
        "meta": {"page": page, "page_size": page_size, "total": total, "total_pages": total_pages},
    }
