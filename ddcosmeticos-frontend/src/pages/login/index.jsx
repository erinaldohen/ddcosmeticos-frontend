import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleLogin(e) {
    e.preventDefault(); // Impede o formulário de recarregar a página errada
    setLoading(true);

    // SIMULAÇÃO DE VALIDAÇÃO
    setTimeout(() => {
      // 1. Cria a "Chave de Segurança" no navegador
      localStorage.setItem("dd-token", "logado-com-sucesso");

      // 2. Redireciona para o Dashboard
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">

      {/* LADO ESQUERDO: Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612817288484-969196ea92bf?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/60 mix-blend-multiply"></div>

        <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/90 p-3 rounded-xl backdrop-blur-sm shadow-sm">
              <img src="/logo-ddcosmeticos.png" alt="DD Cosméticos" className="h-10 w-auto object-contain" />
            </div>
            <span className="text-xl font-bold tracking-wide">DD Cosméticos</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Realce sua beleza, <br/> Gerencie seu negócio.
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-md">
            Plataforma exclusiva para gestão de vendas e controle de estoque.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          &copy; 2025 DD Cosméticos
        </div>
      </div>

      {/* LADO DIREITO: Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background animate-in slide-in-from-right-8 duration-700">
        <div className="mx-auto w-full max-w-[380px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
             <div className="lg:hidden mx-auto mb-6 bg-primary/10 p-4 rounded-full">
               <img src="/logo-ddcosmeticos.png" alt="DD Cosméticos" className="h-12 w-auto object-contain mx-auto" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo</h1>
            <p className="text-sm text-muted-foreground">Insira suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="admin@ddcosmeticos.com"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" class="text-sm font-medium">Senha</label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Esqueceu?</a>
              </div>
              <input
                id="password"
                type="password"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" className="w-full h-11 font-bold shadow-lg" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : <>Acessar Plataforma <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}