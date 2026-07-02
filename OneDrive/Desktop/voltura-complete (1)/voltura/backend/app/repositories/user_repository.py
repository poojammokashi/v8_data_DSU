from typing import Optional, Sequence

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def __init__(self, db: Session):
        super().__init__(db)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        return self.db.execute(stmt).scalar_one_or_none()

    def search(
        self,
        *,
        query: Optional[str] = None,
        role_id=None,
        status=None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[Sequence[User], int]:
        stmt = select(User).where(User.deleted_at.is_(None))

        if query:
            like_pattern = f"%{query}%"
            stmt = stmt.where(or_(User.name.ilike(like_pattern), User.email.ilike(like_pattern)))
        if role_id:
            stmt = stmt.where(User.role_id == role_id)
        if status:
            stmt = stmt.where(User.status == status)

        from sqlalchemy import func

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        rows = self.db.execute(stmt).scalars().all()
        return rows, total

    def email_exists(self, email: str) -> bool:
        return self.get_by_email(email) is not None
