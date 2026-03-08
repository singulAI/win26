import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  description?: string;
  delay?: number;
}

const KPICard = ({ title, value, change, changeType = "up", icon: Icon, description, delay = 0 }: KPICardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card-light rounded-2xl p-6 relative overflow-hidden group hover:shadow-gold/10 hover:border-gold/20 transition-all duration-500"
    >
      {/* Subtle gold accent */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
          <Icon size={20} strokeWidth={1.5} className="text-gold" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
            changeType === "up" 
              ? "bg-emerald-500/10 text-emerald-500" 
              : changeType === "down" 
              ? "bg-red-500/10 text-red-500"
              : "bg-muted text-muted-foreground"
          }`}>
            {changeType === "up" ? <TrendingUp size={12} /> : changeType === "down" ? <TrendingDown size={12} /> : null}
            {change}
          </div>
        )}
      </div>

      <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{title}</p>
      {description && (
        <p className="text-[11px] text-muted-foreground/70 mt-2">{description}</p>
      )}
    </motion.div>
  );
};

export default KPICard;
