import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "WIN Essencial",
    subtitle: "Entrada",
    price: "89",
    fipe: "Ate R$ 60 mil",
    popular: false,
    features: [
      "Protecao contra roubo e furto",
      "Colisao e danos da natureza",
      "Cotacao 100% digital",
      "Assistencia basica",
    ],
  },
  {
    name: "WIN Protecao",
    subtitle: "Completo",
    price: "149",
    fipe: "Ate R$ 120 mil",
    popular: true,
    features: [
      "Tudo do Essencial",
      "Assistencia 24h inclusa",
      "Vidros, farois e retrovisores",
      "Carro reserva 7 dias",
      "Protecao a terceiros",
    ],
  },
  {
    name: "WIN Total",
    subtitle: "Premium",
    price: "229",
    fipe: "Ate R$ 200 mil",
    popular: false,
    features: [
      "Tudo do Protecao",
      "Rastreador incluso",
      "Assistencia ilimitada",
      "Carro reserva 15 dias",
      "Clube de descontos",
      "Auxilio funeral R$ 5.000",
    ],
  },
  {
    name: "WIN Elite",
    subtitle: "Acima R$ 200k",
    price: "349",
    fipe: "Acima R$ 200 mil",
    popular: false,
    features: [
      "Tudo do Total",
      "Cobertura premium total",
      "Assistencia VIP dedicada",
      "Carro reserva 30 dias",
      "Desconto progressivo",
      "Gestor de conta exclusivo",
    ],
  },
];

const Plans = () => {
  return (
    <section id="planos" className="py-32 px-6 md:px-16">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gold mb-4">
            Planos
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Escolha sua <span className="text-gradient-gold">protecao</span>
          </h2>
          <p className="text-secondary-foreground text-lg mt-6 max-w-xl mx-auto">
            Do essencial ao premium. Todos com cobertura nacional e transparencia total.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "bg-gradient-gold shadow-gold"
                  : "glass-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 text-xs font-semibold bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full">
                  Mais vendido
                </span>
              )}

              <p className={`text-sm font-medium mb-1 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.subtitle}
              </p>
              <h3 className={`text-2xl font-bold mb-1 ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-xs mb-6 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                FIPE {plan.fipe}
              </p>

              <div className="mb-8">
                <span className={`text-xs ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>a partir de</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>R$</span>
                  <span className={`text-5xl font-bold tracking-tight ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/mes</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-sm ${plan.popular ? "text-primary-foreground/90" : "text-secondary-foreground"}`}>
                    <Check size={16} strokeWidth={1.5} className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary-foreground" : "text-gold"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={`inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-primary-foreground text-primary hover:opacity-90"
                    : "border border-border hover:border-gold text-foreground hover:text-gold"
                }`}
              >
                Cotar agora
                <ArrowRight size={16} strokeWidth={1.5} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;
