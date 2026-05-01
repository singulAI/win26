from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Cria todas as tabelas se não existirem."""
    async with engine.begin() as conn:
        # Ambientes novos podem subir com DB vazio; garante schema antes do create_all.
        await conn.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS grupowin")
        await conn.run_sync(Base.metadata.create_all)
