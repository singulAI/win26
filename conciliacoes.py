from datetime import date
from io import StringIO
import csv

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select, func, insert, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.rbac import require_role
from app.database import get_db
from app.models.audit import AuditLog
from app.models.integration import (
    IntegrationFornecedor,
    IntegrationMatch,
    IntegrationMatchStatus,
    IntegrationReport,
)
from app.models.user import User, UserRole
from app.services.reconciliation import compare_matches_with_active_report, process_reconciliation_file

router = APIRouter(prefix="/admin/conciliacoes", tags=["Admin - Conciliacoes"])
integrations_router = APIRouter(
    prefix="/admin/integrations/reconciliation",
    tags=["Admin - Integrations Reconciliation"],
)


class UploadResponse(BaseModel):
    report_id: int
    fornecedor: str
    periodo_ref: str
    total_registros: int
    total_matches: int
    total_divergencias: int
    comparado_com_relatorio_base: bool
    total_registros_base: int | None = None


@router.post("/upload", response_model=UploadResponse)
async def upload_conciliacao(
    fornecedor: IntegrationFornecedor = Form(...),
    periodo_ref: date = Form(...),
    arquivo: UploadFile = File(...),
    arquivo_base_ativos: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """
    Realiza upload de conciliação com 3 passos:
    1. Preprocessa arquivo (validação, normalização, dedup local)
    2. Cruza com base interna (busca cases, determina status)
    3. Persiste matches com bulk insert (performance)
    """
    if not arquivo.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await arquivo.read()
    if not content:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    # Passo 1: Preprocessamento
    try:
        processing = process_reconciliation_file(arquivo.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Falha ao ler arquivo de conciliacao '{arquivo.filename}': {exc}")
        raise HTTPException(
            status_code=400,
            detail="Nao foi possivel ler o arquivo enviado. Verifique se a planilha esta em .xlsx ou .csv valido e contem cabecalhos.",
        ) from exc

    base_content: bytes | None = None
    base_filename: str | None = None
    if arquivo_base_ativos and arquivo_base_ativos.filename:
        base_filename = arquivo_base_ativos.filename
        base_content = await arquivo_base_ativos.read()
        if not base_content:
            raise HTTPException(status_code=400, detail="Relatório base de veículos ativos vazio")

    comparado_com_relatorio_base = False
    total_registros_base: int | None = None

    # Passo 2: Cruzamento com relatório-base de veículos ativos enviado no momento da análise.
    try:
        if base_filename and base_content:
            (
                total_matches_corrected,
                total_divergencias_corrected,
                _,
                total_registros_base,
            ) = compare_matches_with_active_report(processing.matches, base_filename, base_content)
            comparado_com_relatorio_base = True
        else:
            total_matches_corrected = processing.total_matches
            total_divergencias_corrected = processing.total_divergencias
    except Exception as exc:
        print(f"Cruzamento falhou, usando preprocessamento: {exc}")
        total_matches_corrected = processing.total_matches
        total_divergencias_corrected = processing.total_divergencias

    # Passo 3: Persiste report
    report = IntegrationReport(
        fornecedor=fornecedor,
        periodo_ref=periodo_ref,
        total_registros=processing.total_registros,
        total_matches=total_matches_corrected,
        total_divergencias=total_divergencias_corrected,
        conciliado=False,
        criado_por=current_user.id,
    )
    db.add(report)
    await db.flush()  # Obtém report.id sem commit
    
    # Bulk insert de matches
    if processing.matches:
        bulk_data = [
            {
                "report_id": report.id,
                "placa_normalizada": m["placa_normalizada"],
                "case_id": m["case_id"],
                "status_match": m["status_match"],
                "dados_fornecedor": m["dados_fornecedor"],
                "dados_interno": m["dados_interno"],
            }
            for m in processing.matches
        ]
        await db.execute(insert(IntegrationMatch), bulk_data)

    # Auditoria
    audit = AuditLog(
        acao="CONCILIACAO_UPLOAD",
        entidade="integration_reports",
        entidade_id=str(report.id),
        usuario_id=current_user.id,
        usuario_email=current_user.email,
        dados_depois={
            "fornecedor": fornecedor.value,
            "periodo_ref": periodo_ref.isoformat(),
            "total_registros": processing.total_registros,
            "total_matches": total_matches_corrected,
            "total_divergencias": total_divergencias_corrected,
            "comparado_com_relatorio_base": comparado_com_relatorio_base,
            "total_registros_base": total_registros_base,
            "arquivo_base_ativos": base_filename,
        },
    )
    db.add(audit)
    await db.commit()
    await db.refresh(report)

    return UploadResponse(
        report_id=report.id,
        fornecedor=report.fornecedor.value,
        periodo_ref=report.periodo_ref.isoformat(),
        total_registros=report.total_registros,
        total_matches=report.total_matches,
        total_divergencias=report.total_divergencias,
        comparado_com_relatorio_base=comparado_com_relatorio_base,
        total_registros_base=total_registros_base,
    )


@router.patch("/{report_id}/conciliar")
async def marcar_conciliado(
    report_id: int,
    conciliado: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Marca um relatório como conciliado (validado pela equipe financeira)."""
    result = await db.execute(select(IntegrationReport).where(IntegrationReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    report.conciliado = conciliado
    db.add(
        AuditLog(
            acao="CONCILIACAO_MARCAR_CONCILIADO",
            entidade="integration_reports",
            entidade_id=str(report.id),
            usuario_id=current_user.id,
            usuario_email=current_user.email,
            dados_depois={"conciliado": conciliado},
        )
    )
    await db.commit()
    return {"id": report.id, "conciliado": report.conciliado}


@router.delete("/{report_id}")
async def remover_conciliacao(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Remove um relatório de conciliação e todos os matches associados."""
    result = await db.execute(select(IntegrationReport).where(IntegrationReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    report_snapshot = {
        "id": report.id,
        "fornecedor": report.fornecedor.value,
        "periodo_ref": report.periodo_ref.isoformat(),
        "total_registros": report.total_registros,
        "total_matches": report.total_matches,
        "total_divergencias": report.total_divergencias,
        "conciliado": report.conciliado,
    }

    await db.execute(delete(IntegrationMatch).where(IntegrationMatch.report_id == report_id))
    await db.execute(delete(IntegrationReport).where(IntegrationReport.id == report_id))
    db.add(
        AuditLog(
            acao="CONCILIACAO_REMOVER",
            entidade="integration_reports",
            entidade_id=str(report_id),
            usuario_id=current_user.id,
            usuario_email=current_user.email,
            dados_antes=report_snapshot,
        )
    )
    await db.commit()

    return {"id": report_id, "removido": True}


@router.get("/resumo")
async def resumo_agregado_conciliacoes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Retorna resumo agregado: totais por fornecedor, duplicidades, divergências."""
    # Totais por fornecedor
    result = await db.execute(
        select(
            IntegrationReport.fornecedor,
            func.count(IntegrationReport.id).label("total_reports"),
            func.sum(IntegrationReport.total_registros).label("total_registros"),
            func.sum(IntegrationReport.total_matches).label("total_matches"),
            func.sum(IntegrationReport.total_divergencias).label("total_divergencias"),
        ).group_by(IntegrationReport.fornecedor)
    )
    
    fornecedor_stats = {}
    for row in result.all():
        fornecedor_stats[row.fornecedor.value] = {
            "reports": row.total_reports or 0,
            "registros": row.total_registros or 0,
            "matches": row.total_matches or 0,
            "divergencias": row.total_divergencias or 0,
        }
    
    # Contagem de placas duplicadas
    try:
        duplicadas_result = await db.execute(
            select(func.count(IntegrationMatch.id)).where(
                IntegrationMatch.dados_interno["motivo_preprocessamento"].as_string() == "placa_duplicada_no_arquivo"
            )
        )
        duplicadas_count = duplicadas_result.scalar() or 0
    except Exception:
        fallback_result = await db.execute(select(IntegrationMatch.dados_interno))
        duplicadas_count = sum(
            1
            for dados_interno in fallback_result.scalars()
            if isinstance(dados_interno, dict)
            and dados_interno.get("motivo_preprocessamento") == "placa_duplicada_no_arquivo"
        )
    
    return {
        "por_fornecedor": fornecedor_stats,
        "placas_duplicadas": duplicadas_count,
        "timestamp": None,  # Será preenchido automaticamente
    }


@router.get("")
async def listar_conciliacoes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Lista todos os relatórios de conciliação (com paginação implícita)."""
    try:
        result = await db.execute(select(IntegrationReport).order_by(IntegrationReport.criado_em.desc()))
        reports = result.scalars().all()
    except Exception as e:
        print(f"[ERR] Query falhou: {e}")
        return []
    
    return [
        {
            "id": r.id,
            "fornecedor": r.fornecedor.value,
            "periodo_ref": r.periodo_ref.isoformat(),
            "total_registros": r.total_registros,
            "total_matches": r.total_matches,
            "total_divergencias": r.total_divergencias,
            "conciliado": r.conciliado,
            "criado_em": r.criado_em.isoformat() if r.criado_em else None,
            "atualizado_em": r.atualizado_em.isoformat() if r.atualizado_em else None,
        }
        for r in reports
    ]


@router.get("/{report_id}")
async def detalhe_conciliacao(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Retorna detalhe de um relatório com breakdown por status."""
    result = await db.execute(select(IntegrationReport).where(IntegrationReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    matches_result = await db.execute(
        select(IntegrationMatch.status_match, func.count(IntegrationMatch.id))
        .where(IntegrationMatch.report_id == report_id)
        .group_by(IntegrationMatch.status_match)
    )
    breakdown = {status.value: count for status, count in matches_result.all()}

    return {
        "id": report.id,
        "fornecedor": report.fornecedor.value,
        "periodo_ref": report.periodo_ref.isoformat(),
        "totais": {
            "registros": report.total_registros,
            "matches": report.total_matches,
            "divergencias": report.total_divergencias,
        },
        "breakdown_status": breakdown,
        "conciliado": report.conciliado,
        "criado_em": report.criado_em.isoformat() if report.criado_em else None,
        "atualizado_em": report.atualizado_em.isoformat() if report.atualizado_em else None,
    }


@router.get("/{report_id}/divergencias")
async def listar_divergencias(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Lista divergências do relatório (não_encontrado + duplicatas)."""
    result = await db.execute(
        select(IntegrationMatch)
        .where(
            IntegrationMatch.report_id == report_id,
            IntegrationMatch.status_match.in_(
                [IntegrationMatchStatus.divergente, IntegrationMatchStatus.nao_encontrado]
            ),
        )
        .order_by(IntegrationMatch.id.desc())
    )
    rows = result.scalars().all()

    return [
        {
            "id": m.id,
            "placa_normalizada": m.placa_normalizada,
            "status_match": m.status_match.value,
            "dados_fornecedor": m.dados_fornecedor,
            "dados_interno": m.dados_interno,
            "criado_em": m.criado_em.isoformat() if m.criado_em else None,
        }
        for m in rows
    ]


@router.get("/{report_id}/download")
async def download_conciliacao_csv(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Download de relatório em CSV."""
    result = await db.execute(select(IntegrationReport).where(IntegrationReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    matches_result = await db.execute(
        select(IntegrationMatch).where(IntegrationMatch.report_id == report_id).order_by(IntegrationMatch.id.asc())
    )
    rows = matches_result.scalars().all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "placa_normalizada", "status_match", "case_id", "motivo"])
    for m in rows:
        motivo = m.dados_interno.get("motivo_preprocessamento", "") if m.dados_interno else ""
        writer.writerow([m.id, m.placa_normalizada or "", m.status_match.value, m.case_id or "", motivo])

    output.seek(0)
    filename = f"conciliacao_{report_id}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@integrations_router.post("/upload", response_model=UploadResponse)
async def integrations_upload_alias(
    fornecedor: IntegrationFornecedor,
    periodo_ref: date,
    arquivo: UploadFile = File(...),
    arquivo_base_ativos: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Alias para POST /admin/conciliacoes/upload (compatibilidade README)."""
    return await upload_conciliacao(fornecedor, periodo_ref, arquivo, arquivo_base_ativos, db, current_user)


@integrations_router.get("")
async def integrations_resumo_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Alias para GET /admin/conciliacoes/resumo (compatibilidade README)."""
    return await resumo_agregado_conciliacoes(db, current_user)


@integrations_router.get("/download")
async def integrations_download_alias(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.master)),
):
    """Alias para GET /admin/conciliacoes/{report_id}/download (compatibilidade README)."""
    return await download_conciliacao_csv(report_id, db, current_user)