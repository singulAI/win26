import { motion } from "framer-motion";
import { Scale, Clock, Smartphone, Users } from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";

const items = [
  {
    icon: Scale,
    title: "Marco Regulatorio",
    description: "PLP 143/2024 aprovado por unanimidade no Senado. Seguranca juridica para sua protecao.",
  },
  {
    icon: Clock,
    title: "Sem Carencia",
    description: "Ativacao imediata da protecao. Seu veiculo coberto desde o primeiro dia.",
  },
  {
    icon: Smartphone,
    title: "100% Digital",
    description: "Cotacao, contratacao e acionamento de sinistro pelo celular. Sem burocracia.",
  },
  {
    icon: Users,
    title: "Associacao, nao seguro",
    description: "Modelo associativo com rateio justo. Voce paga pelo que realmente custa.",
  },
];

const Differentials = () => {
  return (
    <section id="diferenciais" className="relative py-32 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gold mb-4">
            Diferenciais
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Por que <span className="text-gradient-gold">Grupo Win</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon size={22} strokeWidth={1.5} className="text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-secondary-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
