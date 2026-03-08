import { motion } from "framer-motion";
import { Globe, Server, Database, Bot, MessageSquare, Workflow, ShieldCheck, Zap } from "lucide-react";

const layers = [
  {
    label: "EDGE",
    sublabel: "Nginx + TLS",
    color: "from-gold/20 to-gold/5",
    borderColor: "border-gold/30",
    items: [
      { icon: Globe, name: "grupowin.site", desc: "Site institucional" },
      { icon: ShieldCheck, name: "SSL/TLS", desc: "Certificados automáticos" },
    ],
  },
  {
    label: "APLICAÇÃO",
    sublabel: "Lógica de negócio",
    color: "from-blue-500/10 to-blue-500/5",
    borderColor: "border-blue-500/20",
    items: [
      { icon: Server, name: "api.grupowin.site", desc: "FastAPI — RBAC, Auditoria" },
      { icon: Zap, name: "sos.grupowin.site", desc: "Portal operacional" },
      { icon: Zap, name: "metrics.grupowin.site", desc: "BI + Auditoria + IA" },
    ],
  },
  {
    label: "AUTOMAÇÃO",
    sublabel: "Bots & Workflows",
    color: "from-purple-500/10 to-purple-500/5",
    borderColor: "border-purple-500/20",
    items: [
      { icon: Bot, name: "Typebot Hub", desc: "Interface de entrada — bots" },
      { icon: Workflow, name: "n8n", desc: "Motor de processos" },
      { icon: MessageSquare, name: "Chatwoot", desc: "Atendimento humano" },
    ],
  },
  {
    label: "DADOS",
    sublabel: "Persistência & Cache",
    color: "from-emerald-500/10 to-emerald-500/5",
    borderColor: "border-emerald-500/20",
    items: [
      { icon: Database, name: "PostgreSQL", desc: "pgvector — Estado operacional" },
      { icon: Database, name: "Redis", desc: "Cache, filas, sessões" },
    ],
  },
];

const ArchitectureMap = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card-light rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Arquitetura Macro</h3>
          <p className="text-xs text-muted-foreground mt-1">Stack completa — 4 camadas</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted px-3 py-1 rounded-full">v1.0 — Mar/2026</span>
      </div>

      <div className="space-y-4">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
          >
            <div className={`rounded-xl border ${layer.borderColor} bg-gradient-to-r ${layer.color} p-4 sm:p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/70">{layer.label}</span>
                <span className="text-[10px] text-muted-foreground">— {layer.sublabel}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {layer.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 bg-background/50 rounded-lg px-3.5 py-3 border border-border/30">
                    <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            {i < layers.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-4 bg-border" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ArchitectureMap;
