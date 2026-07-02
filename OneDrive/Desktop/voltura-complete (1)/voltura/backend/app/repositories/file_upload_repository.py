from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.file_upload import FileUpload, FileUploadError
from app.repositories.base_repository import BaseRepository


class FileUploadRepository(BaseRepository[FileUpload]):
    model = FileUpload

    def __init__(self, db: Session):
        super().__init__(db)

    def list_history(self, *, page: int = 1, page_size: int = 20) -> tuple[Sequence[FileUpload], int]:
        stmt = select(FileUpload)
        count_stmt = select(func.count()).select_from(FileUpload)
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(FileUpload.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def add_errors(self, upload_id, errors: list[dict]) -> None:
        for err in errors:
            self.db.add(
                FileUploadError(
                    upload_id=upload_id,
                    row_number=err["row_number"],
                    error_message=err["error_message"],
                    raw_data=err.get("raw_data"),
                )
            )
        self.db.flush()
