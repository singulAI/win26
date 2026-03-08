import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import logo from "@/assets/logo-grupowin.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Veículo protegido pelo Grupo Win"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 md:px-16 py-6 flex items-center justify-between">
        <img src={logo} alt="Grupo Win" className="h-8 md:h-10" />
        <div className="hidden md:flex items-center gap-10">
          <a href="#planos" className="text-sm text-secondary-foreground hover:text-foreground transition-colors tracking-wide">Planos</a>
          <a href="#coberturas" className="text-sm text-secondary-foreground hover:text-foreground transition-colors tracking-wide">Coberturas</a>
          <a href="#diferenciais" className="text-sm text-secondary-foreground hover:text-foreground transition-colors tracking-wide">Diferenciais</a>
          <a href="#contato" className="text-sm text-secondary-foreground hover:text-foreground transition-colors tracking-wide">Contato</a>
        </div>
        <a
          href="#contato"
          className="bg-gradient-gold text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Cotar agora
        </a>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-16 pt-32">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium tracking-[0.2em] uppercase text-gold mb-6"
          >
            Associacao de Beneficios
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] tracking-tight mb-8"
          >
            Protecao que
            <br />
            <span className="text-gradient-gold">evolui</span> com
            <br />
            o mercado.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-secondary-foreground leading-relaxed mb-12 max-w-lg"
          >
            Planos de protecao veicular completos para carros, motos, eletricos
            e pesados. Cobertura nacional com assistencia 24h.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-6"
          >
            <a
              href="#planos"
              className="bg-gradient-gold text-primary-foreground px-8 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-3 shadow-gold"
            >
              Ver planos
              <ArrowRight size={18} strokeWidth={1.5} />
            </a>
            <a
              href="#coberturas"
              className="text-secondary-foreground hover:text-foreground transition-colors text-base font-medium border border-border px-8 py-4 rounded-full hover:border-muted-foreground"
            >
              Conhecer coberturas
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex gap-16 mt-20 pt-10 border-t border-border"
          >
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient-gold">167+</p>
              <p className="text-sm text-muted-foreground mt-1">Planos ativos</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">24h</p>
              <p className="text-sm text-muted-foreground mt-1">Assistencia</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">R$10,7bi</p>
              <p className="text-sm text-muted-foreground mt-1">Mercado nacional</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
