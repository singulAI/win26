"""
Módulo Acionamentos — abertura de chamados de assistência 24h via Assist24.
"""
from datetime import datetime, timezone
from typing import Optional
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
from app.services.assist24 import assist24

router = APIRouter(prefix="/acionamentos", tags=["Acionamentos"])


class AcionamentoCreate(BaseModel):
    cod_pessoa: int
    cod_veiculo: int
    cod_beneficio: Optional[int] = None
    tipo_servico: str  # ex: "REBOQUE", "PANE_SECA", "CHAVEIRO", "SOCORRO_MECANICO"
    descricao: str
    endereco: str
    cidade: str
    estado: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    dados_extras: Optional[dict] = None


@router.post("/", status_code=201)
async def criar_acionamento(
    payload: AcionamentoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Valida benefício ativo
    try:
        if payload.cod_beneficio:
            beneficio = await siprov.get_beneficio(payload.cod_beneficio)
            if beneficio.get("status") == "CANCELADO":
                raise HTTPException(400, "Benefício cancelado — acionamento não permitido")
    except HTTPException:
        raise
    except Exception:
        pass

    now = datetime.now(timezone.utc)
    protocolo = f"GW-ACN-{now.strftime('%Y%m%d-%H%M%S')}"

    # Tenta acionar Assist24
    assist24_protocolo = None
    try:
        resp = await assist24.criar_acionamento({
            "protocolo_interno": protocolo,
            "tipo_servico": payload.tipo_servico,
            "endereco": payload.endereco,
            "cidade": payload.cidade,
            "estado": payload.estado,
            "lat": payload.lat,
            "lng": payload.lng,
            "dados_associado": {
                "cod_pessoa": payload.cod_pessoa,
                "cod_veiculo": payload.cod_veiculo,
            },
        })
        assist24_protocolo = resp.get("protocolo")
    except Exception:
        pass  # Assist24 não configurado — registra localmente mesmo assim

    case = Case(
        protocolo=protocolo,
        tipo=CaseType.acionamento,
        status=CaseStatus.aberto,
        cod_pessoa=payload.cod_pessoa,
        cod_veiculo=payload.cod_veiculo,
        cod_beneficio=payload.cod_beneficio,
        descricao=f"[{payload.tipo_servico}] {payload.descricao}",
        endereco=payload.endereco,
        cidade=payload.cidade,
        estado=payload.estado,
        lat=payload.lat,
        lng=payload.lng,
        dados_extras={
            "tipo_servico": payload.tipo_servico,
            "assist24_protocolo": assist24_protocolo,
            **(payload.dados_extras or {}),
        },
        usuario_criador_id=current_user.id,
    )
    db.add(case)

    log = AuditLog(
        acao="CRIAR_ACIONAMENTO",
        entidade="case",
        entidade_id=protocolo,
        usuario_id=current_user.id,
        usuario_email=current_user.email,
        dados_depois={
            "protocolo": protocolo,
            "tipo_servico": payload.tipo_servico,
            "assist24_protocolo": assist24_protocolo,
        },
    )
    db.add(log)
    await db.commit()
    await db.refresh(case)

    return {
        "id": case.id,
        "protocolo": case.protocolo,
        "status": case.status,
        "assist24_protocolo": assist24_protocolo,
    }


@router.get("/")
async def listar_acionamentos(
    status: Optional[CaseStatus] = None,
    cidade: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conditions = [Case.tipo == CaseType.acionamento]
    if status:
        conditions.append(Case.status == status)
    if cidade:
        conditions.append(Case.cidade.ilike(f"%{cidade}%"))

    offset = (page - 1) * per_page
    result = await db.execute(
        select(Case).where(and_(*conditions))
        .order_by(Case.created_at.desc())
        .offset(offset).limit(per_page)
    )
    cases = result.scalars().all()
    return {"data": [{"id": c.id, "protocolo": c.protocolo, "status": c.status,
                      "cidade": c.cidade, "tipo_servico": (c.dados_extras or {}).get("tipo_servico"),
                      "created_at": c.created_at} for c in cases],
            "page": page, "per_page": per_page}


@router.get("/{acionamento_id}")
async def detalhar_acionamento(
    acionamento_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Case).where(Case.id == acionamento_id, Case.tipo == CaseType.acionamento)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(404, "Acionamento não encontrado")
    return case
