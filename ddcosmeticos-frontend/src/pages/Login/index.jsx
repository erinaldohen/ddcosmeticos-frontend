import { useState } from "react";
import { Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import api from "@/services/api";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ login: "", senha: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.login || !form.senha) return toast.error("Preencha usuário e senha.");

    setLoading(true);
    try {
      const payload = {
          matricula: form.login.trim(),
          senha: form.senha
      };

      const { data } = await api.post("/api/v1/auth/login", payload);

      // 1. Salva o Token
      localStorage.setItem("dd-token", data.token);
      localStorage.setItem("usuario", JSON.stringify({
          nome: data.nome,
          perfil: data.perfil
      }));

      toast.success(`Bem-vindo, ${data.nome}!`);

      // 2. FORÇA O REDIRECIONAMENTO (Isso corrige o bug da tela travada)
      setTimeout(() => {
          window.location.href = "/vendas";
      }, 500);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Usuário ou senha incorretos";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <img src="/logo-ddcosmeticos.png" alt="D&D Cosméticos" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-700">Acesso ao Sistema</h1>
          <p className="text-slate-400 text-sm">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              className="pl-10 h-11"
              placeholder="Matrícula / Usuário"
              value={form.login}
              onChange={e => setForm({...form, login: e.target.value})}
              autoFocus
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="password"
              className="pl-10 h-11"
              placeholder="Senha"
              value={form.senha}
              onChange={e => setForm({...form, senha: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-[#F22998] hover:bg-[#d91e85] text-lg font-bold shadow-lg transition-all" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "ENTRAR"}
          </Button>
        </form>
      </div>
    </div>
  );
}