#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  DEPLOY COMPLETO - GRUPO WIN
#  Execute como root no VPS: bash /root/grupowin-deploy/deploy.sh
# ═══════════════════════════════════════════════════════════
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${BLUE}[>>]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRUPOWIN_DIR="/opt/grupowin"
NGINX_AVAIL="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
EMAIL="ogrupowin@gmail.com"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     DEPLOY GRUPO WIN — SISTEMA COMPLETO          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── PASSO 1: Copia a API para /opt/grupowin ─────────────────────────────────
info "Copiando FastAPI para ${GRUPOWIN_DIR}/api..."
mkdir -p "${GRUPOWIN_DIR}/api"
cp -r "${SCRIPT_DIR}/api/." "${GRUPOWIN_DIR}/api/"
log "API copiada"

# ─── PASSO 2: Adiciona serviço ao docker-compose.yml ─────────────────────────
info "Verificando se grupowin-api já está no docker-compose..."
if grep -q "grupowin-api" "${GRUPOWIN_DIR}/docker-compose.yml"; then
    warn "grupowin-api já existe no docker-compose.yml — pulando"
else
    info "Adicionando grupowin-api ao docker-compose.yml..."
    # Remove a linha 'networks:' final e adiciona o serviço antes
    # Backup primeiro
    cp "${GRUPOWIN_DIR}/docker-compose.yml" "${GRUPOWIN_DIR}/docker-compose.yml.bak.$(date +%Y%m%d_%H%M%S)"

    # Injeta o serviço antes da seção networks no final
    python3 - << 'PYEOF'
import re

with open('/opt/grupowin/docker-compose.yml', 'r') as f:
    content = f.read()

new_service = """
  grupowin-api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: grupowin-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:38000:8000"
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@grupowin-postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://grupowin-redis:6379/2
    networks:
      - grupowin-net
    depends_on:
      grupowin-postgres:
        condition: service_healthy
      grupowin-redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
"""

# Insere antes da seção networks (raiz)
if '\nnetworks:' in content:
    content = content.replace('\nnetworks:', new_service + '\nnetworks:', 1)
else:
    content += new_service

with open('/opt/grupowin/docker-compose.yml', 'w') as f:
    f.write(content)

print('OK: docker-compose.yml atualizado')
PYEOF
    log "docker-compose.yml atualizado"
fi

# ─── PASSO 3: Adiciona variáveis ao .env ─────────────────────────────────────
info "Verificando .env do Grupo Win..."
ENV_FILE="${GRUPOWIN_DIR}/.env"

add_env_var() {
    local key="$1" val="$2"
    if ! grep -q "^${key}=" "${ENV_FILE}" 2>/dev/null; then
        echo "${key}=${val}" >> "${ENV_FILE}"
        warn "Adicionado ${key} ao .env (configure o valor correto)"
    fi
}

add_env_var "SECRET_KEY" "$(openssl rand -hex 32)"
add_env_var "SIPROV_BASE_URL" "https://ana.grupowin.site"
add_env_var "SIPROV_TOKEN" "CONFIGURE_AQUI"
add_env_var "ASSIST24_BASE_URL" "https://api.assist24.com.br"
add_env_var "ASSIST24_TOKEN" "CONFIGURE_AQUI"
add_env_var "AI_API_KEY" "CONFIGURE_AQUI"
add_env_var "N8N_API_KEY" "CONFIGURE_AQUI"
log ".env verificado"

# ─── PASSO 4: Build e sobe a API ─────────────────────────────────────────────
info "Build da imagem grupowin-api..."
cd "${GRUPOWIN_DIR}"
docker compose build grupowin-api
log "Build concluído"

info "Subindo grupowin-api..."
docker compose up -d grupowin-api
log "Container grupowin-api iniciado"

# Aguarda health check
info "Aguardando API ficar pronta (até 60s)..."
for i in $(seq 1 12); do
    if curl -sf http://127.0.0.1:38000/health > /dev/null 2>&1; then
        log "API respondendo em 127.0.0.1:38000"
        break
    fi
    sleep 5
    if [ "$i" = "12" ]; then
        warn "Timeout aguardando API — verifique os logs: docker logs grupowin-api"
    fi
done

# ─── PASSO 5: Copia portais estáticos ────────────────────────────────────────
info "Copiando portais estáticos..."
mkdir -p /var/www/sos.grupowin.site
mkdir -p /var/www/metrics.grupowin.site

cp "${SCRIPT_DIR}/portais/sos/index.html" /var/www/sos.grupowin.site/index.html
cp "${SCRIPT_DIR}/portais/metrics/index.html" /var/www/metrics.grupowin.site/index.html

chown -R www-data:www-data /var/www/sos.grupowin.site /var/www/metrics.grupowin.site
log "Portais copiados"

# ─── PASSO 6: Nginx — gera cert HTTP-01 e configura HTTPS ────────────────────
setup_nginx_ssl() {
    local domain="$1"
    local port="$2"   # vazio = portal estático
    local is_static="$3"

    info "Configurando nginx + SSL para ${domain}..."

    # Config HTTP temporária para certbot
    if [ -z "$is_static" ]; then
        cat > "${NGINX_AVAIL}/${domain}" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host \$host;
    }
}
EOF
    else
        cat > "${NGINX_AVAIL}/${domain}" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${domain};
    root /var/www/${domain};
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOF
    fi

    ln -sf "${NGINX_AVAIL}/${domain}" "${NGINX_ENABLED}/${domain}" 2>/dev/null || true
    nginx -t && nginx -s reload

    # Gera certificado
    if [ ! -d "/etc/letsencrypt/live/${domain}" ]; then
        certbot --nginx -d "${domain}" --non-interactive --agree-tos -m "${EMAIL}" --redirect || warn "Certbot falhou para ${domain} — DNS configurado?"
    else
        warn "Cert já existe para ${domain} — pulando certbot"
    fi

    # Config final
    cp "${SCRIPT_DIR}/nginx/${domain}" "${NGINX_AVAIL}/${domain}"
    nginx -t && nginx -s reload
    log "nginx OK para ${domain}"
}

setup_nginx_ssl "ev.grupowin.site" "38080" ""
setup_nginx_ssl "api.grupowin.site" "38000" ""
setup_nginx_ssl "ana.grupowin.site" "9000" ""
setup_nginx_ssl "sos.grupowin.site" "" "static"
setup_nginx_ssl "metrics.grupowin.site" "" "static"

# ─── PASSO 7: BasicAuth para metrics ─────────────────────────────────────────
if [ ! -f "/etc/nginx/.htpasswd_metrics" ]; then
    info "Criando BasicAuth para metrics.grupowin.site..."
    apt-get install -y apache2-utils -q > /dev/null 2>&1 || true
    htpasswd -c -b /etc/nginx/.htpasswd_metrics admin "$(openssl rand -base64 12)" || true
    warn "Senha do metrics gerada — altere com: htpasswd /etc/nginx/.htpasswd_metrics admin"
fi

# ─── PASSO 8: Status final ────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║              DEPLOY CONCLUÍDO                    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
log "Containers Grupo Win:"
docker ps --format "  • {{.Names}} — {{.Status}}" | grep grupowin
echo ""
log "Subdomínios configurados:"
for d in oi ev n8n tp ana sos metrics api; do
    echo "  • https://${d}.grupowin.site"
done
echo ""
warn "Configure os tokens no .env: SIPROV_TOKEN, ASSIST24_TOKEN, AI_API_KEY"
warn "Reinicie a API após configurar: docker compose restart grupowin-api"
