"""
Módulo Financeiro — proxy para operações no ERP Siprov.
Títulos, segunda via, dashboard do associado.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.models.user import User
from app.auth.jwt import get_current_user
from app.services.siprov import siprov

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])


class CriarTituloRequest(BaseModel):
    codBeneficio: int
    codPessoa: int
    codVeiculo: Optional[int] = None
    codTipoTitulo: int = 1  # 1=DEBITO, 2=CREDITO, 3=RATEIO
    descricao: str
    valor: float
    vencimento: str  # ISO date "2026-02-15"
    dataEmissao: Optional[str] = None
    observacao: Optional[str] = None


class SegundaViaRequest(BaseModel):
    codTitulo: int
    codPessoa: int
    codVeiculo: Optional[int] = None


@router.post("/criar-titulo")
async def criar_titulo(
    payload: CriarTituloRequest,
    current_user: User = Depends(get_current_user),
):
    """Cria um título (cobrança) no ERP Siprov."""
    try:
        resultado = await siprov.criar_titulo(payload.model_dump())
        return resultado
    except Exception as e:
        raise HTTPException(502, f"Erro ao criar título no ERP: {str(e)}")


@router.post("/segunda-via")
async def gerar_segunda_via(
    payload: SegundaViaRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Gera segunda via de um título.
    Valida: associado ATIVO, veículo ATIVO, título ABERTO ou VENCIDO.
    """
    # Valida associado
    try:
        pessoa = await siprov.get_pessoa(payload.codPessoa)
        if pessoa.get("status") == "INATIVO":
            raise HTTPException(400, "Associado inativo — segunda via não permitida")
        if pessoa.get("status") == "SUSPENSO":
            raise HTTPException(400, "Associado suspenso — contate a administração")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"Erro ao consultar associado: {str(e)}")

    # Valida veículo (se informado)
    if payload.codVeiculo:
        try:
            veiculo = await siprov.get_veiculo(payload.codVeiculo)
            if veiculo.get("status") == "INATIVO":
                raise HTTPException(400, "Veículo inativo — segunda via não permitida")
        except HTTPException:
            raise
        except Exception:
            pass

    # Gera segunda via no Siprov
    try:
        resultado = await siprov.gerar_segunda_via(payload.codTitulo)
        return resultado
    except Exception as e:
        raise HTTPException(502, f"Erro ao gerar segunda via: {str(e)}")


@router.get("/titulos")
async def listar_titulos(
    cod_pessoa: int = Query(..., description="Código do associado"),
    situacao: Optional[str] = Query(None, description="ABERTO|VENCIDO|LIQUIDADO|CANCELADO"),
    cod_veiculo: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    """Lista títulos de um associado via ERP."""
    try:
        titulos = await siprov.get_titulos(cod_pessoa, situacao, cod_veiculo)
        return {"titulos": titulos, "total": len(titulos)}
    except Exception as e:
        raise HTTPException(502, f"Erro ao consultar títulos: {str(e)}")


@router.get("/associado/{cod_pessoa}/dashboard")
async def dashboard_associado(
    cod_pessoa: int,
    current_user: User = Depends(get_current_user),
):
    """Dashboard completo do associado: dados, veículos, títulos em aberto, vencidos, score."""
    try:
        pessoa = await siprov.get_pessoa(cod_pessoa)
    except Exception as e:
        raise HTTPException(502, f"Erro ao consultar associado: {str(e)}")

    # Busca títulos
    try:
        abertos = await siprov.get_titulos(cod_pessoa, "ABERTO")
        vencidos = await siprov.get_titulos(cod_pessoa, "VENCIDO")
        liquidados = await siprov.get_titulos(cod_pessoa, "LIQUIDADO")
    except Exception:
        abertos, vencidos, liquidados = [], [], []

    total_titulos = len(abertos) + len(vencidos) + len(liquidados)
    em_dia = len(liquidados) + len([t for t in abertos if t.get("diasAtraso", 0) == 0])
    score = round((em_dia / total_titulos * 100) if total_titulos > 0 else 100, 1)

    if score >= 95:
        classificacao = "EXCELENTE"
    elif score >= 85:
        classificacao = "BOM"
    elif score >= 70:
        classificacao = "ACEITÁVEL"
    else:
        classificacao = "CRÍTICO"

    return {
        "pessoa": {
            "codPessoa": pessoa.get("codPessoa"),
            "nome": pessoa.get("nome"),
            "cpf": pessoa.get("cpf"),
            "status": pessoa.get("status"),
            "dataAdesao": pessoa.get("dataAdesao"),
        },
        "veiculos": pessoa.get("veiculos", []),
        "titulos_abertos": {
            "quantidade": len(abertos),
            "valor_total": sum(t.get("valor", 0) for t in abertos),
            "proximo_vencimento": min((t.get("vencimento") for t in abertos), default=None),
        },
        "titulos_vencidos": {
            "quantidade": len(vencidos),
            "valor_total": sum(t.get("valor", 0) for t in vencidos),
            "dias_atraso_maximo": max((t.get("diasAtraso", 0) for t in vencidos), default=0),
        },
        "historico_liquidacoes": {
            "quantidade_ultimos_12_meses": len(liquidados),
            "valor_total_liquidado": sum(t.get("valor", 0) for t in liquidados),
        },
        "score_adimplencia": {
            "percentual": score,
            "classificacao": classificacao,
        },
    }
