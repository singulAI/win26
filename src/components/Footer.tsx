import { useEffect, useState } from "react";
import logoDark from "@/assets/logo-grupowin.png";
import logoLight from "@/assets/logo-grupowin-light.png";

const Footer = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    setIsDark(document.documentElement.classList.contains("dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="py-10 sm:py-14 lg:py-16 px-5 sm:px-8 lg:px-16 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-10 lg:gap-12">
          <div className="max-w-xs">
            <img src={isDark ? logoDark : logoLight} alt="Grupo Win" className="h-6 sm:h-7 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Associação de benefícios em proteção veicular. Regulamentada pelo marco legal PLP 143/2024.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 lg:gap-16">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-2.5 sm:mb-3">Planos</p>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><a href="#planos" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Básico</a></li>
                <li><a href="#planos" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Completo</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-2.5 sm:mb-3">Segmentos</p>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><a href="#coberturas" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Carros</a></li>
                <li><a href="#coberturas" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Motos</a></li>
                <li><a href="#coberturas" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Elétricos</a></li>
                <li><a href="#coberturas" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Pesados</a></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-2.5 sm:mb-3">Redes Sociais</p>
              <ul className="flex sm:block gap-4 sm:gap-0 sm:space-y-1.5 sm:space-y-2">
                <li><a href="https://instagram.com/grupowin" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com/grupowin" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 pt-5 sm:pt-6 lg:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            © 2026 Grupo Win. Todos os direitos reservados.
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Associação de Proteção Veicular
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
