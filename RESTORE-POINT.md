# Ponto de Restauração — Deploy VPS (01/05/2026)

## Estado atual do deploy (funcional)

### Infraestrutura
| Recurso | Valor |
|---|---|
| VPS IP | `72.60.147.56` |
| SO | Ubuntu 22.04.5 LTS |
| Gestor de processos | PM2 |
| Usuário | `root` |

### Backend (API)
| Recurso | Valor |
|---|---|
| Diretório | `/root/grupowin-api` |
| Branch | `copilot/connect-to-vps-ssh` |
| Último commit | `681b211` (fix: add /api prefix to all routers) |
| Processo PM2 | `grupowin-api` (id 14) |
| Porta | `38010` |
| Workers | 2 |
| Venv | `/root/grupowin-api/.venv` |

### Banco de dados
| Recurso | Valor |
|---|---|
| Engine | PostgreSQL 14 |
| Porta | `5433` |
| Database | `grupowin` |
| Usuário | `grupowin` |
| Senha | `grupowin2026` |
| Schema | `grupowin` |
| Tabelas criadas | `api_users`, `cases`, `audit_logs`, `integration_reports`, `integration_matches` |

### Usuário master criado
| Campo | Valor |
|---|---|
| Email | `oi@grupowin.site` |
| Senha inicial | `Mudar@123` |
| Role | `master` |
| ID | `1` |

### Nginx
| Recurso | Valor |
|---|---|
| Vhost | `/etc/nginx/sites-available/api.grupowin.site` |
| Proxy | `http://127.0.0.1:38010` |
| SSL | `/etc/letsencrypt/live/api.grupowin.site/` (Let's Encrypt) |

### URLs ativas
| URL | Status |
|---|---|
| `https://api.grupowin.site/health` | ✅ `{"status":"ok","version":"1.0.0"}` |
| `https://api.grupowin.site/api/auth/login` | ✅ Retorna JWT |

---

## Comandos de restauração rápida

### Reiniciar API
```bash
pm2 restart grupowin-api
pm2 logs grupowin-api --lines 30 --nostream
```

### Atualizar código (após git push do Codespace)
```bash
cd /root/grupowin-api && git pull origin copilot/connect-to-vps-ssh && pm2 restart grupowin-api
```

### Verificar saúde
```bash
curl -s https://api.grupowin.site/health
curl -s https://api.grupowin.site/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"oi@grupowin.site","password":"Mudar@123"}'
```

### Alterar senha do master
```bash
cd /root/grupowin-api && .venv/bin/python -c "
import asyncio
from database import engine
from user import User
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import update
from jwt import hash_password

async def f():
    s = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with s() as sess:
        await sess.execute(update(User).where(User.email=='oi@grupowin.site').values(hashed_password=hash_password('NOVA_SENHA')))
        await sess.commit()
        print('OK')
asyncio.run(f())
"
```

### Verificar logs de erro
```bash
pm2 logs grupowin-api --lines 50 --nostream --err
```

### Recriar processo PM2 do zero
```bash
pm2 delete grupowin-api
cd /root/grupowin-api
pm2 start ".venv/bin/uvicorn main:app --host 127.0.0.1 --port 38010 --workers 2" \
  --name grupowin-api --interpreter none
pm2 save
```

---

## .env atual (template)
```
DATABASE_URL=postgresql+asyncpg://grupowin:grupowin2026@127.0.0.1:5433/grupowin
SECRET_KEY=<gerado com openssl rand -hex 32>
REDIS_URL=redis://127.0.0.1:6379/2
DEBUG=false
APP_NAME=Grupo Win API
APP_VERSION=1.0.0
CORS_ORIGINS=["https://sos.grupowin.site","https://metrics.grupowin.site","https://api.grupowin.site"]
```

---

## Dependências notáveis fixadas
- `bcrypt==4.0.1` — pin necessário para compatibilidade com `passlib==1.7.4`

---

## Próximas tarefas

### 1. Build e deploy do frontend (sos.grupowin.site)
```bash
# No Codespace:
bun run build   # gera dist/
# Copiar dist/ para a VPS:
rsync -avz dist/ root@72.60.147.56:/var/www/grupowin/sos/
```

### 2. Build e deploy do portal metrics (metrics.grupowin.site)
- O frontend atual (Vite/React) é o portal institucional — verificar se é o `sos` ou `metrics`
- Nginx em `/etc/nginx/sites-available/sos.grupowin.site` e `metrics.grupowin.site` já podem existir apontando para `/var/www/...`

### 3. Criar usuários operacionais adicionais
- Via `POST /api/auth/usuarios` com token master
- Roles disponíveis: `master`, `eventos`, `financeiro`, `operacional`

### 4. Alterar senha padrão do master
- Trocar `Mudar@123` por senha definitiva

### 5. Mesclar branch com main
```bash
# No Codespace:
git checkout main
git merge copilot/connect-to-vps-ssh
git push origin main
```
