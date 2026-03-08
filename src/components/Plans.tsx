import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

const plans = [
  {
    name: "WIN Básico",
    subtitle: "Proteção essencial",
    price: "100",
    highlight: "Guincho ilimitado em colisão",
    popular: false,
    previewFeatures: [
      "Roubo, furto e incêndio",
      "Guincho ilimitado para colisão",
      "Terceiros: R$ 100 mil + R$ 30 mil",
      "Proteção em todo o território nacional",
    ],
    expandedFeatures: [
      "Chuva de granizo e queda de árvore",
      "Alagamento",
      "Dois guinchos mensais para pane (400 km)",
      "Chaveiro e troca de pneus",
      "Recarga de bateria",
      "Assistência residencial",
      "Sem perfil de condutor",
      "Auxílio de retorno ao domicílio",
      "Grupo Win Descontos",
    ],
  },
  {
    name: "WIN Completo",
    subtitle: "Proteção total",
    price: "150",
    highlight: "Carro reserva + rastreador incluso",
    popular: true,
    previewFeatures: [
      "Tudo do plano Básico",
      "Carro reserva por 7 dias",
      "Rastreador incluso",
      "Guincho ilimitado para colisão",
    ],
    expandedFeatures: [
      "Roubo, furto e incêndio",
      "Chuva de granizo e queda de árvore",
      "Alagamento",
      "Dois guinchos mensais para pane (400 km)",
      "Chaveiro e troca de pneus",
      "Terceiros: R$ 100 mil + R$ 30 mil",
      "Recarga de bateria",
      "Assistência residencial",
      "Sem perfil de condutor",
      "Proteção em todo o território nacional",
      "Auxílio de retorno ao domicílio",
      "Grupo Win Descontos",
    ],
  },
];

const Plans = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="planos" className="py-24 sm:py-32 lg:py-40 px-5 sm:px-8 lg:px-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 sm:mb-6"
        >
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gold mb-3 sm:mb-4">
            Planos
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Escolha sua <span className="text-gradient-gold">proteção</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-4 sm:mt-6 max-w-lg mx-auto">
            Franquia de 8% a 10%. Cobertura nacional com transparência total.
          </p>
        </motion.div>

        {/* Highlight badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gold border border-gold-subtle rounded-full px-4 sm:px-5 py-2">
            Guincho ilimitado em caso de colisão
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? "bg-gradient-gold shadow-gold"
                    : "glass-card-light"
                }`}
              >
                {/* Card header */}
                <div className="p-6 sm:p-8 pb-0">
                  {plan.popular && (
                    <span className="inline-block text-xs font-semibold bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full mb-3 sm:mb-4">
                      Recomendado
                    </span>
                  )}

                  <p className={`text-xs sm:text-sm font-medium mb-1 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.subtitle}
                  </p>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>

                  <div className="mt-3 sm:mt-4 mb-2">
                    <span className={`text-xs ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      a partir de
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>R$</span>
                      <span className={`text-4xl sm:text-5xl font-bold tracking-tight ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/mês</span>
                    </div>
                    <p className={`text-xs mt-1 ${plan.popular ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      Consulte informações para o seu veículo
                    </p>
                  </div>

                  {/* Highlight */}
                  <div className={`mt-3 sm:mt-4 mb-5 sm:mb-6 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl ${
                    plan.popular 
                      ? "bg-primary-foreground/10 text-primary-foreground" 
                      : "bg-gold/8 text-gold-dark dark:text-gold"
                  }`}>
                    {plan.highlight}
                  </div>
                </div>

                {/* Features preview */}
                <div className="px-6 sm:px-8">
                  <ul className="space-y-2.5 sm:space-y-3">
                    {plan.previewFeatures.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 sm:gap-3 text-sm ${plan.popular ? "text-primary-foreground/90" : "text-foreground"}`}>
                        <Check size={14} strokeWidth={2} className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary-foreground" : "text-gold"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expandable features */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-8 pt-3">
                        <div className={`h-px mb-3 ${plan.popular ? "bg-primary-foreground/15" : "bg-border"}`} />
                        <ul className="space-y-2.5 sm:space-y-3">
                          {plan.expandedFeatures.map((f) => (
                            <li key={f} className={`flex items-start gap-2.5 sm:gap-3 text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              <Check size={14} strokeWidth={2} className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary-foreground/60" : "text-gold/60"}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className={`flex items-center justify-center gap-1.5 text-xs font-medium py-3 mt-3 sm:mt-4 mx-6 sm:mx-8 rounded-xl transition-colors ${
                    plan.popular
                      ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {isExpanded ? "Ver menos" : "Ver todos os benefícios"}
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* CTA */}
                <div className="p-6 sm:p-8 pt-3 sm:pt-4">
                  <a
                    href="#contato"
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 sm:py-4 text-sm font-semibold transition-all ${
                      plan.popular
                        ? "bg-primary-foreground text-gold hover:opacity-90"
                        : "bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
                    }`}
                  >
                    Solicitar cotação
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Plans;
