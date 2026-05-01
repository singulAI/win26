from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    JSON,
    Boolean,
)
from sqlalchemy.sql import func
from app.database import Base
import enum


class IntegrationFornecedor(str, enum.Enum):
    mais_vantagens = "mais_vantagens"
    riskin = "riskin"


class IntegrationMatchStatus(str, enum.Enum):
    encontrado = "encontrado"
    nao_encontrado = "nao_encontrado"
    divergente = "divergente"


class IntegrationReport(Base):
    __tablename__ = "integration_reports"
    __table_args__ = {"schema": "grupowin"}

    id = Column(Integer, primary_key=True, index=True)
    fornecedor = Column(Enum(IntegrationFornecedor), nullable=False, index=True)
    periodo_ref = Column(Date, nullable=False, index=True)
    total_registros = Column(Integer, nullable=False, default=0)
    total_matches = Column(Integer, nullable=False, default=0)
    total_divergencias = Column(Integer, nullable=False, default=0)
    conciliado = Column(Boolean, nullable=False, default=False)
    criado_por = Column(Integer, ForeignKey("grupowin.api_users.id"), nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    atualizado_em = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)


class IntegrationMatch(Base):
    __tablename__ = "integration_matches"
    __table_args__ = {"schema": "grupowin"}

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("grupowin.integration_reports.id"), nullable=False, index=True)
    placa_normalizada = Column(String(20), nullable=True, index=True)
    case_id = Column(Integer, ForeignKey("grupowin.cases.id"), nullable=True)
    status_match = Column(Enum(IntegrationMatchStatus), nullable=False, index=True)
    dados_fornecedor = Column(JSON, nullable=True)
    dados_interno = Column(JSON, nullable=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    atualizado_em = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)