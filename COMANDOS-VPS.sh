#!/bin/bash
# ══════════════════════════════════════════════════════════════════
#  COMANDOS PRONTOS PARA COLAR NO VPS — GRUPO WIN
#  Execute BLOCO A BLOCO no terminal do VPS
#  Não rode tudo de uma vez — confirme cada bloco antes
# ══════════════════════════════════════════════════════════════════

# ─── BLOCO 1: Nginx + SSL para ev.grupowin.site (Evolution API) ───
# Confirme primeiro: curl -s http://127.0.0.1:38080/manager | head -5

cat > /etc/nginx/sites-available/ev.grupowin.site << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ev.grupowin.site;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$server_name$request_uri; }
}
EOF
ln -sf /etc/nginx/sites-available/ev.grupowin.site /etc/nginx/sites-enabled/ev.grupowin.site
nginx -t && nginx -s reload
certbot certonly --webroot -w /var/www/html -d ev.grupowin.site --non-interactive --agree-tos -m ogrupowin@gmail.com

cat > /etc/nginx/sites-available/ev.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name ev.grupowin.site;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name ev.grupowin.site;
    ssl_certificate /etc/letsencrypt/live/ev.grupowin.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ev.grupowin.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 20m;
    location / {
        proxy_pass http://127.0.0.1:38080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
nginx -t && nginx -s reload
echo "✅ ev.grupowin.site OK"
curl -s -o /dev/null -w "ev HTTPS: %{http_code}\n" https://ev.grupowin.site/manager

# ─── BLOCO 2: Nginx + SSL para ana.grupowin.site (ERP Gunicorn/Python) ───
# Confirme primeiro: curl -s http://127.0.0.1:8000/ | head -10

cat > /etc/nginx/sites-available/ana.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name ana.grupowin.site;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$server_name$request_uri; }
}
EOF
ln -sf /etc/nginx/sites-available/ana.grupowin.site /etc/nginx/sites-enabled/ana.grupowin.site
nginx -t && nginx -s reload
certbot certonly --webroot -w /var/www/html -d ana.grupowin.site --non-interactive --agree-tos -m ogrupowin@gmail.com

cat > /etc/nginx/sites-available/ana.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name ana.grupowin.site;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name ana.grupowin.site;
    ssl_certificate /etc/letsencrypt/live/ana.grupowin.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ana.grupowin.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 20m;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60;
        proxy_send_timeout 120;
        proxy_read_timeout 120;
    }
}
EOF
nginx -t && nginx -s reload
echo "✅ ana.grupowin.site OK"
curl -s -o /dev/null -w "ana HTTPS: %{http_code}\n" https://ana.grupowin.site

# ─── BLOCO 3: Portal SOS estático ────────────────────────────────
# /var/www/sos.grupowin.site já existe! Só precisa de nginx+SSL

# (Faça upload do arquivo portais/sos/index.html para /var/www/sos.grupowin.site/index.html)
# Ou crie um index básico temporário:
cat > /var/www/sos.grupowin.site/index.html << 'EOF'
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>SOS Grupo Win</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:sans-serif;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
h1{font-size:2rem;color:#3b82f6}p{color:#94a3b8;margin-top:1rem}</style></head>
<body><div><h1>🛡️ Grupo Win SOS</h1><p>Portal de Assistência 24h — em breve disponível.</p>
<p style="margin-top:2rem;font-size:1.5rem">0800 000 0000</p></div></body></html>
EOF
chown www-data:www-data /var/www/sos.grupowin.site/index.html

cat > /etc/nginx/sites-available/sos.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name sos.grupowin.site;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$server_name$request_uri; }
}
EOF
ln -sf /etc/nginx/sites-available/sos.grupowin.site /etc/nginx/sites-enabled/sos.grupowin.site
nginx -t && nginx -s reload
certbot certonly --webroot -w /var/www/html -d sos.grupowin.site --non-interactive --agree-tos -m ogrupowin@gmail.com

cat > /etc/nginx/sites-available/sos.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name sos.grupowin.site;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name sos.grupowin.site;
    ssl_certificate /etc/letsencrypt/live/sos.grupowin.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sos.grupowin.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    root /var/www/sos.grupowin.site;
    index index.html;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 7d; add_header Cache-Control "public, immutable";
    }
}
EOF
nginx -t && nginx -s reload
echo "✅ sos.grupowin.site OK"
curl -s -o /dev/null -w "sos HTTPS: %{http_code}\n" https://sos.grupowin.site

# ─── BLOCO 4: Portal Métricas ─────────────────────────────────────
mkdir -p /var/www/metrics.grupowin.site
cat > /var/www/metrics.grupowin.site/index.html << 'EOF'
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Métricas — Grupo Win</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:sans-serif;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
h1{font-size:2rem;color:#22c55e}p{color:#94a3b8;margin-top:1rem}.kpi{display:inline-block;background:#1e293b;border-radius:12px;padding:1rem 2rem;margin:.5rem;font-size:1.5rem;font-weight:800}</style>
</head><body><div><h1>📊 Grupo Win Métricas</h1>
<p>Painel de métricas operacionais</p>
<div style="margin-top:2rem">
<div class="kpi" style="color:#3b82f6">0<br><small style="font-size:.6rem">Acionamentos</small></div>
<div class="kpi" style="color:#22c55e">0<br><small style="font-size:.6rem">Concluídos</small></div>
<div class="kpi" style="color:#f59e0b">0<br><small style="font-size:.6rem">Em aberto</small></div>
</div></div></body></html>
EOF
chown -R www-data:www-data /var/www/metrics.grupowin.site

# BasicAuth
apt-get install -y apache2-utils -q
METRICS_PASS=$(openssl rand -base64 12)
htpasswd -cb /etc/nginx/.htpasswd_metrics admin "$METRICS_PASS"
echo "🔑 Senha do metrics.grupowin.site: admin / $METRICS_PASS" | tee /root/metrics_credentials.txt

cat > /etc/nginx/sites-available/metrics.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name metrics.grupowin.site;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$server_name$request_uri; }
}
EOF
ln -sf /etc/nginx/sites-available/metrics.grupowin.site /etc/nginx/sites-enabled/metrics.grupowin.site
nginx -t && nginx -s reload
certbot certonly --webroot -w /var/www/html -d metrics.grupowin.site --non-interactive --agree-tos -m ogrupowin@gmail.com

cat > /etc/nginx/sites-available/metrics.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name metrics.grupowin.site;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name metrics.grupowin.site;
    ssl_certificate /etc/letsencrypt/live/metrics.grupowin.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/metrics.grupowin.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    auth_basic "Grupo Win — Métricas";
    auth_basic_user_file /etc/nginx/.htpasswd_metrics;
    root /var/www/metrics.grupowin.site;
    index index.html;
    gzip on;
    location / { try_files $uri $uri/ /index.html; }
}
EOF
nginx -t && nginx -s reload
echo "✅ metrics.grupowin.site OK"
curl -s -o /dev/null -w "metrics HTTPS: %{http_code}\n" https://metrics.grupowin.site

# ─── BLOCO 5: Deploy da FastAPI (api.grupowin.site) ──────────────
# Faça upload do grupowin-deploy.tar.gz para /root/ primeiro
# (Via Hostinger File Manager ou SCP do seu computador)
# Depois:

cd /root
tar -xzf grupowin-deploy.tar.gz
mkdir -p /opt/grupowin/api
cp -r /root/grupowin-deploy/api/. /opt/grupowin/api/

# Adiciona variáveis ao .env do grupowin
SECRET_KEY=$(openssl rand -hex 32)
echo "" >> /opt/grupowin/.env
echo "# === API GRUPOWIN ===" >> /opt/grupowin/.env
echo "SECRET_KEY=$SECRET_KEY" >> /opt/grupowin/.env
echo "SIPROV_BASE_URL=https://ana.grupowin.site" >> /opt/grupowin/.env
echo "SIPROV_TOKEN=CONFIGURE_AQUI" >> /opt/grupowin/.env
echo "ASSIST24_BASE_URL=CONFIGURE_AQUI" >> /opt/grupowin/.env
echo "ASSIST24_TOKEN=CONFIGURE_AQUI" >> /opt/grupowin/.env
echo "AI_API_KEY=ollama" >> /opt/grupowin/.env
echo "AI_BASE_URL=http://host.docker.internal:11434/v1" >> /opt/grupowin/.env
echo "AI_MODEL=llama3.2" >> /opt/grupowin/.env
echo "Variáveis adicionadas ao .env"

# Adiciona grupowin-api ao docker-compose.yml
cp /opt/grupowin/docker-compose.yml /opt/grupowin/docker-compose.yml.bak.pre_api

python3 - << 'PYEOF'
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
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - grupowin-net
    depends_on:
      grupowin-postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
"""

if 'grupowin-api' not in content:
    if '\nnetworks:' in content:
        content = content.replace('\nnetworks:', new_service + '\nnetworks:', 1)
    else:
        content += new_service
    with open('/opt/grupowin/docker-compose.yml', 'w') as f:
        f.write(content)
    print('OK: grupowin-api adicionado ao docker-compose.yml')
else:
    print('SKIP: grupowin-api já existe no docker-compose.yml')
PYEOF

cd /opt/grupowin
docker compose build grupowin-api
docker compose up -d grupowin-api
sleep 20 && docker ps | grep grupowin-api
docker logs grupowin-api --tail 20

# Nginx para api.grupowin.site
cat > /etc/nginx/sites-available/api.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name api.grupowin.site;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$server_name$request_uri; }
}
EOF
ln -sf /etc/nginx/sites-available/api.grupowin.site /etc/nginx/sites-enabled/api.grupowin.site
nginx -t && nginx -s reload
certbot certonly --webroot -w /var/www/html -d api.grupowin.site --non-interactive --agree-tos -m ogrupowin@gmail.com

cat > /etc/nginx/sites-available/api.grupowin.site << 'EOF'
server {
    listen 80; listen [::]:80;
    server_name api.grupowin.site;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2; listen [::]:443 ssl http2;
    server_name api.grupowin.site;
    ssl_certificate /etc/letsencrypt/live/api.grupowin.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.grupowin.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:38000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30;
        proxy_send_timeout 60;
        proxy_read_timeout 60;
    }
}
EOF
nginx -t && nginx -s reload

echo "✅ api.grupowin.site OK"
curl -s https://api.grupowin.site/health

# ─── BLOCO 6: Status final ────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  VERIFICAÇÃO FINAL — GRUPO WIN"
echo "════════════════════════════════════════"
for url in https://oi.grupowin.site https://ev.grupowin.site/manager https://ana.grupowin.site https://sos.grupowin.site https://metrics.grupowin.site https://api.grupowin.site/health; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    echo "  $code — $url"
done
echo ""
docker ps --format "  🐳 {{.Names}} — {{.Status}}" | grep grupowin
