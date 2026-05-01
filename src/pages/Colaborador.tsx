import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FileCheck, Files, Loader2, LogOut, ShieldCheck, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICard from "@/components/dashboard/KPICard";
import {
  apiRequest,
  AuthUser,
  LoginResponse,
  ReconciliationDivergence,
  ReconciliationReport,
  ReconciliationSummary,
} from "@/lib/api";

const TOKEN_STORAGE_KEY = "grupowin.metrics.token";

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatMonth = (value: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
};

const supplierLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const Colaborador = () => {
  const [isDark, setIsDark] = useState(false);
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [email, setEmail] = useState("oi@grupowin.site");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  const meQuery = useQuery({
    queryKey: ["auth-me", token],
    queryFn: () => apiRequest<AuthUser>("/auth/me", { token }),
    enabled: Boolean(token),
    retry: false,
  });

  const summaryQuery = useQuery({
    queryKey: ["conciliacoes-resumo", token],
    queryFn: () => apiRequest<ReconciliationSummary>("/admin/conciliacoes/resumo", { token }),
    enabled: Boolean(token),
  });

  const reportsQuery = useQuery({
    queryKey: ["conciliacoes-lista", token],
    queryFn: () => apiRequest<ReconciliationReport[]>("/admin/conciliacoes", { token }),
    enabled: Boolean(token),
  });

  const divergenceQuery = useQuery({
    queryKey: ["conciliacoes-divergencias", token, selectedReportId],
    queryFn: () => apiRequest<ReconciliationDivergence[]>(`/admin/conciliacoes/${selectedReportId}/divergencias`, { token }),
    enabled: Boolean(token && selectedReportId),
  });

  useEffect(() => {
    if (meQuery.error) {
      setToken("");
      setLoginError("Sessão expirada. Faça login novamente.");
    }
  }, [meQuery.error]);

  const totalSummary = useMemo(() => {
    const fornecedores = Object.values(summaryQuery.data?.por_fornecedor || {});

    return fornecedores.reduce(
      (acc, item) => ({
        reports: acc.reports + item.reports,
        registros: acc.registros + item.registros,
        matches: acc.matches + item.matches,
        divergencias: acc.divergencias + item.divergencias,
      }),
      { reports: 0, registros: 0, matches: 0, divergencias: 0 },
    );
  }, [summaryQuery.data]);

  const reconciledCount = useMemo(
    () => reportsQuery.data?.filter((report) => report.conciliado).length || 0,
    [reportsQuery.data],
  );

  const latestReports = reportsQuery.data || [];
  const selectedReport = latestReports.find((report) => report.id === selectedReportId) || null;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(response.access_token);
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Falha ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setSelectedReportId(null);
  };

  const isLoadingData = summaryQuery.isLoading || reportsQuery.isLoading || meQuery.isLoading;
  const loadingDivergences = divergenceQuery.isLoading && selectedReportId !== null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-gold mb-2">
            Conciliações — Cruzamento e Divergências
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Grupo Win — <span className="text-gradient-gold">Painel Operacional Real</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Este painel agora prioriza o objetivo central do módulo: cruzar planilhas com a base interna,
            organizar relatórios e destacar divergências para a equipe financeira.
          </p>
        </motion.div>

        {!token ? (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={handleLogin}
            className="glass-card-light rounded-2xl p-6 sm:p-8 max-w-xl"
          >
            <p className="text-sm font-semibold text-foreground mb-2">Login master para consultar conciliações</p>
            <p className="text-xs text-muted-foreground mb-6">
              O painel usa os endpoints reais da API e exige autenticação JWT para buscar relatórios e divergências.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold"
                  placeholder="master@grupowin.site"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Senha</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold"
                  placeholder="Sua senha pessoal"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {loginError ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {loginError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Entrar no painel
            </button>
          </motion.form>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-card-light rounded-2xl p-6 sm:p-8"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sessão autenticada</p>
                  <h2 className="text-lg font-semibold text-foreground mt-1">
                    {meQuery.data?.nome || "Carregando usuário..."}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perfil {meQuery.data?.role || "-"} • último login {formatDate(meQuery.data?.last_login || null)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </motion.div>

            {isLoadingData ? (
              <div className="glass-card-light rounded-2xl p-8 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                Carregando dados reais de conciliação...
              </div>
            ) : null}

            {summaryQuery.error || reportsQuery.error ? (
              <div className="glass-card-light rounded-2xl p-6 border border-red-500/20 bg-red-500/5 text-sm text-red-500">
                {summaryQuery.error instanceof Error
                  ? summaryQuery.error.message
                  : reportsQuery.error instanceof Error
                    ? reportsQuery.error.message
                    : "Falha ao consultar os dados de conciliação."}
              </div>
            ) : null}

            {!isLoadingData && !summaryQuery.error && !reportsQuery.error ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard
                    icon={Files}
                    title="Relatórios"
                    value={String(totalSummary.reports)}
                    description="Uploads processados"
                    delay={0.1}
                  />
                  <KPICard
                    icon={Users}
                    title="Registros cruzados"
                    value={String(totalSummary.registros)}
                    description="Linhas importadas"
                    delay={0.15}
                  />
                  <KPICard
                    icon={FileCheck}
                    title="Matches"
                    value={String(totalSummary.matches)}
                    description="Encontrados na base"
                    delay={0.2}
                  />
                  <KPICard
                    icon={AlertTriangle}
                    title="Divergências"
                    value={String(totalSummary.divergencias)}
                    change={summaryQuery.data?.placas_duplicadas ? `${summaryQuery.data.placas_duplicadas} duplicadas` : undefined}
                    changeType="down"
                    description="Itens para revisão"
                    delay={0.25}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="glass-card-light rounded-2xl p-6 sm:p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Relatórios de conciliação</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use esta lista para identificar lotes com maior volume de divergências.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Conciliados</p>
                        <p className="text-lg font-semibold text-foreground">{reconciledCount}/{latestReports.length}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {latestReports.length === 0 ? (
                        <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                          Nenhum relatório de conciliação foi importado ainda.
                        </div>
                      ) : (
                        latestReports.map((report) => {
                          const isSelected = selectedReportId === report.id;
                          return (
                            <button
                              key={report.id}
                              onClick={() => setSelectedReportId(report.id)}
                              className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                                isSelected
                                  ? "border-gold/40 bg-gold/5"
                                  : "border-border/50 bg-background/30 hover:border-border"
                              }`}
                            >
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    {supplierLabel(report.fornecedor)} • {formatMonth(report.periodo_ref)}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    Criado em {formatDate(report.criado_em)}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-medium ${
                                    report.conciliado
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-amber-500/10 text-amber-500"
                                  }`}
                                >
                                  {report.conciliado ? "Conciliado" : "Pendente"}
                                </span>
                              </div>

                              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Registros</p>
                                  <p className="font-semibold text-foreground mt-1">{report.total_registros}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Matches</p>
                                  <p className="font-semibold text-foreground mt-1">{report.total_matches}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Divergências</p>
                                  <p className="font-semibold text-red-500 mt-1">{report.total_divergencias}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.35 }}
                    className="glass-card-light rounded-2xl p-6 sm:p-8"
                  >
                    <h3 className="text-lg font-semibold text-foreground">Divergências do relatório</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">
                      Selecione um relatório para ver exemplos de divergências e orientar a revisão financeira.
                    </p>

                    {selectedReport ? (
                      <div className="rounded-xl border border-border/50 bg-background/30 p-4 mb-4">
                        <p className="text-sm font-semibold text-foreground">
                          {supplierLabel(selectedReport.fornecedor)} • {formatMonth(selectedReport.periodo_ref)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {selectedReport.total_divergencias} divergências de {selectedReport.total_registros} registros
                        </p>
                      </div>
                    ) : null}

                    {loadingDivergences ? (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        Carregando divergências...
                      </div>
                    ) : null}

                    {divergenceQuery.error ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                        {divergenceQuery.error instanceof Error ? divergenceQuery.error.message : "Falha ao buscar divergências."}
                      </div>
                    ) : null}

                    {!selectedReportId ? (
                      <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                        Nenhum relatório selecionado.
                      </div>
                    ) : !loadingDivergences && (divergenceQuery.data?.length || 0) === 0 ? (
                      <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                        Este relatório não tem divergências registradas.
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {(divergenceQuery.data || []).slice(0, 8).map((item) => {
                        const supplierName = item.dados_fornecedor?.nome || item.dados_fornecedor?.associado || item.dados_fornecedor?.cliente;
                        const reason = item.dados_interno?.motivo_preprocessamento || item.dados_interno?.motivo || item.status_match;

                        return (
                          <div key={item.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{item.placa_normalizada || "Sem placa"}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {String(supplierName || "Sem identificação do fornecedor")}
                                </p>
                              </div>
                              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-500">
                                {item.status_match}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">Motivo: {String(reason || "Não informado")}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.4 }}
                  className="glass-card-light rounded-2xl p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Consolidação por fornecedor</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aqui está o retrato agregado do cruzamento entre planilhas e base interna.
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
                      {summaryQuery.data?.placas_duplicadas || 0} placas duplicadas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(summaryQuery.data?.por_fornecedor || {}).map(([fornecedor, stats]) => (
                      <div key={fornecedor} className="rounded-2xl border border-border/50 bg-background/30 p-5">
                        <p className="text-sm font-semibold text-foreground">{supplierLabel(fornecedor)}</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Relatórios</p>
                            <p className="mt-1 font-semibold text-foreground">{stats.reports}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Registros</p>
                            <p className="mt-1 font-semibold text-foreground">{stats.registros}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Matches</p>
                            <p className="mt-1 font-semibold text-emerald-500">{stats.matches}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Divergências</p>
                            <p className="mt-1 font-semibold text-red-500">{stats.divergencias}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : null}
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 border-t border-border/40"
        >
          <p className="text-[10px] text-muted-foreground">
            Grupo Win — Painel de conciliações com dados reais da API para organizar cruzamentos e identificar divergências.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Colaborador;
