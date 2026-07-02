from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.core.config import settings
from app.middleware.rate_limiter import limiter
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.common import SuccessResponse
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=SuccessResponse[TokenResponse])
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    """Rate-limited to prevent credential-stuffing / brute-force attempts."""
    service = AuthService(db)
    result = service.authenticate(payload.email, payload.password)
    return {"data": result}


@router.post("/refresh", response_model=SuccessResponse[AccessTokenResponse])
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access_token = service.refresh_access_token(request.refresh_token)
    return {"data": {"access_token": access_token}}


@router.post("/logout", response_model=SuccessResponse[dict])
def logout(current_user: User = Depends(get_current_user)):
    """
    Stateless JWT — logout is a client-side action (discard the token).
    Endpoint exists for symmetry with the frontend's auth flow and as a
    hook point if a token-blocklist is added later.
    """
    return {"data": {"message": "Logged out successfully"}}


@router.get("/me", response_model=SuccessResponse[UserRead])
def get_me(current_user: User = Depends(get_current_user)):
    return {"data": current_user}


@router.post("/forgot-password", response_model=SuccessResponse[dict])
@limiter.limit("3/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.request_password_reset(payload.email)
    # Always the same response regardless of whether the email exists
    return {"data": {"message": "If that email exists, reset instructions have been sent."}}


@router.post("/reset-password", response_model=SuccessResponse[dict])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.reset_password(payload.token, payload.new_password)
    return {"data": {"message": "Password has been reset successfully."}}


@router.post("/change-password", response_model=SuccessResponse[dict])
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.change_password(current_user, payload.current_password, payload.new_password)
    return {"data": {"message": "Password changed successfully."}}
