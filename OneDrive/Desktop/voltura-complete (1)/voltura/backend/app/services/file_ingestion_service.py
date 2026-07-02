import json
import uuid
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from io import BytesIO
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.exceptions import FileProcessingError, NotFoundError, ValidationError
from app.models.consumption import PowerConsumption
from app.models.file_upload import FileUpload, UploadDataType, UploadFileType, UploadStatus
from app.models.generation import EnergyGeneration
from app.models.peak_demand import PeakDemand
from app.repositories.file_upload_repository import FileUploadRepository

# Required columns per data type — the contract the uploaded file must satisfy.
REQUIRED_COLUMNS: dict[UploadDataType, list[str]] = {
    UploadDataType.POWER_PURCHASE: ["source_id", "date", "quantity_mu", "rate_per_unit"],
    UploadDataType.OPEN_ACCESS: ["date", "consumer_name", "quantity_mu", "wheeling_charges", "transmission_charges"],
    UploadDataType.GENERATION: ["plant_id", "date", "quantity_mwh"],
    UploadDataType.CONSUMPTION: ["feeder_id", "date", "quantity_mwh"],
    UploadDataType.PEAK_DEMAND: ["feeder_id", "date", "demand_mw"],
}

NUMERIC_FIELDS = {"quantity_mu", "rate_per_unit", "quantity_mwh", "demand_mw", "wheeling_charges", "transmission_charges"}
DATE_FIELDS = {"date"}
UUID_FIELDS = {"source_id", "plant_id", "feeder_id", "generator_id"}

MAX_PREVIEW_ROWS = 10


class FileIngestionService:
    """
    Two-phase upload flow:
      1. parse_and_validate() — reads the file, validates every row, stages
         valid rows in FileUpload.staged_data, records row-level errors.
         Nothing is written to domain tables yet.
      2. commit() — inserts the staged rows into the actual domain table.
    This protects domain tables from ever receiving a partially-bad file.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = FileUploadRepository(db)

    # --- Phase 1: parse + validate ---

    def parse_and_validate(
        self,
        *,
        filename: str,
        file_bytes: bytes,
        file_type: UploadFileType,
        data_type: UploadDataType,
        uploaded_by_id: uuid.UUID,
    ) -> FileUpload:
        rows = self._parse_file(filename, file_bytes, file_type)

        required_columns = REQUIRED_COLUMNS[data_type]
        valid_rows: list[dict] = []
        errors: list[dict] = []

        for idx, raw_row in enumerate(rows, start=1):
            try:
                cleaned = self._validate_row(raw_row, required_columns)
                valid_rows.append(cleaned)
            except ValidationError as exc:
                errors.append({"row_number": idx, "error_message": exc.message, "raw_data": _json_safe(raw_row)})

        upload = FileUpload(
            filename=filename,
            file_type=file_type,
            data_type=data_type,
            uploaded_by_id=uploaded_by_id,
            status=UploadStatus.VALIDATED if not errors or valid_rows else UploadStatus.FAILED,
            total_rows=len(rows),
            valid_rows=len(valid_rows),
            error_rows=len(errors),
            staged_data=_json_safe(valid_rows),
        )
        self.repo.create(upload)

        if errors:
            self.repo.add_errors(upload.id, errors)

        self.db.commit()
        self.db.refresh(upload)
        return upload

    def _parse_file(self, filename: str, file_bytes: bytes, file_type: UploadFileType) -> list[dict]:
        try:
            if file_type == UploadFileType.CSV:
                df = pd.read_csv(BytesIO(file_bytes))
                return df.to_dict(orient="records")

            if file_type == UploadFileType.EXCEL:
                df = pd.read_excel(BytesIO(file_bytes), engine="openpyxl")
                return df.to_dict(orient="records")

            if file_type == UploadFileType.JSON:
                payload = json.loads(file_bytes.decode("utf-8"))
                if isinstance(payload, dict):
                    payload = payload.get("data", [payload])
                if not isinstance(payload, list):
                    raise FileProcessingError("JSON file must contain an array of records")
                return payload

        except FileProcessingError:
            raise
        except Exception as exc:  # noqa: BLE001 — surfacing as a domain error regardless of parser library
            raise FileProcessingError(f"Could not parse {filename}: {exc}") from exc

        raise FileProcessingError(f"Unsupported file type: {file_type}")

    def _validate_row(self, raw_row: dict, required_columns: list[str]) -> dict:
        cleaned: dict[str, Any] = {}

        for col in required_columns:
            if col not in raw_row or raw_row[col] in (None, "", "nan"):
                raise ValidationError(f"Missing required field '{col}'")

            value = raw_row[col]

            if col in NUMERIC_FIELDS:
                try:
                    cleaned[col] = Decimal(str(value))
                    if cleaned[col] < 0:
                        raise ValidationError(f"Field '{col}' cannot be negative")
                except (InvalidOperation, ValueError):
                    raise ValidationError(f"Field '{col}' must be a valid number, got '{value}'")

            elif col in DATE_FIELDS:
                cleaned[col] = self._parse_date(value, col)

            elif col in UUID_FIELDS:
                try:
                    cleaned[col] = str(uuid.UUID(str(value)))
                except ValueError:
                    raise ValidationError(f"Field '{col}' must be a valid UUID, got '{value}'")

            else:
                cleaned[col] = str(value).strip()

        # Carry over optional fields not in the required list (e.g. remarks, generator_id)
        for key, value in raw_row.items():
            if key not in cleaned and value not in (None, "", "nan"):
                cleaned[key] = _json_safe(value)

        return cleaned

    @staticmethod
    def _parse_date(value: Any, field_name: str) -> str:
        if isinstance(value, (date, datetime)):
            return value.isoformat() if isinstance(value, date) else value.date().isoformat()
        try:
            return pd.to_datetime(value).date().isoformat()
        except Exception:
            raise ValidationError(f"Field '{field_name}' must be a valid date, got '{value}'")

    # --- Phase 2: commit ---

    def commit(self, upload_id: uuid.UUID) -> dict:
        upload = self.repo.get_by_id(upload_id)
        if not upload:
            raise NotFoundError("File upload", upload_id)

        if upload.status != UploadStatus.VALIDATED:
            raise ValidationError(f"Upload is in '{upload.status.value}' state and cannot be committed")

        model_map = {
            UploadDataType.GENERATION: (EnergyGeneration, {"plant_id", "date", "time_block", "quantity_mwh"}),
            UploadDataType.CONSUMPTION: (PowerConsumption, {"feeder_id", "date", "time_block", "quantity_mwh"}),
            UploadDataType.PEAK_DEMAND: (PeakDemand, {"feeder_id", "date", "time_block", "demand_mw"}),
        }

        # Power purchase / open access go through their own services (amount
        # calculation, status defaults) rather than direct inserts here —
        # this service stays generic for the simpler time-series types.
        if upload.data_type not in model_map:
            raise ValidationError(
                f"Bulk commit for '{upload.data_type.value}' must go through its domain service; "
                "use the staged_data via the dedicated endpoint."
            )

        model_cls, allowed_fields = model_map[upload.data_type]
        rows_committed = 0

        for row in upload.staged_data or []:
            filtered = {k: v for k, v in row.items() if k in allowed_fields}
            obj = model_cls(**filtered)
            self.db.add(obj)
            rows_committed += 1

        upload.status = UploadStatus.COMMITTED
        self.db.commit()

        return {"upload_id": upload.id, "status": upload.status.value, "rows_committed": rows_committed}

    def get_upload(self, upload_id: uuid.UUID) -> FileUpload:
        upload = self.repo.get_by_id(upload_id)
        if not upload:
            raise NotFoundError("File upload", upload_id)
        return upload

    def list_history(self, *, page: int = 1, page_size: int = 20):
        return self.repo.list_history(page=page, page_size=page_size)


def _json_safe(value: Any) -> Any:
    """Recursively convert Decimal/date/datetime to JSON-serializable primitives for JSON columns."""
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if pd.isna(value) if not isinstance(value, (list, dict)) else False:
        return None
    return value
