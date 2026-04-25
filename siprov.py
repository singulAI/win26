"""
Serviço de integração com o ERP Siprov (ana.grupowin.site / Siprov/Sicoob).
Todas as chamadas passam por aqui — endpoints externos sob /ext/
"""
import httpx
from typing import Optional
from app.config import settings


class SiprovService:
    def __init__(self):
        self.base_url = settings.SIPROV_BASE_URL.rstrip("/")
        self.token = settings.SIPROV_TOKEN
        self.timeout = settings.SIPROV_TIMEOUT

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    async def get_pessoa(self, cod_pessoa: int) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/pessoa/{cod_pessoa}",
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def search_pessoa_cpf(self, cpf: str) -> Optional[dict]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/pessoa",
                params={"cpf": cpf},
                headers=self._headers(),
            )
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()

    async def get_veiculo(self, cod_veiculo: int) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/veiculo/{cod_veiculo}",
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def get_beneficio(self, cod_beneficio: int) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/beneficio/{cod_beneficio}",
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def get_titulos(self, cod_pessoa: int, situacao: Optional[str] = None,
                          cod_veiculo: Optional[int] = None) -> list:
        params = {"codPessoa": cod_pessoa}
        if situacao:
            params["situacao"] = situacao
        if cod_veiculo:
            params["codVeiculo"] = cod_veiculo

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/ext/financeiro/titulo",
                params=params,
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def criar_titulo(self, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/financeiro/titulo",
                json=payload,
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def gerar_segunda_via(self, cod_titulo: int) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/ext/financeiro/titulo/{cod_titulo}/segunda-via",
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()


siprov = SiprovService()
