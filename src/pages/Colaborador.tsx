import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Truck, FileText, BarChart3, Zap, Target, TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICard from "@/components/dashboard/KPICard";
import ArchitectureMap from "@/components/dashboard/ArchitectureMap";
import FlowDiagram from "@/components/dashboard/FlowDiagram";
import ModulesGrid from "@/components/dashboard/ModulesGrid";
import IntegrationsPanel from "@/components/dashboard/IntegrationsPanel";
import RBACPanel from "@/components/dashboard/RBACPanel";

const Colaborador = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero */}
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

        {/* KPIs */}
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

        {/* Princípios */}
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
          ].map((p, i) => (
            <div key={p.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/50">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <p.icon size={14} strokeWidth={1.5} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Architecture + Flow */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ArchitectureMap />
          <FlowDiagram />
        </div>

        {/* Modules */}
        <ModulesGrid />

        {/* Integrations */}
        <IntegrationsPanel />

        {/* RBAC */}
        <RBACPanel />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 border-t border-border/40"
        >
          <p className="text-[10px] text-muted-foreground">
            Grupo Win — Painel Executivo v1.0 — Dados simulados para apresentação à diretoria
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Colaborador;
