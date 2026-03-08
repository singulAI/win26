import { motion } from "framer-motion";
import { Scale, Clock, Smartphone, Users } from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";

const items = [
  {
    icon: Scale,
    title: "Marco Regulatório",
    description: "PLP 143/2024 aprovado por unanimidade no Senado. Segurança jurídica para sua proteção.",
  },
  {
    icon: Clock,
    title: "Sem Carência",
    description: "Ativação imediata da proteção. Seu veículo coberto desde o primeiro dia.",
  },
  {
    icon: Smartphone,
    title: "100% Digital",
    description: "Cotação, contratação e acionamento de sinistro pelo celular. Sem burocracia.",
  },
  {
    icon: Users,
    title: "Associação, não seguro",
    description: "Modelo associativo com rateio justo. Você paga pelo que realmente custa.",
  },
];

const Differentials = () => {
  return (
    <section id="diferenciais" className="relative py-16 sm:py-28 lg:py-40 px-4 sm:px-8 lg:px-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-30" />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 lg:mb-20"
        >
          <p className="text-[11px] sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-gold mb-2.5 sm:mb-4">
            Diferenciais
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Por que <span className="text-gradient-gold">Grupo Win</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-3 sm:gap-4 lg:gap-5"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon size={18} strokeWidth={1.5} className="text-gold sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-1.5 lg:mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
