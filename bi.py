"""
Módulo BI — funil de conversão e métricas operacionais.
"""
from typing import Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.database import get_db
from app.models.case import Case, CaseType, CaseStatus
from app.models.user import User, UserRole
from app.auth.rbac import require_role

router = APIRouter(prefix="/bi", tags=["BI / Métricas"])


@router.get("/funil")
async def funil_operacional(
    dias: int = Query(30, description="Janela de dias para análise"),
    tipo: Optional[str] = Query(None, description="vistoria|revisoria|acionamento"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master, UserRole.financeiro)),
):
    """Funil de conversão: abertos → em andamento → concluídos → cancelados."""
    since = datetime.now(timezone.utc) - timedelta(days=dias)

    conditions = [Case.created_at >= since]
    if tipo:
        try:
            conditions.append(Case.tipo == CaseType(tipo))
        except ValueError:
            pass

    # Contagem por status
    result = await db.execute(
        select(Case.tipo, Case.status, func.count(Case.id))
        .where(and_(*conditions))
        .group_by(Case.tipo, Case.status)
    )
    rows = result.all()

    funil = {}
    for case_tipo, case_status, count in rows:
        t = case_tipo.value
        s = case_status.value
        if t not in funil:
            funil[t] = {}
        funil[t][s] = count

    # Total e taxa de conclusão
    resumo = {}
    for t, statuses in funil.items():
        total = sum(statuses.values())
        concluidos = statuses.get("concluido", 0)
        cancelados = statuses.get("cancelado", 0)
        resumo[t] = {
            "total": total,
            "abertos": statuses.get("aberto", 0),
            "em_andamento": statuses.get("em_andamento", 0),
            "concluidos": concluidos,
            "cancelados": cancelados,
            "taxa_conclusao": round(concluidos / total * 100, 1) if total > 0 else 0,
        }

    return {
        "janela_dias": dias,
        "periodo_inicio": since.isoformat(),
        "periodo_fim": datetime.now(timezone.utc).isoformat(),
        "funil": resumo,
    }


@router.get("/volume")
async def volume_diario(
    dias: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master, UserRole.financeiro)),
):
    """Volume diário de casos criados nos últimos N dias."""
    since = datetime.now(timezone.utc) - timedelta(days=dias)

    result = await db.execute(
        select(
            func.date_trunc("day", Case.created_at).label("dia"),
            Case.tipo,
            func.count(Case.id).label("total"),
        )
        .where(Case.created_at >= since)
        .group_by("dia", Case.tipo)
        .order_by("dia")
    )
    rows = result.all()

    data = []
    for dia, tipo, total in rows:
        data.append({
            "data": dia.strftime("%Y-%m-%d") if dia else None,
            "tipo": tipo.value,
            "total": total,
        })

    return {"data": data}
