from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    master = "master"
    eventos = "eventos"
    financeiro = "financeiro"
    operacional = "operacional"


class User(Base):
    __tablename__ = "api_users"
    __table_args__ = {"schema": "grupowin"}

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(300), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.operacional)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
