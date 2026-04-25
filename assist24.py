"""
Serviço de integração com Assist24 (assistência 24h para acionamentos).
"""
import httpx
from typing import Optional
from app.config import settings


class Assist24Service:
    def __init__(self):
        self.base_url = settings.ASSIST24_BASE_URL.rstrip("/")
        self.token = settings.ASSIST24_TOKEN
        self.timeout = 30

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    async def criar_acionamento(self, payload: dict) -> dict:
        """Abre um chamado de assistência para o associado."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(
                f"{self.base_url}/acionamentos",
                json=payload,
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def consultar_acionamento(self, protocolo: str) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/acionamentos/{protocolo}",
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def listar_prestadores(self, cidade: str, estado: str, servico: str) -> list:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.get(
                f"{self.base_url}/prestadores",
                params={"cidade": cidade, "estado": estado, "servico": servico},
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()


assist24 = Assist24Service()
