from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.models.user import User, UserStatus
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository

logger = get_logger("app.init_db")


def seed_super_admin(db: Session) -> None:
    """
    Creates the initial Super Admin account on first boot, using the
    SUPERADMIN_* env vars. Safe to call on every startup — it's a no-op
    once a super admin already exists. Roles/permissions themselves are
    seeded by the Alembic migration (0002_seed_roles_permissions.py), not
    here, since that's schema-adjacent data that belongs in version control.
    """
    user_repo = UserRepository(db)
    role_repo = RoleRepository(db)

    if user_repo.email_exists(settings.SUPERADMIN_EMAIL):
        return

    role = role_repo.get_by_name("super_admin")
    if not role:
        logger.warning("super_admin role not found — has the seed migration run?")
        return

    admin = User(
        name=settings.SUPERADMIN_NAME,
        email=settings.SUPERADMIN_EMAIL.lower(),
        password_hash=hash_password(settings.SUPERADMIN_PASSWORD),
        role_id=role.id,
        status=UserStatus.ACTIVE,
        is_email_verified=True,
    )
    user_repo.create(admin)
    db.commit()
    logger.info(f"Seeded super admin account: {settings.SUPERADMIN_EMAIL}")
