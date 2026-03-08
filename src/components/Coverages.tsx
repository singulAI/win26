import { motion } from "framer-motion";
import { Shield, Car, Wrench, Phone, Zap, Truck } from "lucide-react";

const coverages = [
  {
    icon: Shield,
    title: "Roubo e Furto",
    description: "Cobertura integral contra roubo e furto qualificado com indenizacao por tabela FIPE.",
  },
  {
    icon: Car,
    title: "Colisao Total",
    description: "Protecao contra colisao, capotamento e danos causados por terceiros ou fenomenos naturais.",
  },
  {
    icon: Wrench,
    title: "Vidros e Acessorios",
    description: "Para-brisa, vidros laterais, traseiro, farois, lanternas e retrovisores cobertos.",
  },
  {
    icon: Phone,
    title: "Assistencia 24h",
    description: "Guincho, socorro mecanico, troca de pneus, pane seca e chaveiro em todo o territorio nacional.",
  },
  {
    icon: Zap,
    title: "Veiculos Eletricos",
    description: "Protecao de bateria, pane eletrica, guincho especializado e rede credenciada de alta tensao.",
  },
  {
    icon: Truck,
    title: "Pesados e Frotas",
    description: "Caminhoes, vans e frotas PJ com desconto progressivo de ate 30% para multiplos veiculos.",
  },
];

const Coverages = () => {
  return (
    <section id="coberturas" className="py-32 px-6 md:px-16 bg-card">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gold mb-4">
            Coberturas
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Protecao <span className="text-gradient-gold">completa</span>
          </h2>
          <p className="text-secondary-foreground text-lg mt-6 max-w-xl mx-auto">
            Cada plano e construido para oferecer seguranca real, sem letras miudas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverages.map((cov, i) => (
            <motion.div
              key={cov.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-2xl p-8 group hover:border-gold-subtle transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
                <cov.icon size={22} strokeWidth={1.5} className="text-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{cov.title}</h3>
              <p className="text-secondary-foreground text-sm leading-relaxed">{cov.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coverages;
