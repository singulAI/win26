import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Truck, AlertTriangle, LogIn, Building2, Wrench } from "lucide-react";

type TabKey = "colaborador" | "associado" | "fornecedor";

interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "colaborador", label: "Colaborador", icon: User },
  { key: "associado", label: "Associado", icon: Building2 },
  { key: "fornecedor", label: "Fornecedor", icon: Wrench },
];

const SidebarModal = ({ isOpen, onClose }: SidebarModalProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("associado");
  const [showActions, setShowActions] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] flex flex-col"
            style={{
              background: "hsl(var(--surface-glass) / 0.7)",
              backdropFilter: "blur(40px) saturate(1.8)",
              WebkitBackdropFilter: "blur(40px) saturate(1.8)",
              borderLeft: "1px solid hsl(var(--border) / 0.4)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  Área do Usuário
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse sua conta ou solicite atendimento
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 mb-6">
              <div className="flex gap-1 p-1 rounded-xl bg-muted/60 border border-border/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setShowActions(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={13} strokeWidth={1.5} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 overflow-y-auto px-8">
              <AnimatePresence mode="wait">
                {!showActions ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Login — {tabs.find((t) => t.key === activeTab)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeTab === "colaborador" &&
                          "Acesso restrito para equipe interna Grupo Win."}
                        {activeTab === "associado" &&
                          "Consulte seu contrato, sinistros e pagamentos."}
                        {activeTab === "fornecedor" &&
                          "Acompanhe ordens de serviço e repasses."}
                      </p>
                    </div>

                    <form
                      className="space-y-4"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          {activeTab === "fornecedor" ? "CNPJ ou E-mail" : "CPF ou E-mail"}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            activeTab === "fornecedor"
                              ? "00.000.000/0001-00"
                              : "000.000.000-00"
                          }
                          className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Senha
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shadow-gold"
                      >
                        <LogIn size={15} strokeWidth={1.5} />
                        Entrar
                      </button>

                      <button
                        type="button"
                        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        Esqueci minha senha
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-8">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        ou solicite
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowActions(true)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-gold-subtle bg-muted/30 hover:bg-muted/50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                          <Truck
                            size={18}
                            strokeWidth={1.5}
                            className="text-gold"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">
                            Acionar guincho
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Solicite assistência imediata 24h
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowActions(true)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-gold-subtle bg-muted/30 hover:bg-muted/50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                          <AlertTriangle
                            size={18}
                            strokeWidth={1.5}
                            className="text-gold"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">
                            Eventos danosos
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registre sinistro ou ocorrência
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => setShowActions(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 flex items-center gap-1"
                    >
                      ← Voltar ao login
                    </button>

                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Acionamento rápido
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6">
                      Selecione o tipo de atendimento necessário.
                    </p>

                    <div className="space-y-4">
                      {/* Guincho */}
                      <div className="p-5 rounded-2xl border border-border bg-muted/30">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Truck size={18} strokeWidth={1.5} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Guincho 24h</p>
                            <p className="text-xs text-muted-foreground">Pane, colisão ou atolamento</p>
                          </div>
                        </div>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                          <input
                            type="text"
                            placeholder="Número do contrato ou CPF"
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Localização atual"
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                          />
                          <select className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all appearance-none">
                            <option value="">Tipo de ocorrência</option>
                            <option value="colisao">Colisão</option>
                            <option value="pane">Pane mecânica</option>
                            <option value="atolamento">Atolamento</option>
                            <option value="outro">Outro</option>
                          </select>
                          <button
                            type="submit"
                            className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-gold"
                          >
                            Solicitar guincho
                          </button>
                        </form>
                      </div>

                      {/* Evento danoso */}
                      <div className="p-5 rounded-2xl border border-border bg-muted/30">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <AlertTriangle size={18} strokeWidth={1.5} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Evento danoso</p>
                            <p className="text-xs text-muted-foreground">Registre sinistro ou furto</p>
                          </div>
                        </div>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                          <input
                            type="text"
                            placeholder="Número do contrato ou CPF"
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                          />
                          <select className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all appearance-none">
                            <option value="">Tipo de evento</option>
                            <option value="colisao">Colisão</option>
                            <option value="roubo">Roubo</option>
                            <option value="furto">Furto</option>
                            <option value="incendio">Incêndio</option>
                            <option value="alagamento">Alagamento</option>
                            <option value="granizo">Chuva de granizo</option>
                            <option value="terceiros">Danos a terceiros</option>
                          </select>
                          <textarea
                            placeholder="Descreva o ocorrido brevemente"
                            rows={3}
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
                          />
                          <button
                            type="submit"
                            className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-gold"
                          >
                            Registrar ocorrência
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Central de atendimento 24h — 0800 000 0000
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarModal;
