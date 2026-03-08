import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

const steps = [
  { label: "Associado / Operador", sublabel: "Entrada", color: "bg-gold/15 border-gold/30 text-gold" },
  { label: "Typebot Hub", sublabel: "Coleta + Validação", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  { label: "n8n", sublabel: "Processa + Registra", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
];

const outputs = [
  { label: "ERPNext", desc: "Financeiro mestre" },
  { label: "Siprov", desc: "Operação do produto" },
  { label: "Chatwoot", desc: "Exceções + humano" },
];

const FlowDiagram = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="glass-card-light rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Fluxo Fim a Fim</h3>
        <p className="text-xs text-muted-foreground mt-1">Do associado à resolução — totalmente automatizado</p>
      </div>

      {/* Vertical flow on mobile, horizontal on desktop */}
      <div className="flex flex-col lg:flex-row items-center gap-3 mb-6">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className={`w-full lg:w-auto px-6 py-4 rounded-xl border ${step.color} text-center`}
            >
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{step.sublabel}</p>
            </motion.div>
            {i < steps.length - 1 && (
              <>
                <ArrowDown size={16} className="text-muted-foreground/40 lg:hidden" />
                <ArrowRight size={16} className="text-muted-foreground/40 hidden lg:block" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Outputs */}
      <div className="flex items-center gap-3 mb-4 pl-0 lg:pl-4">
        <ArrowDown size={16} className="text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sistemas de destino</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {outputs.map((out, i) => (
          <motion.div
            key={out.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="px-5 py-4 rounded-xl border border-border/60 bg-background/30 text-center"
          >
            <p className="text-sm font-semibold text-foreground">{out.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{out.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FlowDiagram;
