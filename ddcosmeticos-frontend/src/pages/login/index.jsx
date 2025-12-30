import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">

      {/* Lado Esquerdo: Branding e Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative overflow-hidden">
        {/* Imagem de fundo misturada */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612817288484-969196ea92bf?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/60 mix-blend-multiply"></div>

        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
            {/* LOGO DESKTOP */}
            <div className="bg-white/90 p-3 rounded-xl backdrop-blur-sm shadow-sm">
              <img
                src="/logo-ddcosmeticos.png"
                alt="DD Cosméticos"
                className="h-12 w-auto object-contain"
              />
            </div>
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

            {/* LOGO MOBILE (Só aparece em telas pequenas) */}
            <div className="lg:hidden mx-auto mb-4">
               <img
                 src="/logo-ddcosmeticos.png"
                 alt="DD Cosméticos"
                 className="h-16 w-auto object-contain mx-auto"
               />
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
              <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
              <input
                id="email"
                placeholder="nome@exemplo.com"
                type="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" class="text-sm font-medium leading-none">Senha</label>
                <a href="#" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <input
                id="password"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button className="w-full font-bold shadow-md hover:brightness-110 transition-all">
              <Link to="/dashboard" className="w-full flex items-center justify-center gap-2">
                Entrar na Plataforma <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}