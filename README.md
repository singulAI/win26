# Arquitetura — GRUPO WIN (SOS + API + Metrics)

*Atualização 2026 — inclui módulo de Conciliações com fornecedores*

---

## 1. Visão macro (camadas)

### Edge (Nginx + TLS)

- Termina SSL, aplica BasicAuth no portal master e faz proxy reverso para os serviços internos.
- As novas rotinas de conciliação operam como scripts auxiliares internos, sem expor novas portas ou serviços.

### Aplicação

| Serviço | Tecnologia | Responsabilidade |
|---|---|---|
| `api.grupowin.site` | FastAPI | Regras de negócio, auditoria, RBAC, integrações |
| `sos.grupowin.site` | Static | Portal operacional (criar/validar/acompanhar casos) |
| `metrics.grupowin.site` | Static + BasicAuth | BI (funil invertido), auditoria, IA, dashboard de conciliações |

### Dados

- **Postgres**: estado operacional (`cases`, `users`, `audit_logs`, `integration_reports`, `integration_matches`).
- **Redis**: cache/filas leves (opcional).

### Observabilidade (opcional)

- Prometheus (retenção curta 24–48h) + Rollup (daily/weekly) para persistência.
- Grafana opcional via `/grafana/` no portal master.

---

## 2. Domínios e responsabilidades

| Domínio | Serviço |
|---|---|
| `oi.grupowin.site` | Chatwoot (atendimento) |
| `ev.grupowin.site` | Evolution API (WhatsApp) |
| `flow.grupowin.site` | n8n (automação) |
| `tp.grupowin.site` | Typebot Builder |
| `bot.grupowin.site` | Typebot Viewer |
| `api.grupowin.site` | API (controle + integrações + IA) |
| `sos.grupowin.site` | Operação (módulos e fluxo) |
| `metrics.grupowin.site` | Diretoria (BI + auditoria + IA + conciliações) |

> O módulo de conciliações **não é um domínio público**. É um conjunto de scripts Python internos que processam planilhas de fornecedores e publicam apenas agregados no portal de métricas.

---

## 3. RBAC (por prefixo)

| Rota | Perfis permitidos |
|---|---|
| `/api/admin/**` | master |
| `/api/admin/integrations/reconciliation/**` | master |
| `/api/acionamentos/**` | master, eventos |
| `/api/vistorias/**`, `/api/revistorias/**` | master |

**Login único**: email + senha pessoal.  
A API autentica e retorna `access_token` (JWT), `role` e `nome`.

---

## 4. Módulos e submódulos

### 4.1 Vistorias

- `novo_associado`
- `migracao`

### 4.2 Revistorias

- `inadimplencia`
- `renovacao`

### 4.3 Acionamentos (Eventos Danosos)

- `colisoes`, `roubo_furto`, `vidros`, `desastres_naturais`, `incendio`

**Regra operacional**: o caso pode ser concluído mesmo sem Siprov/Assist24. Ao concluir, a integração fica como **pendente** (reprocessável) se ainda não tiver sido enviada.

### 4.4 Conciliações (Fornecedores)

Fluxo interno que cruza dados dos fornecedores com a base interna e publica apenas agregados no portal de métricas.

| Submódulo | Descrição |
|---|---|
| `mais_vantagens` | Ingestão e normalização da planilha do fornecedor Mais Vantagens |
| `riskin` | Ingestão e normalização da planilha do fornecedor Riskin |
| `divergencias` | Detecção e listagem de inconsistências entre fornecedor e base interna |
| `dashboard` | Geração de relatório consolidado e gráficos interativos (Plotly → HTML) |

**Fluxo operacional**:

1. Master faz upload da planilha via endpoint restrito.
2. Normalização de placas e campos (maiúsculas, sem espaços/hífens, remoção de acentos).
3. Cruzamento com a lista de veículos ativos/inadimplentes do Siprov.
4. Detecção de divergências (ativo no fornecedor + inadimplente/ausente na base).
5. Dashboard HTML gerado por `scripts/fornecedores_dashboard.py` (pandas + Plotly).
6. Dashboard publicado em `metrics.grupowin.site/integrations` (somente agregados — sem CPF, placa ou dados individuais).

**Regra operacional**: as conciliações são assíncronas e não impactam vistorias nem acionamentos. Divergências servem como insumo para a equipe financeira; nenhuma ação automática de exclusão ou migração de associados é executada.

---

## 5. Estados (core)

### 5.1 Status operacional (`cases.status`)

| Valor | Descrição |
|---|---|
| `rascunho` | Criado, não enviado |
| `aguardando_cliente` | Aguardando ação do cliente |
| `em_execucao` | Em andamento |
| `concluida` | Finalizado |

### 5.2 Status de análise (`cases.analysis_status`)

| Valor | |
|---|---|
| `pendente_analise` | |
| `aprovada` | |
| `pendente_info` | |
| `rejeitada` | |

### 5.3 Status de integração — Siprov / Assist24 (`cases.siprov_status`)

| Valor | |
|---|---|
| `desativado` | |
| `pendente_envio` | |
| `enviado` | |
| `erro` | |

### 5.4 Tabelas de conciliação

**`integration_reports`** — registro de cada importação:

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `fornecedor` | enum | `mais_vantagens` \| `riskin` |
| `periodo_ref` | date | Mês/ano de referência da planilha |
| `total_registros` | int | Total de linhas importadas |
| `total_matches` | int | Registros cruzados com sucesso |
| `total_divergencias` | int | Registros com divergência |
| `conciliado` | boolean | Revisado e validado pela equipe financeira |
| `criado_por` | UUID | `users.id` do master que fez o upload |
| `criado_em` | timestamptz | Data do upload |

**`integration_matches`** — resultado linha a linha:

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `report_id` | UUID | FK → `integration_reports.id` |
| `placa_normalizada` | varchar | Placa após normalização |
| `case_id` | UUID | FK → `cases.id` (null se não encontrado) |
| `status_match` | enum | `encontrado` \| `nao_encontrado` \| `divergente` |
| `dados_fornecedor` | jsonb | Linha original da planilha (sem dados sensíveis expostos no dashboard) |
| `dados_interno` | jsonb | Snapshot do caso interno no momento do cruzamento |

---

## 6. Termos, aceite e assinatura

A consultora define `terms` (texto/condições). O portal do cliente (vistoria online) deve exigir:

1. **Aceite**
2. **Assinatura**
3. Só então permitir "Concluir".

No MVP, o portal operacional já guarda `terms` e `terms_accepted`. A conciliação não envolve interação com usuários finais.

---

## 7. Integrações (desacopladas do core)

### 7.1 Siprov

- O core **não depende** do Siprov.
- Após conclusão de vistoria/revistoria: `siprov_status=pendente_envio`.
- A conciliação utiliza exportações do Siprov (lista de veículos ativos/inadimplentes) apenas como referência para detecção de divergências.
- Futuro: job de envio + retries → `enviado` ou `erro`.

**Webhooks** (quando existirem):

- `POST /vistoria`, `POST /revistoria`, `POST /acionamento`
- Validação opcional via header `X-Siprov-Token` (`SIPROV_WEBHOOK_SECRET`).

### 7.2 Assistência 24h

- Implementada como **pull manual**: `POST /api/acionamentos/sync/assist24`.
- Em produção: executar via cron/n8n, idempotente.
- Armazena `external_id` e `external_link` no caso.

### 7.3 Fornecedores de Benefícios (Mais Vantagens e Riskin)

- **Importação**: upload manual de `.xlsx` via `POST /api/admin/integrations/reconciliation/upload` (master). Estrutura do arquivo é validada antes do processamento.
- **Processamento**: `scripts/fornecedores_dashboard.py` consolida relatórios, cruza com a base interna e popula `integration_reports` + `integration_matches`.
- **Visualização**: dashboard estático (`fornecedores_dashboard.html`) integrado ao portal `metrics.grupowin.site/integrations`.

### 7.4 Cron jobs e automação (via n8n)

1. Exportar relatórios dos fornecedores e lista de veículos do Siprov.
2. Enviar arquivos para `POST /api/admin/integrations/reconciliation/upload`.
3. Executar job de conciliação (gera dashboard e atualiza tabelas).
4. Notificar equipe financeira sobre divergências encontradas (WhatsApp via Evolution ou e-mail).

---

## 8. BI e métricas (sem dados pessoais)

- Prometheus coleta apenas contadores e latência.
- Rollup grava agregados diários/semanais na tabela `metrics_rollup`.
- Indicadores de conciliação (contagens por fornecedor, proporção de placas únicas/duplicadas, tipos de divergência) são agregados em `metrics_rollup` junto com os demais indicadores operacionais.
- Nenhum CPF, placa ou informação sensível é exibido no dashboard — apenas contagens e proporções.
- Análise detalhada de divergências disponível apenas via download de Excel para perfil master.

---

## 9. Auditoria (rastreabilidade real)

- Tabela `audit_logs` grava: ator, ação, recurso, estado antes/depois.
- Toda criação, alteração e finalização gera log.
- Ações de conciliação também auditadas: upload, processamento, download e marcação como `conciliado`.

---

## 10. Roadmap

1. Outbox + reprocessamento de integração (Siprov/Assist24) com backoff automático.
2. Portal "cliente vistoria" completo (câmera, uploads, assinatura).
3. Filtros avançados, SLA por etapa e fila inteligente.
4. Hardening: allowlist de IP em `/metrics`, WAF, rate limit, CSP.
5. Automatizar importação de conciliações via SFTP/API com fornecedores (eliminar upload manual).
6. Interface no `sos.grupowin.site` para revisar divergências individualmente e marcar como `conciliado`.
7. Alertas em tempo real via n8n ao detectar divergências críticas (veículo ativo no fornecedor e ausente na base).
8. Expansão do módulo de conciliações para novos fornecedores de benefícios.

---

## 11. API — Endpoints (MVP)

Base: `https://api.grupowin.site`

### Auth

#### `POST /api/auth/login`

```json
// Body
{ "email": "usuario@grupowin.com", "password": "SENHA_PESSOAL" }

// Resposta
{ "access_token": "...", "token_type": "bearer", "role": "master", "nome": "Nome do Usuário" }
```

#### `GET /api/auth/me`

```
Authorization: Bearer <token>
```

---

### Vistorias

| Método | Rota |
|---|---|
| `GET` | `/api/vistorias` |
| `POST` | `/api/vistorias` |
| `GET` | `/api/vistorias/{case_id}` |
| `PATCH` | `/api/vistorias/{case_id}` |
| `POST` | `/api/vistorias/{case_id}/finalize` |

### Revistorias

| Método | Rota |
|---|---|
| `GET` | `/api/revistorias` |
| `POST` | `/api/revistorias` |
| `GET` | `/api/revistorias/{case_id}` |
| `PATCH` | `/api/revistorias/{case_id}` |
| `POST` | `/api/revistorias/{case_id}/finalize` |

### Acionamentos

| Método | Rota |
|---|---|
| `GET` | `/api/acionamentos` |
| `POST` | `/api/acionamentos` |
| `GET` | `/api/acionamentos/{case_id}` |
| `PATCH` | `/api/acionamentos/{case_id}` |
| `POST` | `/api/acionamentos/{case_id}/finalize` |
| `POST` | `/api/acionamentos/sync/assist24` *(master)* |

---

### Admin (master)

#### `GET /api/admin/audit?limit=50`

Retorna logs de auditoria.

#### `GET /api/admin/integrations/funnel`

BI — funil invertido.

#### `POST /api/admin/ai/chat`

```json
// Body
{ "messages": [ { "role": "user", "content": "..." } ] }
```

#### Conciliações

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/admin/integrations/reconciliation/upload` | Upload de planilha `.xlsx` (multipart/form-data) |
| `GET` | `/api/admin/integrations/reconciliation` | Resumo das conciliações (totais por fornecedor, duplicidades, divergências) |
| `GET` | `/api/admin/integrations/reconciliation/download` | Download do arquivo processado (Excel de cruzamento) |
| `GET` | `/api/admin/conciliacoes` | Lista relatórios de importação |
| `GET` | `/api/admin/conciliacoes/{report_id}` | Detalhe de um relatório |
| `GET` | `/api/admin/conciliacoes/{report_id}/divergencias` | Lista divergências do relatório |
| `GET` | `/api/admin/conciliacoes/{report_id}/download` | Download do relatório em CSV |

---

### Webhooks Siprov (opcional)

| Método | Rota |
|---|---|
| `POST` | `/vistoria` |
| `POST` | `/revistoria` |
| `POST` | `/acionamento` |

Header (quando configurado):

```
X-Siprov-Token: <SIPROV_WEBHOOK_SECRET>
```

---

## 12. Deploy na VPS

### Visão geral do pacote

| Serviço | Tecnologia | URL |
|---|---|---|
| API | FastAPI | `api.grupowin.site` |
| Portal Operacional | Static | `sos.grupowin.site` |
| Portal Master | Static + BasicAuth | `metrics.grupowin.site` |
| Atendimento | Chatwoot | `oi.grupowin.site` |
| WhatsApp | Evolution API | `ev.grupowin.site` |
| Automação | n8n | `flow.grupowin.site` |
| Bot Builder | Typebot Builder | `tp.grupowin.site` |
| Bot Viewer | Typebot Viewer | `bot.grupowin.site` |

### Segurança (pontos inegociáveis)

- A API key da OpenAI fica **somente no backend** (`.env`).
- A sincronização com Siprov é **opcional** e não impede conclusão interna.
- Métricas e dashboards de conciliação seguem política "zero dados sensíveis": sem CPF, placa ou payload individual — somente agregados.

### Operação rápida (Docker)

```bash
# 1. Configure o ambiente
cp .env.example .env
# edite .env com suas credenciais

# 2. Suba a stack
docker compose up -d --build

# 3. Publique os frontends estáticos (Nginx host)
#    /var/www/grupowin/sos     → sos.grupowin.site
#    /var/www/grupowin/metrics → metrics.grupowin.site
```

Consulte `nginx/` para os vhosts de cada subdomínio.

### Observabilidade (opcional)

```bash
# Suba o stack de observabilidade
docker compose -f observability/docker-compose.yml up -d
```

- Prometheus: retenção de 24–48h.
- Rollup diário/semanal: `python scripts/metrics_rollup.py`.
- Dashboard de conciliações: `python scripts/fornecedores_dashboard.py`.
- Grafana opcional via `/grafana/` no portal master.
