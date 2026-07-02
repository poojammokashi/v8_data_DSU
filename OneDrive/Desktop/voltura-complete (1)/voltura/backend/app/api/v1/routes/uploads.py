import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.config import settings
from app.core.exceptions import ValidationError
from app.core.permissions import Permission
from app.models.file_upload import UploadDataType, UploadFileType
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.schemas.file_upload import (
    FileUploadCommitResult,
    FileUploadRead,
    FileUploadValidationResult,
)
from app.services.file_ingestion_service import MAX_PREVIEW_ROWS, FileIngestionService

router = APIRouter(prefix="/uploads", tags=["Data Upload"])

EXTENSION_TYPE_MAP = {
    "csv": UploadFileType.CSV,
    "xlsx": UploadFileType.EXCEL,
    "xls": UploadFileType.EXCEL,
    "json": UploadFileType.JSON,
}


def _resolve_file_type(filename: str) -> UploadFileType:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    file_type = EXTENSION_TYPE_MAP.get(ext)
    if not file_type:
        raise ValidationError(f"Unsupported file extension '.{ext}'. Use .csv, .xlsx, .xls, or .json")
    return file_type


async def _handle_upload(
    file: UploadFile, data_type: UploadDataType, current_user: User, db: Session
) -> FileUploadValidationResult:
    file_type = _resolve_file_type(file.filename)

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    service = FileIngestionService(db)
    upload = service.parse_and_validate(
        filename=file.filename,
        file_bytes=file_bytes,
        file_type=file_type,
        data_type=data_type,
        uploaded_by_id=current_user.id,
    )

    errors = [
        {"row_number": e.row_number, "error_message": e.error_message, "raw_data": e.raw_data}
        for e in upload.errors
    ]
    preview = (upload.staged_data or [])[:MAX_PREVIEW_ROWS]

    return {
        "upload_id": upload.id,
        "filename": upload.filename,
        "data_type": upload.data_type.value,
        "status": upload.status.value,
        "total_rows": upload.total_rows,
        "valid_rows": upload.valid_rows,
        "error_rows": upload.error_rows,
        "errors": errors,
        "preview": preview,
    }


@router.post(
    "/power-purchase",
    response_model=SuccessResponse[FileUploadValidationResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
async def upload_power_purchase(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    result = await _handle_upload(file, UploadDataType.POWER_PURCHASE, current_user, db)
    return {"data": result}


@router.post(
    "/open-access",
    response_model=SuccessResponse[FileUploadValidationResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
async def upload_open_access(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    result = await _handle_upload(file, UploadDataType.OPEN_ACCESS, current_user, db)
    return {"data": result}


@router.post(
    "/generation",
    response_model=SuccessResponse[FileUploadValidationResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
async def upload_generation(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    result = await _handle_upload(file, UploadDataType.GENERATION, current_user, db)
    return {"data": result}


@router.post(
    "/consumption",
    response_model=SuccessResponse[FileUploadValidationResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
async def upload_consumption(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    result = await _handle_upload(file, UploadDataType.CONSUMPTION, current_user, db)
    return {"data": result}


@router.post(
    "/peak-demand",
    response_model=SuccessResponse[FileUploadValidationResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
async def upload_peak_demand(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    result = await _handle_upload(file, UploadDataType.PEAK_DEMAND, current_user, db)
    return {"data": result}


@router.post(
    "/{upload_id}/commit",
    response_model=SuccessResponse[FileUploadCommitResult],
    dependencies=[Depends(require_permission(Permission.UPLOADS_WRITE))],
)
def commit_upload(upload_id: uuid.UUID, db: Session = Depends(get_db)):
    """Phase 2 — only after the validation report has been reviewed by the user."""
    service = FileIngestionService(db)
    return {"data": service.commit(upload_id)}


@router.get(
    "/history",
    response_model=PaginatedResponse[FileUploadRead],
    dependencies=[Depends(require_permission(Permission.UPLOADS_VIEW))],
)
def get_upload_history(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    service = FileIngestionService(db)
    rows, total = service.list_history(page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@router.get(
    "/{upload_id}/errors",
    response_model=SuccessResponse[FileUploadRead],
    dependencies=[Depends(require_permission(Permission.UPLOADS_VIEW))],
)
def get_upload_errors(upload_id: uuid.UUID, db: Session = Depends(get_db)):
    service = FileIngestionService(db)
    return {"data": service.get_upload(upload_id)}
