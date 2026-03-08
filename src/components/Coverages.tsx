import { motion } from "framer-motion";
import { Shield, Car, Wrench, Phone, Zap, Truck } from "lucide-react";

const coverages = [
  {
    icon: Shield,
    title: "Roubo e Furto",
    description: "Cobertura integral contra roubo e furto qualificado com indenização pela tabela FIPE.",
  },
  {
    icon: Car,
    title: "Colisão e Danos",
    description: "Proteção contra colisão, capotamento, alagamento, chuva de granizo e queda de árvore.",
  },
  {
    icon: Wrench,
    title: "Vidros e Acessórios",
    description: "Para-brisa, vidros laterais, traseiro, faróis, lanternas e retrovisores cobertos.",
  },
  {
    icon: Phone,
    title: "Assistência 24h",
    description: "Guincho ilimitado em colisão, socorro mecânico, troca de pneus, chaveiro e recarga de bateria.",
  },
  {
    icon: Zap,
    title: "Veículos Elétricos",
    description: "Proteção de bateria, pane elétrica, guincho especializado e rede credenciada de alta tensão.",
  },
  {
    icon: Truck,
    title: "Pesados e Frotas",
    description: "Caminhões, vans e frotas PJ com desconto progressivo de até 30% para múltiplos veículos.",
  },
];

const Coverages = () => {
  return (
    <section id="coberturas" className="py-16 sm:py-28 lg:py-40 px-4 sm:px-8 lg:px-16 bg-card">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 lg:mb-20"
        >
          <p className="text-[11px] sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-gold mb-2.5 sm:mb-4">
            Coberturas
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Proteção <span className="text-gradient-gold">completa</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg mt-3 sm:mt-6 max-w-xl mx-auto">
            Cada plano é construído para oferecer segurança real, sem letras miúdas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {coverages.map((cov, i) => (
            <motion.div
              key={cov.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card-light rounded-xl sm:rounded-2xl p-5 sm:p-7 lg:p-8 group hover:border-gold-subtle transition-colors"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 group-hover:bg-gold/10 transition-colors">
                <cov.icon size={18} strokeWidth={1.5} className="text-gold sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2 lg:mb-3 text-foreground">{cov.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{cov.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coverages;
