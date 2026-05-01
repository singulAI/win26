#!/usr/bin/env bash
set -e

if [[ ! -d ".venv312" ]]; then
  echo "[ERR] .venv312 não encontrado. Crie com: python3.12 -m venv .venv312"
  exit 1
fi

source .venv312/bin/activate

export DATABASE_URL="postgresql+asyncpg://grupowin:grupowin@127.0.0.1:5433/grupowin"
export REDIS_URL="redis://127.0.0.1:6380/2"
export SECRET_KEY="dev-secret-key"
export DEBUG="true"

uvicorn main:app --host 127.0.0.1 --port 8001 --reload