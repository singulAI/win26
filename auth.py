from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.auth.jwt import (
    verify_password, hash_password,
    create_access_token, get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CreateUserRequest(BaseModel):
    nome: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.operacional


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    nome: str


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == req.email, User.ativo == True)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    # Atualiza last_login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Audit
    log = AuditLog(
        acao="LOGIN",
        entidade="usuario",
        entidade_id=str(user.id),
        usuario_id=user.id,
        usuario_email=user.email,
        ip_origem=request.client.host if request.client else None,
    )
    db.add(log)
    await db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role.value, "email": user.email})
    return TokenResponse(access_token=token, role=user.role.value, nome=user.nome)


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "role": current_user.role,
        "last_login": current_user.last_login,
    }


@router.post("/usuarios", status_code=201)
async def criar_usuario(
    req: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Apenas master pode criar usuários."""
    if current_user.role != UserRole.master:
        raise HTTPException(status_code=403, detail="Apenas master pode criar usuários")

    # Verifica duplicata
    exists = await db.execute(select(User).where(User.email == req.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email já cadastrado")

    user = User(
        nome=req.nome,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    log = AuditLog(
        acao="CRIAR_USUARIO",
        entidade="usuario",
        entidade_id=str(user.id),
        usuario_id=current_user.id,
        usuario_email=current_user.email,
        dados_depois={"email": user.email, "role": user.role.value},
    )
    db.add(log)
    await db.commit()

    return {"id": user.id, "email": user.email, "role": user.role}
