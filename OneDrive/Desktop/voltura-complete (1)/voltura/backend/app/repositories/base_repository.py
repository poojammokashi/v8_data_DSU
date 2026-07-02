import uuid
from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic CRUD repository. Domain-specific repositories extend this and
    add query methods specific to their aggregate (e.g. get_by_date_range).
    Services never construct SQLAlchemy queries directly — they always go
    through a repository, keeping persistence concerns out of business logic.
    """

    model: Type[ModelType]

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: uuid.UUID) -> Optional[ModelType]:
        return self.db.get(self.model, id)

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        order_by=None,
    ) -> tuple[Sequence[ModelType], int]:
        """Returns (rows, total_count) for the given page."""
        count_stmt = select(func.count()).select_from(self.model)
        total = self.db.execute(count_stmt).scalar_one()

        stmt = select(self.model)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelType, **fields) -> ModelType:
        for key, value in fields.items():
            setattr(obj, key, value)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.flush()

    def soft_delete(self, obj: ModelType) -> ModelType:
        """For models with SoftDeleteMixin only."""
        from datetime import datetime, timezone

        obj.deleted_at = datetime.now(timezone.utc)
        self.db.flush()
        return obj

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()
