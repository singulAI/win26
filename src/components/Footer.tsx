import logo from "@/assets/logo-grupowin.png";

const Footer = () => {
  return (
    <footer className="py-16 px-6 md:px-16 border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <img src={logo} alt="Grupo Win" className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Associacao de beneficios em protecao veicular. Regulamentada pelo marco legal PLP 143/2024.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Planos</p>
              <ul className="space-y-2.5">
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Essencial</a></li>
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Protecao</a></li>
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Total</a></li>
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Elite</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Segmentos</p>
              <ul className="space-y-2.5">
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Carros</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Motos</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Eletricos</a></li>
                <li><a href="#coberturas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pesados</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            2026 Grupo Win. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            CNPJ 00.000.000/0001-00 — Associacao de Protecao Veicular
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
