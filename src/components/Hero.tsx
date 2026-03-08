import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sun, Moon, Menu, User } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import logo from "@/assets/logo-grupowin.png";
import SidebarModal from "./SidebarModal";

interface HeroProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const Hero = ({ isDark, onToggleTheme }: HeroProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="absolute top-0 left-0 right-0 z-20 px-5 sm:px-8 lg:px-16 py-5 sm:py-6 flex items-center justify-between">
        <img src={logo} alt="Grupo Win" className="h-7 sm:h-8 lg:h-10" />

        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Planos</a>
          <a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Coberturas</a>
          <a href="#diferenciais" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Diferenciais</a>
          <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">Contato</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Área do usuário"
          >
            <User size={15} strokeWidth={1.5} />
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Menu"
          >
            <Menu size={15} strokeWidth={1.5} />
          </button>

          <a
            href="#contato"
            className="hidden sm:inline-flex bg-gradient-gold text-primary-foreground px-5 lg:px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Cotar agora
          </a>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[72px] left-0 right-0 z-20 px-5 py-4 md:hidden"
          style={{
            background: "hsl(var(--surface-glass) / 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid hsl(var(--border) / 0.5)",
          }}
        >
          <div className="flex flex-col gap-3">
            <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground py-2">Planos</a>
            <a href="#coberturas" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground py-2">Coberturas</a>
            <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground py-2">Diferenciais</a>
            <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground py-2">Contato</a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-gradient-gold text-primary-foreground px-5 py-3 rounded-full text-sm font-semibold text-center hover:opacity-90 transition-opacity mt-1"
            >
              Cotar agora
            </a>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-16 pt-28 sm:pt-32">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gold mb-5 sm:mb-6"
          >
            Associação de Benefícios
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] tracking-tight mb-6 sm:mb-8"
          >
            Faça sua proteção
            <br />
            com a <span className="text-gradient-gold">melhor</span>
            <br />
            avaliada.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 sm:mb-12 max-w-lg"
          >
            Proteção veicular completa com guincho ilimitado em colisão,
            franquia de 8% a 10% e cobertura em todo o território nacional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <a
              href="#planos"
              className="bg-gradient-gold text-primary-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-3 shadow-gold"
            >
              Ver planos
              <ArrowRight size={18} strokeWidth={1.5} />
            </a>
            <a
              href="#coberturas"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base font-medium border border-border px-6 sm:px-8 py-3.5 sm:py-4 rounded-full hover:border-muted-foreground text-center"
            >
              Conhecer coberturas
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap gap-8 sm:gap-12 lg:gap-16 mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-border"
          >
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-gold">8–10%</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Franquia</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">24h</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Assistência</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Nacional</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Cobertura</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sidebar Modal */}
      <SidebarModal isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </section>
  );
};

export default Hero;
