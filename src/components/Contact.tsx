import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contato" className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-16 bg-card">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gold mb-3 sm:mb-4">
              Contato
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Faça sua <span className="text-gradient-gold">cotação</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-12">
              Preencha seus dados e receba uma proposta personalizada em até 24 horas.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 sm:space-y-5 text-left"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full bg-muted border border-border rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
              <input
                type="tel"
                placeholder="Telefone"
                className="w-full bg-muted border border-border rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
            </div>
            <input
              type="email"
              placeholder="E-mail"
              className="w-full bg-muted border border-border rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <select className="w-full bg-muted border border-border rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all appearance-none">
                <option value="">Tipo de veículo</option>
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
                <option value="eletrico">Elétrico / Híbrido</option>
                <option value="caminhao">Caminhão</option>
                <option value="van">Van / Furgão</option>
              </select>
              <input
                type="text"
                placeholder="Valor FIPE estimado"
                className="w-full bg-muted border border-border rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-gold text-primary-foreground py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-3 shadow-gold mt-2 sm:mt-4"
            >
              Solicitar cotação
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
