from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.auth.jwt import get_current_user


def require_role(*roles: UserRole):
    """Decorator que exige um dos roles especificados."""
    async def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Roles permitidos: {[r.value for r in roles]}",
            )
        return current_user
    return checker


def require_master():
    return require_role(UserRole.master)


def require_financeiro():
    return require_role(UserRole.master, UserRole.financeiro)


def require_operacional():
    return require_role(UserRole.master, UserRole.financeiro, UserRole.operacional)


def require_any():
    """Qualquer usuário autenticado."""
    return require_role(*[r for r in UserRole])
