"""
Módulo Vistorias — inspeção veicular pré-acionamento.
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel

from app.database import get_db
from app.models.case import Case, CaseType, CaseStatus
from app.models.audit import AuditLog
from app.models.user import User
from app.auth.jwt import get_current_user
from app.services.siprov import siprov

router = APIRouter(prefix="/vistorias", tags=["Vistorias"])


class VistoriaCreate(BaseModel):
    cod_pessoa: int
    cod_veiculo: int
    cod_beneficio: Optional[int] = None
    descricao: str
    observacoes: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    data_agendamento: Optional[datetime] = None
    dados_extras: Optional[dict] = None


class VistoriaUpdate(BaseModel):
    status: Optional[CaseStatus] = None
    observacoes: Optional[str] = None
    usuario_responsavel_id: Optional[int] = None
    data_agendamento: Optional[datetime] = None
    data_conclusao: Optional[datetime] = None
    dados_extras: Optional[dict] = None


def gerar_protocolo(tipo: str) -> str:
    now = datetime.now(timezone.utc)
    return f"GW-{tipo.upper()[:3]}-{now.strftime('%Y%m%d-%H%M%S')}"


@router.post("/", status_code=201)
async def criar_vistoria(
    payload: VistoriaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Valida associado no Siprov (se configurado)
    try:
        pessoa = await siprov.get_pessoa(payload.cod_pessoa)
        if pessoa.get("status") == "INATIVO":
            raise HTTPException(400, "Associado inativo — vistoria não permitida")
    except HTTPException:
        raise
    except Exception:
        pass  # Siprov não configurado ainda — continua

    case = Case(
        protocolo=gerar_protocolo("VIS"),
        tipo=CaseType.vistoria,
        status=CaseStatus.aberto,
        cod_pessoa=payload.cod_pessoa,
        cod_veiculo=payload.cod_veiculo,
        cod_beneficio=payload.cod_beneficio,
        descricao=payload.descricao,
        observacoes=payload.observacoes,
        endereco=payload.endereco,
        cidade=payload.cidade,
        estado=payload.estado,
        data_agendamento=payload.data_agendamento,
        dados_extras=payload.dados_extras,
        usuario_criador_id=current_user.id,
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)

    log = AuditLog(
        acao="CRIAR_VISTORIA",
        entidade="case",
        entidade_id=str(case.id),
        usuario_id=current_user.id,
        usuario_email=current_user.email,
        dados_depois={"protocolo": case.protocolo, "cod_pessoa": case.cod_pessoa},
    )
    db.add(log)
    await db.commit()

    return {"id": case.id, "protocolo": case.protocolo, "status": case.status}


@router.get("/")
async def listar_vistorias(
    status: Optional[CaseStatus] = None,
    cod_pessoa: Optional[int] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conditions = [Case.tipo == CaseType.vistoria]
    if status:
        conditions.append(Case.status == status)
    if cod_pessoa:
        conditions.append(Case.cod_pessoa == cod_pessoa)

    offset = (page - 1) * per_page
    result = await db.execute(
        select(Case).where(and_(*conditions))
        .order_by(Case.created_at.desc())
        .offset(offset).limit(per_page)
    )
    cases = result.scalars().all()
    return {"data": [{"id": c.id, "protocolo": c.protocolo, "status": c.status,
                      "cod_pessoa": c.cod_pessoa, "created_at": c.created_at} for c in cases],
            "page": page, "per_page": per_page}


@router.get("/{vistoria_id}")
async def detalhar_vistoria(
    vistoria_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Case).where(Case.id == vistoria_id, Case.tipo == CaseType.vistoria)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(404, "Vistoria não encontrada")
    return case


@router.patch("/{vistoria_id}")
async def atualizar_vistoria(
    vistoria_id: int,
    payload: VistoriaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Case).where(Case.id == vistoria_id, Case.tipo == CaseType.vistoria)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(404, "Vistoria não encontrada")

    dados_antes = {"status": case.status.value if case.status else None}
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(case, field, value)

    log = AuditLog(
        acao="ATUALIZAR_VISTORIA",
        entidade="case",
        entidade_id=str(case.id),
        usuario_id=current_user.id,
        usuario_email=current_user.email,
        dados_antes=dados_antes,
        dados_depois=payload.model_dump(exclude_none=True),
    )
    db.add(log)
    await db.commit()
    await db.refresh(case)
    return case
