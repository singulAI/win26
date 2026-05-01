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
    from sqlalchemy import text
    from sqlalchemy.exc import IntegrityError

    # Cria o schema fora de uma transação explícita para evitar race condition
    # quando múltiplos workers sobem simultaneamente (UniqueViolationError no pg_namespace).
    async with engine.connect() as conn:
        await conn.execute(text("COMMIT"))  # sai de qualquer transação implícita
        try:
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS grupowin"))
            await conn.execute(text("COMMIT"))
        except (IntegrityError, Exception):
            await conn.execute(text("ROLLBACK"))

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
