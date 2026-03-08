import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingDown, TrendingUp, DollarSign, AlertCircle,
  ChevronDown, ChevronUp, Users, FileText, CreditCard, Percent, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, LineChart, Line, Legend
} from "recharts";

// Inverted funnel data - Balancete pipeline
const funnelData = [
  { stage: "Faturamento Bruto", value: 485000, fill: "hsl(40, 72%, 42%)" },
  { stage: "(-) Inadimplência", value: 412000, fill: "hsl(42, 68%, 52%)" },
  { stage: "(-) Custos Operacionais", value: 340000, fill: "hsl(38, 60%, 38%)" },
  { stage: "(-) Sinistros Pagos", value: 245000, fill: "hsl(36, 78%, 32%)" },
  { stage: "Resultado Líquido", value: 168000, fill: "hsl(142, 71%, 45%)" },
];

// Monthly billing data
const monthlyData = [
  { mes: "Out", faturado: 420000, recebido: 385000, inadimplencia: 35000 },
  { mes: "Nov", faturado: 438000, recebido: 398000, inadimplencia: 40000 },
  { mes: "Dez", faturado: 452000, recebido: 410000, inadimplencia: 42000 },
  { mes: "Jan", faturado: 465000, recebido: 420000, inadimplencia: 45000 },
  { mes: "Fev", faturado: 478000, recebido: 435000, inadimplencia: 43000 },
  { mes: "Mar", faturado: 485000, recebido: 445000, inadimplencia: 40000 },
];

// Annual closings data
const annualData = [
  { ano: "2022", receita: 3800000, despesas: 3200000, resultado: 600000, sinistros: 1100000, associados: 2100 },
  { ano: "2023", receita: 4500000, despesas: 3700000, resultado: 800000, sinistros: 1350000, associados: 3200 },
  { ano: "2024", receita: 5200000, despesas: 4100000, resultado: 1100000, sinistros: 1500000, associados: 4100 },
  { ano: "2025", receita: 5800000, despesas: 4500000, resultado: 1300000, sinistros: 1600000, associados: 4832 },
];

// Inadimplência aging
const agingData = [
  { faixa: "1-30 dias", qtd: 128, valor: 24500, pct: 42 },
  { faixa: "31-60 dias", qtd: 86, valor: 18200, pct: 28 },
  { faixa: "61-90 dias", qtd: 52, valor: 11800, pct: 17 },
  { faixa: "90+ dias", qtd: 38, valor: 8300, pct: 13 },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

const formatMillions = (v: number) => `${(v / 1000000).toFixed(1)}M`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span style={{ color: p.color }}>●</span> {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

type ViewMode = "balancete" | "anual";

const BIChartsPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("balancete");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="glass-card-light rounded-2xl overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 sm:px-8 py-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center">
            <BarChart3 size={18} className="text-primary-foreground" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              BI Financeiro — Balancete & Fechamentos
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Funil invertido • Fechamento mensal & anual • Visão de inadimplência
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
            <TrendingUp size={10} /> Resultado positivo
          </span>
          {isExpanded ? (
            <ChevronUp size={18} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={18} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 sm:px-8 pb-8 space-y-8">
          {/* View mode tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode("balancete"); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                viewMode === "balancete"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 size={12} />
              Balancete Mensal
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode("anual"); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                viewMode === "anual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar size={12} />
              Fechamentos Anuais
            </button>
          </div>

          {viewMode === "balancete" ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: "Faturamento", value: "R$ 485k", change: "+4.2%", up: true },
                  { icon: CreditCard, label: "Recebido", value: "R$ 445k", change: "+2.3%", up: true },
                  { icon: Percent, label: "Inadimplência", value: "8.2%", change: "-0.5pp", up: false },
                  { icon: FileText, label: "Títulos abertos", value: "304", change: "-12", up: false },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-4 rounded-xl border border-border/50 bg-background/40">
                    <div className="flex items-center gap-2 mb-2">
                      <kpi.icon size={14} className="text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                    <span
                      className={`text-[10px] font-medium ${
                        kpi.label === "Inadimplência"
                          ? kpi.up ? "text-red-500" : "text-emerald-500"
                          : kpi.up ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* Inverted Funnel */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Funil Invertido — Pipeline do Balancete</p>
                <p className="text-[10px] text-muted-foreground mb-4">Do faturamento bruto ao resultado líquido</p>
                <div className="space-y-2">
                  {funnelData.map((item, i) => {
                    const maxVal = funnelData[0].value;
                    const widthPct = (item.value / maxVal) * 100;
                    const isLast = i === funnelData.length - 1;
                    return (
                      <motion.div
                        key={item.stage}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-[10px] text-muted-foreground w-[140px] shrink-0 text-right">
                          {item.stage}
                        </span>
                        <div className="flex-1 h-8 rounded-lg bg-muted/30 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ duration: 0.8, delay: 0.15 * i }}
                            className="h-full rounded-lg flex items-center justify-end pr-3"
                            style={{
                              background: isLast
                                ? "linear-gradient(90deg, hsl(142, 71%, 35%), hsl(142, 71%, 45%))"
                                : `linear-gradient(90deg, ${item.fill}cc, ${item.fill})`,
                            }}
                          >
                            <span className="text-[10px] font-bold text-white drop-shadow-sm">
                              {formatCurrency(item.value)}
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly chart + Aging */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Evolução Mensal</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Faturado vs Recebido (últimos 6 meses)</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(40, 72%, 42%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(40, 72%, 42%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="faturado" name="Faturado" stroke="hsl(40, 72%, 42%)" fill="url(#gradFat)" strokeWidth={2} />
                        <Area type="monotone" dataKey="recebido" name="Recebido" stroke="hsl(142, 71%, 45%)" fill="url(#gradRec)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Aging de Inadimplência</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Distribuição por faixa de atraso</p>
                  <div className="space-y-2">
                    {agingData.map((row, i) => (
                      <motion.div
                        key={row.faixa}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-medium text-foreground">{row.faixa}</span>
                            <span className="text-[10px] text-muted-foreground">{row.qtd} títulos</span>
                          </div>
                          <div className="flex h-1.5 rounded-full bg-muted/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${row.pct}%` }}
                              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                              className="rounded-full"
                              style={{
                                background:
                                  i === 0
                                    ? "hsl(45, 80%, 50%)"
                                    : i === 1
                                    ? "hsl(30, 80%, 50%)"
                                    : i === 2
                                    ? "hsl(15, 80%, 50%)"
                                    : "hsl(0, 70%, 50%)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground">{formatCurrency(row.valor)}</p>
                          <p className="text-[10px] text-muted-foreground">{row.pct}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-500/80">
                      <strong>Atenção:</strong> 38 títulos com mais de 90 dias — considere envio para cobrança judicial.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inadimplência bar chart */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Inadimplência Mensal</p>
                <p className="text-[10px] text-muted-foreground mb-4">Volume não recebido por mês</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="inadimplencia" name="Inadimplência" radius={[6, 6, 0, 0]}>
                        {monthlyData.map((_, i) => (
                          <Cell key={i} fill={`hsl(0, ${50 + i * 5}%, ${55 - i * 3}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Annual KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: "Receita 2025", value: "R$ 5.8M", change: "+11.5%", up: true },
                  { icon: TrendingUp, label: "Resultado 2025", value: "R$ 1.3M", change: "+18.2%", up: true },
                  { icon: Users, label: "Associados", value: "4.832", change: "+17.8%", up: true },
                  { icon: TrendingDown, label: "Sinistralidade", value: "27.6%", change: "-1.2pp", up: false },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-4 rounded-xl border border-border/50 bg-background/40">
                    <div className="flex items-center gap-2 mb-2">
                      <kpi.icon size={14} className="text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                    <span className={`text-[10px] font-medium ${
                      kpi.label === "Sinistralidade"
                        ? kpi.up ? "text-red-500" : "text-emerald-500"
                        : kpi.up ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* Annual Revenue vs Result chart */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Receita vs Resultado Líquido</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Evolução anual (2022–2025)</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={annualData}>
                        <defs>
                          <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(40, 72%, 52%)" />
                            <stop offset="100%" stopColor="hsl(40, 72%, 38%)" />
                          </linearGradient>
                          <linearGradient id="gradResultado" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142, 71%, 50%)" />
                            <stop offset="100%" stopColor="hsl(142, 71%, 35%)" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="ano" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatMillions} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="receita" name="Receita" fill="url(#gradReceita)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="resultado" name="Resultado" fill="url(#gradResultado)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Sinistros vs Crescimento</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Sinistros pagos e base de associados</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={annualData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="ano" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatMillions} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line yAxisId="left" type="monotone" dataKey="sinistros" name="Sinistros" stroke="hsl(0, 70%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
                        <Line yAxisId="right" type="monotone" dataKey="associados" name="Associados" stroke="hsl(210, 70%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Annual summary cards */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-3">Resumo por Exercício</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {annualData.map((year, i) => {
                    const margin = ((year.resultado / year.receita) * 100).toFixed(1);
                    const sinistralidade = ((year.sinistros / year.receita) * 100).toFixed(1);
                    return (
                      <motion.div
                        key={year.ano}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className={`p-4 rounded-xl border bg-background/40 ${
                          i === annualData.length - 1 ? "border-primary/30 ring-1 ring-primary/10" : "border-border/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-foreground">{year.ano}</span>
                          {i === annualData.length - 1 && (
                            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Atual
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Receita</span>
                            <span className="text-[10px] font-semibold text-foreground">{formatCurrency(year.receita)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Despesas</span>
                            <span className="text-[10px] font-semibold text-foreground">{formatCurrency(year.despesas)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Resultado</span>
                            <span className="text-[10px] font-bold text-emerald-500">{formatCurrency(year.resultado)}</span>
                          </div>
                          <div className="pt-2 border-t border-border/30 flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Margem</span>
                            <span className="text-[10px] font-semibold text-emerald-500">{margin}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Sinistralidade</span>
                            <span className="text-[10px] font-semibold text-foreground">{sinistralidade}%</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BIChartsPanel;
