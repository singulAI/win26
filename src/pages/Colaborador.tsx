import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  FileCheck,
  FileText,
  Files,
  Loader2,
  LogOut,
  ShieldCheck,
  Target,
  TrendingUp,
  Truck,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICard from "@/components/dashboard/KPICard";
import ArchitectureMap from "@/components/dashboard/ArchitectureMap";
import FlowDiagram from "@/components/dashboard/FlowDiagram";
import ModulesGrid from "@/components/dashboard/ModulesGrid";
import IntegrationsPanel from "@/components/dashboard/IntegrationsPanel";
import RBACPanel from "@/components/dashboard/RBACPanel";
import AIAssistantPanel from "@/components/dashboard/AIAssistantPanel";
import BIChartsPanel from "@/components/dashboard/BIChartsPanel";
import {
  apiRequest,
  AuthUser,
  LoginResponse,
  ReconciliationDivergence,
  ReconciliationReport,
  ReconciliationSummary,
  ReconciliationUploadResponse,
} from "@/lib/api";

const TOKEN_STORAGE_KEY = "grupowin.metrics.token";
const defaultPeriod = new Date().toISOString().slice(0, 7);

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
  const queryClient = useQueryClient();
  const [isDark, setIsDark] = useState(false);
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [email, setEmail] = useState("oi@grupowin.site");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [uploadSupplier, setUploadSupplier] = useState("mais_vantagens");
  const [uploadPeriod, setUploadPeriod] = useState(defaultPeriod);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    if (!selectedReportId && reportsQuery.data?.length) {
      setSelectedReportId(reportsQuery.data[0].id);
    }
  }, [reportsQuery.data, selectedReportId]);

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
    setUploadError(null);
    setUploadSuccess(null);
    setUploadFile(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadSuccess(null);
    setUploadError(null);
    setUploadFile(event.target.files?.[0] || null);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadFile) {
      setUploadError("Selecione um arquivo .xlsx para importar.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("fornecedor", uploadSupplier);
      formData.append("periodo_ref", `${uploadPeriod}-01`);
      formData.append("arquivo", uploadFile);

      const response = await apiRequest<ReconciliationUploadResponse>("/admin/conciliacoes/upload", {
        method: "POST",
        body: formData,
        token,
      });

      setUploadSuccess(
        `Upload concluído: ${supplierLabel(response.fornecedor)} ${formatMonth(response.periodo_ref)} com ${response.total_registros} registros.`,
      );
      setUploadFile(null);
      setSelectedReportId(response.report_id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conciliacoes-resumo", token] }),
        queryClient.invalidateQueries({ queryKey: ["conciliacoes-lista", token] }),
        queryClient.invalidateQueries({ queryKey: ["conciliacoes-divergencias", token] }),
      ]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Falha ao enviar o arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const isLoadingData = summaryQuery.isLoading || reportsQuery.isLoading || meQuery.isLoading;
  const loadingDivergences = divergenceQuery.isLoading && selectedReportId !== null;
  const dashboardError = summaryQuery.error || reportsQuery.error;

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
            Visão Executiva — Março 2026
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Grupo Win — <span className="text-gradient-gold">Painel Estratégico</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Plataforma de proteção veicular com atendimento automatizado e backoffice integrado.
            O humano atua apenas onde agrega valor.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Users}
            title="Associados"
            value="4.832"
            change="+12.3%"
            changeType="up"
            description="Base ativa de associados"
            delay={0.1}
          />
          <KPICard
            icon={Truck}
            title="Acionamentos"
            value="56"
            change="+8 este mês"
            changeType="neutral"
            description="Eventos danosos em andamento"
            delay={0.15}
          />
          <KPICard
            icon={ShieldCheck}
            title="Vistorias"
            value="142"
            change="+23%"
            changeType="up"
            description="Adesões e migrações"
            delay={0.2}
          />
          <KPICard
            icon={BarChart3}
            title="Taxa de automação"
            value="94%"
            change="+6pp"
            changeType="up"
            description="Processos sem intervenção humana"
            delay={0.25}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Target, title: "Humano onde importa", desc: "Exceções, aprovações e escalonamentos" },
            { icon: FileText, title: "Auditoria total", desc: "Rastreabilidade real com antes/depois" },
            { icon: Zap, title: "Core independente", desc: "Não depende de Siprov/Assist24" },
            { icon: TrendingUp, title: "Reprocessável", desc: "Integrações desacopladas e resilientes" },
          ].map((principle) => (
            <div key={principle.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/50">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <principle.icon size={14} strokeWidth={1.5} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{principle.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{principle.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ArchitectureMap />
          <FlowDiagram />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
          {!token ? (
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onSubmit={handleLogin}
              className="glass-card-light rounded-2xl p-6 sm:p-8"
            >
              <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-gold mb-2">
                Conciliações — Acesso master
              </p>
              <p className="text-lg font-semibold text-foreground mb-2">Login para cruzamento e divergências</p>
              <p className="text-xs text-muted-foreground mb-6">
                O layout executivo continua o mesmo, e esta área conecta o painel aos dados reais da API.
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

          )}

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            onSubmit={handleUpload}
            className="glass-card-light rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-gold mb-2">
                  Conciliações — Upload
                </p>
                <h2 className="text-lg font-semibold text-foreground">Importar planilha do fornecedor</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie o arquivo para gerar o relatório de cruzamento e alimentar o painel abaixo.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Upload size={18} className="text-gold" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Fornecedor</label>
                <select
                  value={uploadSupplier}
                  onChange={(event) => setUploadSupplier(event.target.value)}
                  disabled={!token || isUploading}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-60"
                >
                  <option value="mais_vantagens">Mais Vantagens</option>
                  <option value="riskin">Riskin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Período de referência</label>
                <input
                  value={uploadPeriod}
                  onChange={(event) => setUploadPeriod(event.target.value)}
                  type="month"
                  disabled={!token || isUploading}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Arquivo .xlsx</label>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={!token || isUploading}
                className="block w-full rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground disabled:opacity-60"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Estrutura esperada: planilha validada pela API. O envio só é liberado para perfil master autenticado.
              </p>
            </div>

            {!token ? (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-500">
                Faça login para habilitar o upload e consultar os relatórios reais.
              </div>
            ) : null}

            {uploadError ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {uploadError}
              </div>
            ) : null}

            {uploadSuccess ? (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-500">
                {uploadSuccess}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!token || isUploading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Enviar planilha
            </button>
          </motion.form>
        </div>

        {token ? (
          <div className="space-y-8 sm:space-y-12">
            {isLoadingData && (
              <div className="glass-card-light rounded-2xl p-8 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                Carregando dados reais de conciliação...
              </div>
            )}

            {dashboardError && (
              <div className="glass-card-light rounded-2xl p-6 border border-red-500/20 bg-red-500/5 text-sm text-red-500">
                {summaryQuery.error instanceof Error
                  ? summaryQuery.error.message
                  : reportsQuery.error instanceof Error
                    ? reportsQuery.error.message
                    : "Falha ao consultar os dados de conciliação."}
              </div>
            )}

            {!isLoadingData && !summaryQuery.error && !reportsQuery.error && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard icon={Files} title="Relatórios" value={String(totalSummary.reports)} description="Uploads processados" delay={0.1} />
                  <KPICard icon={Users} title="Registros cruzados" value={String(totalSummary.registros)} description="Linhas importadas" delay={0.15} />
                  <KPICard icon={FileCheck} title="Matches" value={String(totalSummary.matches)} description="Encontrados na base" delay={0.2} />
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

                    {selectedReport && (
                      <div className="rounded-xl border border-border/50 bg-background/30 p-4 mb-4">
                        <p className="text-sm font-semibold text-foreground">
                          {supplierLabel(selectedReport.fornecedor)} • {formatMonth(selectedReport.periodo_ref)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {selectedReport.total_divergencias} divergências de {selectedReport.total_registros} registros
                        </p>
                      </div>
                    )}

                    {loadingDivergences && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        Carregando divergências...
                      </div>
                    )}

                    {divergenceQuery.error && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                        {divergenceQuery.error instanceof Error ? divergenceQuery.error.message : "Falha ao buscar divergências."}
                      </div>
                    )}

                    {!selectedReportId && (
                      <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                        Nenhum relatório selecionado.
                      </div>
                    )}

                    {selectedReportId && !loadingDivergences && (divergenceQuery.data?.length || 0) === 0 && (
                      <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
                        Este relatório não tem divergências registradas.
                      </div>
                    )}

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
              </div>
            )}
          </div>
        ) : null}

        <BIChartsPanel />
        <ModulesGrid />
        <IntegrationsPanel />
        <RBACPanel />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 border-t border-border/40"
        >
          <p className="text-[10px] text-muted-foreground">
            Grupo Win — Painel Executivo v1.0 — dados operacionais e conciliações integrados no mesmo layout.
          </p>
        </motion.div>
      </div>

      <AIAssistantPanel />
    </div>
  );
};

export default Colaborador;
