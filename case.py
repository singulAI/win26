from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Numeric, JSON
from sqlalchemy.sql import func
from app.database import Base
import enum


class CaseType(str, enum.Enum):
    vistoria = "vistoria"
    revisoria = "revisoria"
    acionamento = "acionamento"


class CaseStatus(str, enum.Enum):
    aberto = "aberto"
    em_andamento = "em_andamento"
    aguardando = "aguardando"
    concluido = "concluido"
    cancelado = "cancelado"


class Case(Base):
    __tablename__ = "cases"
    __table_args__ = {"schema": "grupowin"}

    id = Column(Integer, primary_key=True, index=True)
    protocolo = Column(String(50), unique=True, nullable=False, index=True)
    tipo = Column(Enum(CaseType), nullable=False)
    status = Column(Enum(CaseStatus), nullable=False, default=CaseStatus.aberto)

    # Associado (via Siprov)
    cod_pessoa = Column(Integer, nullable=False, index=True)
    cod_veiculo = Column(Integer, nullable=True)
    cod_beneficio = Column(Integer, nullable=True)

    # Dados do caso
    descricao = Column(Text, nullable=False)
    observacoes = Column(Text, nullable=True)
    dados_extras = Column(JSON, nullable=True)  # campos específicos por tipo

    # Localização (vistorias/acionamentos)
    endereco = Column(String(500), nullable=True)
    cidade = Column(String(200), nullable=True)
    estado = Column(String(2), nullable=True)
    lat = Column(Numeric(10, 8), nullable=True)
    lng = Column(Numeric(11, 8), nullable=True)

    # Atribuição
    usuario_criador_id = Column(Integer, ForeignKey("grupowin.api_users.id"), nullable=True)
    usuario_responsavel_id = Column(Integer, ForeignKey("grupowin.api_users.id"), nullable=True)

    # Financeiro (acionamentos)
    valor_estimado = Column(Numeric(10, 2), nullable=True)
    valor_aprovado = Column(Numeric(10, 2), nullable=True)

    # Datas
    data_agendamento = Column(DateTime(timezone=True), nullable=True)
    data_conclusao = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
