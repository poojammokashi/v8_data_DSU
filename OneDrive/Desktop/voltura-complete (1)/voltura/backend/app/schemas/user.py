import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.core.permissions import Role
from app.schemas.common import ORMBaseSchema


class RoleRead(ORMBaseSchema):
    id: uuid.UUID
    name: str
    description: Optional[str] = None


class UserCreate(BaseModel):
    """Used by the Invite User flow — password is set via the reset-password link, not here."""

    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    role: Role
    phone: Optional[str] = Field(default=None, max_length=20)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=20)
    avatar_url: Optional[str] = None


class UserRoleUpdate(BaseModel):
    role: Role


class UserStatusUpdate(BaseModel):
    status: str = Field(pattern="^(active|inactive|pending|suspended)$")


class UserRead(ORMBaseSchema):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    is_email_verified: bool
    last_active_at: Optional[datetime] = None
    created_at: datetime
    role: RoleRead

    @property
    def role_name(self) -> str:
        return self.role.name
