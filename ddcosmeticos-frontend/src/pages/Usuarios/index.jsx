import { useState, useEffect } from "react";
import { Users, Edit, Trash2, Key, Shield, CheckCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para Modal de Edição (Simplificado)
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: "", role: "USER", novaSenha: "" });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get("/api/v1/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao listar usuários");
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (user) => {
    setEditando(user.id);
    setForm({ nome: user.nome || "", role: user.role, novaSenha: "" });
  };

  const salvarEdicao = async () => {
    try {
      await api.put(`/api/v1/usuarios/${editando}`, form);
      alert("✅ Usuário atualizado!");
      setEditando(null);
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#34BFBF] flex items-center gap-2">
            <Users className="h-8 w-8" /> Gestão de Usuários
          </h1>
          <p className="text-slate-500">Controle de acesso e operadores do sistema.</p>
        </div>
        <Button className="bg-[#F22998] hover:bg-[#d91e85]">
            <Plus className="mr-2 h-4 w-4"/> Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">Operador</th>
              <th className="p-4">Login</th>
              <th className="p-4">Perfil</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">
                    {editando === u.id ? (
                        <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="h-8"/>
                    ) : (
                        u.nome || "---"
                    )}
                </td>
                <td className="p-4 text-slate-500 font-mono">{u.login}</td>
                <td className="p-4">
                    {editando === u.id ? (
                        <select
                            value={form.role}
                            onChange={e => setForm({...form, role: e.target.value})}
                            className="border rounded p-1 text-xs"
                        >
                            <option value="USER">Vendedor</option>
                            <option value="ADMIN">Gerente/Admin</option>
                        </select>
                    ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {u.role === 'ADMIN' ? <Shield className="inline h-3 w-3 mr-1"/> : <Users className="inline h-3 w-3 mr-1"/>}
                            {u.role}
                        </span>
                    )}
                </td>
                <td className="p-4 text-center">
                    {u.ativo ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto"/> : <XCircle className="h-5 w-5 text-red-300 mx-auto"/>}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                    {editando === u.id ? (
                        <>
                            <Input
                                placeholder="Nova Senha (Opcional)"
                                value={form.novaSenha}
                                onChange={e => setForm({...form, novaSenha: e.target.value})}
                                className="w-32 h-8 text-xs"
                            />
                            <Button size="sm" onClick={salvarEdicao} className="h-8 bg-green-600 hover:bg-green-700">Salvar</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditando(null)} className="h-8">Cancelar</Button>
                        </>
                    ) : (
                        <Button size="sm" variant="outline" onClick={() => iniciarEdicao(u)} className="h-8 border-slate-200">
                            <Edit className="h-3 w-3 mr-1"/> Editar
                        </Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}