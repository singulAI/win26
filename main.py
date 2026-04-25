from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database import init_db
from app.routers import auth, vistorias, acionamentos, financeiro, bi, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# Routers
app.include_router(auth.router)
app.include_router(vistorias.router)
app.include_router(acionamentos.router)
app.include_router(financeiro.router)
app.include_router(bi.router)
app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION}
