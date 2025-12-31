import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2, LogIn, AlertTriangle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@dd.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        await login(email, password);
        navigate("/dashboard");
    } catch (err) {
        setError("Acesso negado: Verifique suas credenciais.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] p-4 relative overflow-hidden">

      {/* Detalhe de fundo agora em Turquesa #34BFBF */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#34BFBF]/10 -skew-y-3 origin-top transform -z-10"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* CABEÇALHO */}
        <div className="pt-10 pb-6 text-center px-8">
            {/* Logo Box Turquesa */}
            <div className="h-16 w-16 bg-[#34BFBF] rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-[#34BFBF]/30 mb-6">
                <span className="text-3xl font-bold text-white">D</span>
            </div>
            {/* Título Principal "DD" em Turquesa */}
            <h1 className="text-2xl font-bold text-[#34BFBF] tracking-tight">DD <span className="text-[#F26BB5]">Cosméticos</span></h1>
            <p className="text-slate-500 mt-2 text-sm">Faça login para acessar o painel administrativo.</p>
        </div>

        {/* Formulário */}
        <div className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                        <AlertTriangle className="h-4 w-4"/> {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold text-xs uppercase tracking-wide">E-mail</Label>
                    <div className="relative group">
                        {/* Foco em Turquesa */}
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-[#34BFBF] transition-colors" />
                        <Input
                            type="email"
                            className="pl-10 h-11 border-slate-200 focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="text-slate-700 font-semibold text-xs uppercase tracking-wide">Senha</Label>
                        <a href="#" className="text-xs text-[#F26BB5] hover:underline">Esqueceu a senha?</a>
                    </div>
                    <div className="relative group">
                        {/* Foco em Turquesa */}
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-[#34BFBF] transition-colors" />
                        <Input
                            type="password"
                            className="pl-10 h-11 border-slate-200 focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                            placeholder="••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Botão Principal Turquesa */}
                <Button className="w-full bg-[#34BFBF] hover:bg-[#2aa8a8] h-12 text-base font-bold shadow-lg shadow-[#34BFBF]/30 transition-all active:scale-95 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Acessar Sistema <LogIn className="h-4 w-4"/></span>}
                </Button>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                    Ambiente Seguro • Versão 1.0.0<br/>
                    Credenciais padrão: <strong>admin@dd.com</strong> / <strong>123456</strong>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}