from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO, StringIO
import csv
import re
from typing import Any
import unicodedata

from openpyxl import load_workbook

from app.models.integration import IntegrationMatchStatus


@dataclass
class ProcessResult:
    """Resultado do processamento de arquivo: estatísticas + lista de matches."""
    total_registros: int
    total_matches: int
    total_divergencias: int
    matches: list[dict[str, Any]]


# Variações de nome para coluna de placa (case-insensitive)
PLATE_COLUMNS = {
    "placa",
    "placa_veiculo",
    "placa veículo",
    "placa veiculo",
    "placa do veiculo",
    "placa do veículo",
    "placa associado",
    "placa do associado",
    "placa beneficiario",
    "placa do beneficiario",
    "placa do carro",
    "placa automovel",
    "placa do automovel",
    "vehicle_plate",
    "plate",
    "veiculo_placa",
}


def _normalize_plate(value: str | None) -> str | None:
    """Normaliza placa: remove não-alfanuméricos, maiúsculas. Retorna None se vazio."""
    if not value:
        return None
    normalized = re.sub(r"[^A-Za-z0-9]", "", value).upper()
    return normalized or None


def _normalize_key(value: str | None) -> str:
    """Normaliza chave de header: sem acentos, sem pontuação e com espaço único."""
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", str(value).strip().lower())
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _extract_rows_from_xlsx(content: bytes) -> list[dict[str, Any]]:
    """Extrai linhas de arquivo XLSX usando openpyxl. Pula línhas vazias."""
    wb = load_workbook(BytesIO(content), data_only=True)
    ws = wb.active

    rows_iter = ws.iter_rows(values_only=True)
    headers = next(rows_iter, None)
    if not headers:
        raise ValueError("Arquivo XLSX está vazio ou sem headers")

    normalized_headers = [str(h).strip() if h is not None else "" for h in headers]
    if not any(normalized_headers):
        raise ValueError("Nenhum cabeçalho detectado no XLSX")

    rows: list[dict[str, Any]] = []
    for row in rows_iter:
        if row is None:
            continue
        payload = {
            normalized_headers[i]: row[i] if i < len(row) else None
            for i in range(len(normalized_headers))
            if normalized_headers[i]
        }
        # Ignora linha completamente vazia
        if any(v not in (None, "") for v in payload.values()):
            rows.append(payload)
    
    return rows


def _extract_rows_from_csv(content: bytes) -> list[dict[str, Any]]:
    """Extrai linhas de arquivo CSV usando csv.DictReader."""
    buffer = StringIO(content.decode("utf-8", errors="ignore"))
    reader = csv.DictReader(buffer)
    if reader.fieldnames is None or not reader.fieldnames:
        raise ValueError("Arquivo CSV está vazio ou sem headers")
    
    rows = [dict(r) for r in reader if any(v for v in r.values() if v)]  # Ignora linhas vazias
    return rows


def _extract_rows(filename: str, content: bytes) -> list[dict[str, Any]]:
    """Dispatcher: detecta formato e extrai linhas."""
    lower = filename.lower()
    if lower.endswith(".xlsx"):
        return _extract_rows_from_xlsx(content)
    if lower.endswith(".csv"):
        return _extract_rows_from_csv(content)
    raise ValueError("Formato inválido. Envie .xlsx ou .csv")


def _find_plate_column(headers: set[str]) -> str | None:
    """Encontra nome da coluna de placa nos headers normalizados."""
    normalized_candidates = {_normalize_key(candidate) for candidate in PLATE_COLUMNS}

    for key in headers:
        if key in normalized_candidates:
            return key

    for key in headers:
        if "placa" in key.split():
            return key

    for key in headers:
        if "placa" in key:
            return key

    return None


def _validate_file_structure(rows: list[dict[str, Any]]) -> None:
    """Valida que arquivo tem coluna de placa."""
    if not rows:
        raise ValueError("Arquivo sem dados (ou apenas headers)")
    
    first_row_keys = {_normalize_key(k) for k in rows[0].keys()}
    plate_col = _find_plate_column(first_row_keys)
    
    if not plate_col:
        plate_options = ", ".join(PLATE_COLUMNS)
        found_headers = ", ".join(str(key) for key in rows[0].keys())
        raise ValueError(
            f"Nenhuma coluna de placa encontrada. Esperado um de: {plate_options}. Cabecalhos encontrados: {found_headers}"
        )



def process_reconciliation_file(filename: str, content: bytes) -> ProcessResult:
    """
    Processa arquivo de conciliação:
    1. Extrai e valida estrutura
    2. Normaliza placas
    3. Detecta duplicatas E placas inválidas
    4. Retorna resultado para posterior cruzamento com base interna
    
    IMPORTANTE: Não faz cruzamento neste ponto. Apenas preprocessing.
    Cruzamento é feito async em conciliacoes.py com função crosscheck.
    """
    rows = _extract_rows(filename, content)
    _validate_file_structure(rows)  # Valida presença de coluna placa
    
    if not rows:
        return ProcessResult(0, 0, 0, [])

    # Encontra coluna placa (normalizada)
    first_row_normalized = {_normalize_key(k): k for k in rows[0].keys()}
    plate_col_normalized = _find_plate_column(set(first_row_normalized.keys()))
    plate_col_original = first_row_normalized.get(plate_col_normalized, "placa") if plate_col_normalized else "placa"

    seen_plates: dict[str | None, int] = {}  # plate → count para detectar duplicatas
    matches: list[dict[str, Any]] = []
    
    for idx, row in enumerate(rows):
        # Encontra valor da placa na row
        plate_raw = None
        for key in row.keys():
            if _normalize_key(key) == plate_col_normalized:
                plate_raw = row[key]
                break
        
        plate = _normalize_plate(str(plate_raw) if plate_raw is not None else None)
        
        # Marca duplicatas (INCLUSIVE primeira ocorrência)
        if plate:
            seen_plates[plate] = seen_plates.get(plate, 0) + 1
        else:
            seen_plates[None] = seen_plates.get(None, 0) + 1
        
        # Status será determinado no cruzamento, inicialmente assume-se nao_encontrado
        status = IntegrationMatchStatus.nao_encontrado
        internal_data = {
            "linha": idx + 2,  # +2 = +1 para header, +1 para 1-indexed
            "motivo_preprocessamento": None,
        }
        
        # Validações de preprocessamento
        if not plate:
            status = IntegrationMatchStatus.divergente
            internal_data["motivo_preprocessamento"] = "placa_inválida_ou_vazia"
        
        matches.append({
            "placa_normalizada": plate,
            "case_id": None,
            "status_match": status,  # Preliminar; será revisado no crosscheck
            "dados_fornecedor": row,
            "dados_interno": internal_data,
        })
    
    # Marca TODAS as duplicatas como divergentes (flag para revisão manual)
    duplicata_plates = {p for p, count in seen_plates.items() if count > 1}
    total_divergencias = len(duplicata_plates) * seen_plates.get(None, 0)  # Contagem incorreta; será corrigida abaixo
    total_divergencias = 0  # Reset
    
    for match in matches:
        if match["placa_normalizada"] in duplicata_plates:
            match["status_match"] = IntegrationMatchStatus.divergente
            if not match["dados_interno"].get("motivo_preprocessamento"):
                match["dados_interno"]["motivo_preprocessamento"] = "placa_duplicada_no_arquivo"
            total_divergencias += 1
        elif match["dados_interno"].get("motivo_preprocessamento"):
            total_divergencias += 1
            match["status_match"] = IntegrationMatchStatus.divergente
    
    total = len(matches)
    total_matches = total - total_divergencias
    
    return ProcessResult(
        total_registros=total,
        total_matches=total_matches,
        total_divergencias=total_divergencias,
        matches=matches,
    )


async def crosscheck_matches_with_database(
    matches: list[dict[str, Any]], 
    session: Any  # AsyncSession, mas evita import circular
) -> tuple[int, int, int]:
    """
    Cruza matches com a base interna (`cases` table).
    Atualiza status_match e dados_interno baseado no cruzamento.
    
    Retorna: (total_matches_corrigido, total_divergencias_corrigido, total_matches_encontrados)
    """
    from sqlalchemy import select, func
    from app.models.case import Case
    
    # Agrupa matches por placa para cruzamento eficiente
    plates_to_find = {m["placa_normalizada"] for m in matches if m["placa_normalizada"]}
    
    if not plates_to_find:
        # Nenhuma placa válida: todos permanecem divergentes
        total_divergencias = sum(1 for m in matches if m["status_match"] == IntegrationMatchStatus.divergente)
        return 0, total_divergencias, 0
    
    # Query: encontra cases com placa correspondente
    # NOTA: presume que `Case` tem coluna `placa` normalizada ou método de busca
    # Se não estiver, esta query falhará — ajuste conforme schema real
    stmt = select(Case.id, Case.placa).where(Case.placa.in_(plates_to_find))
    result = await session.execute(stmt)
    case_map = {row.placa: row.id for row in result.fetchall()}
    
    total_matches_corrected = 0
    total_divergencias_corrected = 0
    
    for match in matches:
        placa = match["placa_normalizada"]
        
        # Se já marcado como divergente em preprocessamento, mantém
        if match["dados_interno"].get("motivo_preprocessamento"):
            match["status_match"] = IntegrationMatchStatus.divergente
            total_divergencias_corrected += 1
            continue
        
        # Busca case correspondente
        if placa in case_map:
            match["case_id"] = case_map[placa]
            match["status_match"] = IntegrationMatchStatus.encontrado
            match["dados_interno"]["motivo_preprocessamento"] = None
            match["dados_interno"]["case_id_encontrado"] = case_map[placa]
            total_matches_corrected += 1
        else:
            # Não encontrado na base interna
            match["status_match"] = IntegrationMatchStatus.nao_encontrado
            match["dados_interno"]["motivo_preprocessamento"] = "case_nao_encontrado_na_base"
            total_divergencias_corrected += 1
    
    total_encontrados = sum(1 for m in matches if m["status_match"] == IntegrationMatchStatus.encontrado)
    
    return total_matches_corrected, total_divergencias_corrected, total_encontrados