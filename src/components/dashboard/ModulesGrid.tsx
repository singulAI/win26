import { motion } from "framer-motion";
import { Eye, RefreshCw, AlertTriangle, FileCheck, Car, Shield, Flame, CloudRain, Users } from "lucide-react";

const modules = [
  {
    category: "Vistorias",
    icon: Eye,
    status: "Operacional",
    statusColor: "bg-emerald-500",
    items: ["Novo associado", "Migração de plano"],
    count: 142,
  },
  {
    category: "Revistorias",
    icon: RefreshCw,
    status: "Operacional",
    statusColor: "bg-emerald-500",
    items: ["Inadimplência", "Renovação"],
    count: 87,
  },
  {
    category: "Acionamentos",
    icon: AlertTriangle,
    status: "Operacional",
    statusColor: "bg-emerald-500",
    items: ["Colisões", "Roubo/Furto", "Vidros", "Desastres naturais", "Incêndio", "Terceiros"],
    count: 56,
  },
];

const statusFlow = [
  { label: "Rascunho", color: "bg-muted-foreground/30", pct: 8 },
  { label: "Aguardando cliente", color: "bg-gold/50", pct: 15 },
  { label: "Em execução", color: "bg-blue-500/60", pct: 35 },
  { label: "Concluída", color: "bg-emerald-500/60", pct: 42 },
];

const ModulesGrid = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card-light rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Módulos Operacionais</h3>
          <p className="text-xs text-muted-foreground mt-1">Status em tempo real dos módulos do sistema</p>
        </div>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="border border-border/60 rounded-xl p-5 bg-background/30 hover:border-gold/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <mod.icon size={16} strokeWidth={1.5} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{mod.category}</p>
                  <p className="text-[10px] text-muted-foreground">{mod.count} casos ativos</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${mod.statusColor}`} />
                <span className="text-[10px] text-muted-foreground">{mod.status}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mod.items.map((item) => (
                <span key={item} className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Flow Bar */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Distribuição de Status — Funil Operacional</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {statusFlow.map((s) => (
            <motion.div
              key={s.label}
              initial={{ width: 0 }}
              animate={{ width: `${s.pct}%` }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`${s.color} rounded-full`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
          {statusFlow.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-[10px] text-muted-foreground">{s.label} — {s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ModulesGrid;
