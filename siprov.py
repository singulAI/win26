"""
Serviço de integração com o ERP Siprov.
Base URL real: https://acesso.siprov.com.br/siprov-api
Auth: Basic Auth (user+pass) → Bearer Token (12h validade)
Spec OpenAPI v1.57: /ext/autenticacao, /ext/associado, /ext/beneficio, /ext/financeiro/titulo, /ext/evento, /ext/vistoria
"""
import base64
import time
import httpx
from typing import Optional
from app.config import settings


class SiprovService:
    BASE_URL = "https://acesso.siprov.com.br/siprov-api"

    def __init__(self):
        # Permite override via config (ex: ambiente de homologação)
        self.base_url = (settings.SIPROV_BASE_URL or self.BASE_URL).rstrip("/")
        self.user = settings.SIPROV_USER
        self.password = settings.SIPROV_PASSWORD
        self.timeout = settings.SIPROV_TIMEOUT
        self._token: Optional[str] = None
        self._token_expires_at: float = 0.0  # epoch seconds

    # ─── Autenticação ────────────────────────────────────────────────────────

    async def _get_token(self) -> str:
        """Retorna Bearer token válido, renovando se expirado (validade 12h)."""
        now = time.monotonic()
        if self._token and now < self._token_expires_at:
            return self._token

        credentials = base64.b64encode(
            f"{self.user}:{self.password}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/autenticacao",
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Accept": "application/json",
                },
            )
            r.raise_for_status()
            data = r.json()

        self._token = data["authorizationToken"]
        self._token_expires_at = now + 11 * 3600  # 11h (margem de 1h)
        return self._token

    async def _headers(self) -> dict:
        token = await self._get_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # ─── Associado (/ext/associado) ──────────────────────────────────────────

    async def search_associado(self, **params) -> list:
        """GET /ext/associado — pesquisa com filtros opcionais:
        nome, cpf, cnpj, codPessoa, codLoja, situacaoBeneficio, codPlano, uf, dataAtualizacao
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/associado",
                params={k: v for k, v in params.items() if v is not None},
                headers=await self._headers(),
            )
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else [data]

    async def get_associado(self, cod_pessoa: int) -> Optional[dict]:
        """Retorna o primeiro associado com codPessoa informado, ou None."""
        results = await self.search_associado(codPessoa=cod_pessoa)
        return results[0] if results else None

    async def search_associado_cpf(self, cpf: str) -> Optional[dict]:
        results = await self.search_associado(cpf=cpf)
        return results[0] if results else None

    async def criar_associado(self, payload: dict) -> dict:
        """POST /ext/associado — retorna {'codPessoa': int}"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/associado",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_lojas(self) -> list:
        """GET /ext/associado/loja"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/associado/loja",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Benefício (/ext/beneficio) ──────────────────────────────────────────

    async def search_beneficio(self, **params) -> list:
        """GET /ext/beneficio — filtros: cpf, cnpj, placa, chassi, sequencial,
        numeroCartaoDesconto, situacaoBeneficio, codPlano
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/beneficio",
                params={k: v for k, v in params.items() if v is not None},
                headers=await self._headers(),
            )
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else [data]

    async def validar_beneficio(self, matricula: Optional[str] = None,
                                 sequencial: Optional[int] = None) -> dict:
        """POST /ext/beneficio/validacao — retorna status, nome, cpf"""
        payload = {}
        if matricula:
            payload["matricula"] = matricula
        if sequencial:
            payload["sequencial"] = sequencial
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/beneficio/validacao",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def criar_beneficio(self, payload: dict) -> dict:
        """POST /ext/beneficio — payload: codPlano*(int), codLoja(int), cpfCnpj, diaVencimento..."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/beneficio",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def criar_beneficio_veicular(self, payload: dict) -> dict:
        """POST /ext/beneficio/veicular — inclui placa, chassi, marca, modelo, etc."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/beneficio/veicular",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def cancelar_beneficio(self, cod_beneficio: int, motivo: Optional[str] = None) -> dict:
        """PUT /ext/beneficio/{codBeneficio}/cancelar"""
        payload = {}
        if motivo:
            payload["motivo"] = motivo
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.put(
                f"{self.base_url}/ext/beneficio/{cod_beneficio}/cancelar",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_itens_beneficio(self, cod_beneficio: int) -> list:
        """GET /ext/beneficio/{codBeneficio}/itens — planos/coberturas do contrato"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/beneficio/{cod_beneficio}/itens",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_dependentes(self, cod_beneficio: int) -> list:
        """GET /ext/beneficio/{codBeneficio}/dependentes"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/beneficio/{cod_beneficio}/dependentes",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Financeiro (/ext/financeiro) ────────────────────────────────────────

    async def pesquisar_titulos(self, tipo: str = "DEBITO", **params) -> list:
        """GET /ext/financeiro/titulo — tipo* obrigatório: DEBITO, CREDITO, RATEIO
        Outros filtros: cpfCnpj, situacao (repetível), placa, dataEmissaoInicial/Final,
        dataVencimentoInicial/Final, dataLiquidacaoInicial/Final, inicio
        """
        query = {"tipo": tipo}
        query.update({k: v for k, v in params.items() if v is not None})
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/financeiro/titulo",
                params=query,
                headers=await self._headers(),
            )
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else [data]

    async def criar_titulo(self, payload: dict) -> dict:
        """POST /ext/financeiro/titulo
        Campos obrigatórios: codBeneficio, codPessoa, codTipoTitulo, valor
        Opcionais: descricao, vencimento
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/financeiro/titulo",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def emitir_boleto(self, cod_titulo: int) -> dict:
        """POST /ext/financeiro/titulo/{codTitulo}/boleto — emite/gera segunda via de boleto"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/financeiro/titulo/{cod_titulo}/boleto",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def recuperar_boleto(self, cod_titulo: int) -> dict:
        """GET /ext/financeiro/titulo/{codTitulo}/boleto — recupera boleto existente"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/financeiro/titulo/{cod_titulo}/boleto",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def liquidar_titulo(self, cod_titulo: int, valor_pago: float,
                               cod_tipo_liquidacao: int, observacao: Optional[str] = None) -> dict:
        """POST /ext/financeiro/titulo/liquidar"""
        payload = {
            "codTitulo": cod_titulo,
            "valorPago": valor_pago,
            "codTipoLiquidacao": cod_tipo_liquidacao,
        }
        if observacao:
            payload["observacao"] = observacao
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/financeiro/titulo/liquidar",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_tipos_titulo(self) -> list:
        """GET /ext/financeiro/tipoTitulo"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/financeiro/tipoTitulo",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_formas_pagamento(self) -> list:
        """GET /ext/financeiro/formaPagamento"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/financeiro/formaPagamento",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Eventos (/ext/evento) ───────────────────────────────────────────────

    async def pesquisar_eventos(self, **params) -> list:
        """GET /ext/evento — filtros: codPessoa, cpfCnpj, protocolo,
        dataAberturaInicial/Final, dataEventoInicial/Final
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/evento",
                params={k: v for k, v in params.items() if v is not None},
                headers=await self._headers(),
            )
            r.raise_for_status()
            data = r.json()
            return data if isinstance(data, list) else [data]

    async def get_evento(self, cod_evento: int) -> dict:
        """GET /ext/evento/{codEvento}"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/evento/{cod_evento}",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Vistoria (/ext/vistoria) ────────────────────────────────────────────

    async def criar_vistoria(self, cod_beneficio: int, cod_tipo: int,
                              observacao: Optional[str] = None) -> dict:
        """POST /ext/vistoria — cria processo de vistoria no ERP Siprov
        Retorna: codVistoria, checkList, fotos, situacao, etc.
        """
        payload: dict = {"codBeneficio": cod_beneficio, "codTipo": cod_tipo}
        if observacao:
            payload["observacao"] = observacao
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/vistoria",
                json=payload,
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def get_vistoria(self, cod_vistoria: int) -> dict:
        """GET /ext/vistoria/{codVistoria}"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/vistoria/{cod_vistoria}",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_tipos_vistoria(self) -> list:
        """GET /ext/vistoria/tipos"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/vistoria/tipos",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Rede de Parceiros (/ext/rede) ───────────────────────────────────────

    async def listar_parceiros(self, **params) -> list:
        """GET /ext/rede/parceiro — filtros opcionais via params"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/rede/parceiro",
                params={k: v for k, v in params.items() if v is not None},
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_regioes(self) -> list:
        """GET /ext/rede/regiao"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/rede/regiao",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()

    # ─── Negociações (/ext/negociacao) ───────────────────────────────────────

    async def listar_negociacoes(self) -> list:
        """GET /ext/negociacao"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/negociacao",
                headers=await self._headers(),
            )
            r.raise_for_status()
            return r.json()


siprov = SiprovService()
