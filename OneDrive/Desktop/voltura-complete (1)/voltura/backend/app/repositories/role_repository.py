from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role import Role
from app.repositories.base_repository import BaseRepository


class RoleRepository(BaseRepository[Role]):
    model = Role

    def __init__(self, db: Session):
        super().__init__(db)

    def get_by_name(self, name: str) -> Optional[Role]:
        stmt = select(Role).where(Role.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_all(self) -> list[Role]:
        stmt = select(Role).order_by(Role.name)
        return list(self.db.execute(stmt).scalars().all())
