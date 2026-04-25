"""
Módulo AI — proxy para chat IA com contexto do associado.
"""
import httpx
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.models.user import User
from app.auth.jwt import get_current_user
from app.services.siprov import siprov

router = APIRouter(prefix="/ai", tags=["AI Chat"])

SYSTEM_PROMPT = """Você é o assistente virtual do Grupo Win, uma cooperativa de proteção veicular.
Você ajuda associados com dúvidas sobre: cobranças, segunda via de boletos, vistorias, acionamentos e situação do benefício.
Seja objetivo, gentil e sempre em português brasileiro.
Se não souber responder, oriente o associado a ligar para o suporte.
NÃO forneça informações financeiras sem confirmar o CPF do associado."""


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    cod_pessoa: Optional[int] = None  # contexto do associado


@router.post("/chat")
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Proxy para AI com contexto do associado Grupo Win."""
    if not settings.AI_API_KEY:
        raise HTTPException(503, "Serviço de AI não configurado")

    # Monta contexto do associado
    context_msg = ""
    if req.cod_pessoa:
        try:
            pessoa = await siprov.get_pessoa(req.cod_pessoa)
            context_msg = f"\n[CONTEXTO DO ASSOCIADO]\nNome: {pessoa.get('nome')}\nStatus: {pessoa.get('status')}\nData Adesão: {pessoa.get('dataAdesao')}"
        except Exception:
            pass

    system = SYSTEM_PROMPT + context_msg

    messages = [{"role": "system", "content": system}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{settings.AI_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
            json={
                "model": settings.AI_MODEL,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.3,
            },
        )
        if r.status_code != 200:
            raise HTTPException(502, f"Erro na API de AI: {r.status_code}")

        data = r.json()
        reply = data["choices"][0]["message"]["content"]

    return {"resposta": reply, "model": settings.AI_MODEL}
