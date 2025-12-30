import { Package2, ArrowRight } from "lucide-react"; // Usando ícone genérico enquanto não implementamos a img real
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">

      {/* Lado Esquerdo: Branding e Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative overflow-hidden">
        {/* Efeito de fundo sutil */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612817288484-969196ea92bf?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/60 mix-blend-multiply"></div>

        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
            {/* Aqui entraria a imagem da logo branca, se tiver. Por enquanto, texto estilizado */}
            <div className="bg-white text-primary p-1 rounded font-serif text-xl">DD</div>
            <span>DD Cosméticos</span>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Realce sua beleza, <br/> Gerencie seu negócio.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Plataforma exclusiva para gestão de vendas e produtos.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          &copy; 2025 DD Cosméticos. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            {/* Logo visível apenas no Mobile */}
            <div className="lg:hidden mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
              DD
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <input
                id="email"
                placeholder="nome@exemplo.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" class="text-sm font-medium leading-none">
                  Senha
                </label>
                <a href="#" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <input
                id="password"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Botão Principal com a cor Primária (Turquesa) */}
            <Button className="w-full font-bold shadow-md hover:brightness-110 transition-all">
              <Link to="/dashboard" className="w-full flex items-center justify-center gap-2">
                Entrar na Plataforma <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button">
             Google (Em breve)
          </Button>
        </div>
      </div>
    </div>
  );
}