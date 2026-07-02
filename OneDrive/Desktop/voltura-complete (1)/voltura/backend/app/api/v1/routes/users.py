import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db, require_permission
from app.core.permissions import Permission
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse, paginate
from app.schemas.user import UserCreate, UserRead, UserRoleUpdate, UserStatusUpdate, UserUpdate
from app.services.audit_service import AuditService
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=PaginatedResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_VIEW))])
def list_users(
    search: str | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    rows, total = service.list_users(query=search, status=status, page=page, page_size=page_size)
    return paginate(rows, total, page, page_size)


@router.get("/{user_id}", response_model=SuccessResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_VIEW))])
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    service = UserService(db)
    return {"data": service.get_user(user_id)}


@router.post("/", response_model=SuccessResponse[UserRead], status_code=201, dependencies=[Depends(require_permission(Permission.USERS_MANAGE))])
def invite_user(payload: UserCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.invite_user(payload, invited_by=current_user)

    AuditService(db).log(
        user_id=current_user.id, action="user.invite", entity_type="User", entity_id=str(user.id),
        metadata={"invited_email": user.email, "role": payload.role.value},
    )
    return {"data": user}


@router.put("/{user_id}", response_model=SuccessResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_MANAGE))])
def update_user(user_id: uuid.UUID, payload: UserUpdate, db: Session = Depends(get_db)):
    service = UserService(db)
    return {"data": service.update_user(user_id, payload)}


@router.put("/{user_id}/role", response_model=SuccessResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_MANAGE))])
def update_user_role(
    user_id: uuid.UUID,
    payload: UserRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    user = service.update_role(user_id, payload.role.value)

    AuditService(db).log(
        user_id=current_user.id, action="user.role_change", entity_type="User", entity_id=str(user_id),
        metadata={"new_role": payload.role.value},
    )
    return {"data": user}


@router.put("/{user_id}/status", response_model=SuccessResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_MANAGE))])
def update_user_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = UserService(db)
    user = service.update_status(user_id, payload.status)

    AuditService(db).log(
        user_id=current_user.id, action="user.status_change", entity_type="User", entity_id=str(user_id),
        metadata={"new_status": payload.status},
    )
    return {"data": user}


@router.delete("/{user_id}", response_model=SuccessResponse[UserRead], dependencies=[Depends(require_permission(Permission.USERS_MANAGE))])
def deactivate_user(
    user_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Soft-suspend, not a hard delete — preserves history for audit/reporting."""
    service = UserService(db)
    user = service.deactivate_user(user_id)

    AuditService(db).log(
        user_id=current_user.id, action="user.suspend", entity_type="User", entity_id=str(user_id),
    )
    return {"data": user}
