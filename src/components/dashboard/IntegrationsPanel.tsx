import { motion } from "framer-motion";
import { Check, AlertCircle, Pause, ExternalLink } from "lucide-react";

const integrations = [
  {
    name: "Siprov",
    domain: "Operação do produto",
    status: "online",
    desc: "Vistorias, revistorias e acionamentos — webhooks ativos",
    features: ["Boletos / Títulos", "Notificação e-mail", "OCR de documentos"],
  },
  {
    name: "ERPNext",
    domain: "Financeiro mestre",
    status: "online",
    desc: "Customer, Contact, Finance Events via API Key",
    features: ["Criar/atualizar Customer", "Finance Events", "Relatórios"],
  },
  {
    name: "Evolution API",
    domain: "WhatsApp",
    status: "online",
    desc: "Disparos automatizados: cobranças, 2ª via, notificações",
    features: ["Mensagens automatizadas", "Cobranças", "2ª via boleto"],
  },
  {
    name: "Assist24",
    domain: "Assistência 24h",
    status: "standby",
    desc: "Pull manual (cron/n8n) — idempotente com external_id",
    features: ["Sync manual", "External link", "Guincho"],
  },
  {
    name: "Typebot Hub",
    domain: "Interface de entrada",
    status: "online",
    desc: "Bots de atendimento: adesão, 2ª via, acionamentos",
    features: ["Adesão de associados", "2ª via boleto", "Acionamento guincho"],
  },
  {
    name: "Chatwoot",
    domain: "Atendimento humano",
    status: "online",
    desc: "Escalonamento + exceções + contexto completo",
    features: ["Chat ao vivo", "Tickets", "Automações"],
  },
];

const statusConfig = {
  online: { icon: Check, label: "Online", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  standby: { icon: Pause, label: "Standby", color: "text-gold", bg: "bg-gold/10" },
  error: { icon: AlertCircle, label: "Erro", color: "text-red-500", bg: "bg-red-500/10" },
};

const IntegrationsPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card-light rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Integrações Desacopladas</h3>
          <p className="text-xs text-muted-foreground mt-1">Todas as integrações são independentes e reprocessáveis</p>
        </div>
        <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
          5/6 online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int, i) => {
          const cfg = statusConfig[int.status as keyof typeof statusConfig];
          return (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="border border-border/60 rounded-xl p-5 bg-background/30 hover:border-gold/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{int.name}</p>
                  <p className="text-[10px] text-muted-foreground">{int.domain}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.bg}`}>
                  <cfg.icon size={10} className={cfg.color} />
                  <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{int.desc}</p>
              <div className="flex flex-wrap gap-1">
                {int.features.map((f) => (
                  <span key={f} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default IntegrationsPanel;
