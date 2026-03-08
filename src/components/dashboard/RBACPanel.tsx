import { motion } from "framer-motion";
import { Shield, Lock, Key } from "lucide-react";

const roles = [
  {
    prefix: "/api/admin/**",
    role: "Master",
    desc: "Acesso total + administração",
    color: "border-gold/30 bg-gold/5",
    badgeColor: "bg-gold/15 text-gold",
  },
  {
    prefix: "/api/acionamentos/**",
    role: "Master + Eventos",
    desc: "Gestão de eventos danosos",
    color: "border-blue-500/20 bg-blue-500/5",
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    prefix: "/api/vistorias/**",
    role: "Master",
    desc: "Vistorias de adesão e migração",
    color: "border-purple-500/20 bg-purple-500/5",
    badgeColor: "bg-purple-500/10 text-purple-400",
  },
  {
    prefix: "/api/revistorias/**",
    role: "Master",
    desc: "Revistorias por inadimplência/renovação",
    color: "border-emerald-500/20 bg-emerald-500/5",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
  },
];

const RBACPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="glass-card-light rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">RBAC — Controle de Acesso</h3>
          <p className="text-xs text-muted-foreground mt-1">Perfis, rotas protegidas e autenticação JWT</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <Lock size={10} /> JWT + API Key
        </div>
      </div>

      <div className="space-y-3">
        {roles.map((r, i) => (
          <motion.div
            key={r.prefix}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${r.color}`}
          >
            <div className="flex items-center gap-3">
              <code className="text-[11px] font-mono text-foreground/80 bg-background/50 px-3 py-1 rounded-lg">{r.prefix}</code>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${r.badgeColor}`}>{r.role}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{r.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Auth method */}
      <div className="mt-6 p-4 rounded-xl border border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <Key size={14} className="text-gold" />
          <p className="text-xs font-semibold text-foreground">Método de autenticação</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Usuário único <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">admwin</code> com 5 senhas pessoais distintas. 
          API retorna JWT com <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">public_id</code> do operador. 
          Header legado: <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">X-Api-Key</code>.
        </p>
      </div>
    </motion.div>
  );
};

export default RBACPanel;
