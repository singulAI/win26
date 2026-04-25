from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "grupowin"}

    id = Column(Integer, primary_key=True, index=True)
    acao = Column(String(100), nullable=False, index=True)
    entidade = Column(String(100), nullable=True)  # ex: "case", "titulo", "usuario"
    entidade_id = Column(String(100), nullable=True)
    usuario_id = Column(Integer, ForeignKey("grupowin.api_users.id"), nullable=True)
    usuario_email = Column(String(200), nullable=True)
    ip_origem = Column(String(50), nullable=True)
    dados_antes = Column(JSON, nullable=True)
    dados_depois = Column(JSON, nullable=True)
    observacao = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
