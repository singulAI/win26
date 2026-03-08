import { motion } from "framer-motion";
import { ArrowLeft, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-grupowin.png";

interface DashboardHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const DashboardHeader = ({ isDark, onToggleTheme }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 border-b border-border/50"
      style={{
        background: "hsl(var(--background) / 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
          </button>
          <img src={logo} alt="Grupo Win" className="h-6 sm:h-7" />
          <div className="hidden sm:block h-5 w-px bg-border" />
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <LayoutDashboard size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">Painel Executivo</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-full">
            Ambiente Colaborador
          </span>
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
