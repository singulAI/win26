import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, FileSearch, UserCheck, Car, AlertTriangle,
  Truck, Receipt, Mic, Paperclip, ChevronRight, ScanLine
} from "lucide-react";
import winIcon from "@/assets/icon-win.png";

const quickActions = [
  {
    icon: Receipt,
    label: "Cotação",
    desc: "Simular proteção veicular",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: AlertTriangle,
    label: "Emergência",
    desc: "Acionamento imediato",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Car,
    label: "Terceiros",
    desc: "Gestão de terceiros",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Truck,
    label: "Fornecedores",
    desc: "Rede credenciada",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: ScanLine,
    label: "OCR",
    desc: "Leitura de documentos",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: UserCheck,
    label: "Associado",
    desc: "Reconhecer por CPF/placa",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

type Message = { role: "user" | "assistant"; content: string };

const mockConversation: Message[] = [
  { role: "assistant", content: "Olá! Sou a IA do Grupo Win. Como posso ajudar?" },
];

const AIAssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "chat">("menu");
  const [messages, setMessages] = useState(mockConversation);
  const [input, setInput] = useState("");

  const handleActionClick = (label: string) => {
    setActiveView("chat");
    setMessages([
      ...mockConversation,
      { role: "user" as const, content: `Quero ajuda com: ${label}` },
      {
        role: "assistant" as const,
        content: `Entendi! Vou ajudar com **${label}**. Por favor, informe o CPF ou placa do associado para iniciarmos.`,
      },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input },
      {
        role: "assistant" as const,
        content: "Processando sua solicitação... (demonstração do modelo de IA)",
      },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-lg hover:shadow-gold transition-shadow duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir assistente IA"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} className="text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/20 pointer-events-none" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[70vh] rounded-2xl border border-border overflow-hidden flex flex-col"
            style={{
              background: "hsl(var(--background) / 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 25px 60px -12px hsl(var(--gold) / 0.15), 0 0 0 1px hsl(var(--border) / 0.5)",
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center">
                  <Sparkles size={16} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Win AI</p>
                  <p className="text-[10px] text-muted-foreground">Assistente inteligente</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-medium">Online</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeView === "menu" ? (
                <div className="p-5 space-y-4">
                  {/* Capabilities */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">
                      Funcionalidades
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleActionClick(action.label)}
                          className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                            <action.icon size={14} className={action.color} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground">{action.label}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Features bar */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
                    <FileSearch size={14} className="text-muted-foreground shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      Leitura OCR • Reconhecimento de associado • Auto-preenchimento • Histórico contextual
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setActiveView("chat")}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary" />
                      <span className="text-xs font-medium text-foreground">Iniciar conversa livre</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setActiveView("menu");
                      setMessages(mockConversation);
                    }}
                    className="px-5 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left flex items-center gap-1"
                  >
                    ← Voltar ao menu
                  </button>

                  {/* Messages */}
                  <div className="flex-1 px-5 pb-3 space-y-3 overflow-y-auto">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar (always visible) */}
            <div className="px-4 py-3 border-t border-border/50 shrink-0">
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-muted/50 border border-border/50">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors" aria-label="Anexar arquivo">
                  <Paperclip size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors" aria-label="Áudio">
                  <Mic size={14} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  onFocus={() => activeView === "menu" && setActiveView("chat")}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={handleSend}
                  className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
                  aria-label="Enviar"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantPanel;
