import logo from "@/assets/logo-grupowin.png";

const Footer = () => {
  return (
    <footer className="py-16 px-6 md:px-16 border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <img src={logo} alt="Grupo Win" className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Associação de benefícios em proteção veicular. Regulamentada pelo marco legal PLP 143/2024.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Planos</p>
              <ul className="space-y-2.5">
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Básico</a></li>
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Completo</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Segmentos</p>
              <ul className="space-y-2.5">
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Carros</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Motos</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Elétricos</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pesados</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Redes Sociais</p>
              <ul className="space-y-2.5">
                <li><a href="https://instagram.com/grupowin" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com/grupowin" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            2026 Grupo Win. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Associação de Proteção Veicular
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
