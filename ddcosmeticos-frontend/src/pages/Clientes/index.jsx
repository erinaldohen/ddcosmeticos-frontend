import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/services/db";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telefone: "", endereco: "" });
  const [modoEdicao, setModoEdicao] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    setClientes(db.getClientes());
  }, []);

  const salvarCliente = (e) => {
    e.preventDefault();
    if (modoEdicao) {
      db.atualizarCliente({ id: modoEdicao, ...novoCliente });
    } else {
      db.salvarCliente(novoCliente);
    }
    setClientes(db.getClientes());
    setNovoCliente({ nome: "", email: "", telefone: "", endereco: "" });
    setModoEdicao(null);
    setModalAberto(false);
  };

  const deletarCliente = (id) => {
    if (confirm("Deseja excluir este cliente?")) {
      db.excluirCliente(id);
      setClientes(db.getClientes());
    }
  };

  const abrirEdicao = (cliente) => {
    setNovoCliente(cliente);
    setModoEdicao(cliente.id);
    setModalAberto(true);
  };

  const filtrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Título Turquesa #34BFBF */}
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <Users className="h-8 w-8" /> Gestão de Clientes
          </h1>
          <p className="text-slate-500">Base de contatos e fidelidade.</p>
        </div>

        {/* Botão Rosa #F22998 */}
        <Button
            onClick={() => { setModoEdicao(null); setNovoCliente({ nome: "", email: "", telefone: "", endereco: "" }); setModalAberto(true); }}
            className="bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-10 border-slate-200 focus:border-[#34BFBF] focus:ring-[#34BFBF]"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium bg-[#F2F2F2] px-4 py-2 rounded-lg border border-slate-200">
            Total: <span className="text-[#34BFBF] font-bold">{clientes.length}</span>
        </div>
      </div>

      {/* MODAL DE CADASTRO (EMBUTIDO) */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                <div className="p-6 bg-[#34BFBF] text-white">
                    <h2 className="text-xl font-bold">{modoEdicao ? "Editar Cliente" : "Novo Cliente"}</h2>
                </div>
                <form onSubmit={salvarCliente} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <Input value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} required className="focus:border-[#F22998]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                            <Input value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} className="focus:border-[#F22998]"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                            <Input value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} className="focus:border-[#F22998]"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Endereço</label>
                        <Input value={novoCliente.endereco} onChange={e => setNovoCliente({...novoCliente, endereco: e.target.value})} className="focus:border-[#F22998]"/>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setModalAberto(false)} className="flex-1">Cancelar</Button>
                        <Button type="submit" className="flex-1 bg-[#F22998] hover:bg-[#d91e85] text-white font-bold">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* LISTAGEM */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtrados.map(cliente => (
            <div key={cliente.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#34BFBF]/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-[#F2F2F2] rounded-full flex items-center justify-center text-[#34BFBF] font-bold text-lg group-hover:bg-[#34BFBF] group-hover:text-white transition-colors">
                        {cliente.nome.charAt(0)}
                    </div>
                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-[#34BFBF]" onClick={() => abrirEdicao(cliente)}>
                            <Edit className="h-4 w-4"/>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deletarCliente(cliente.id)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{cliente.nome}</h3>
                <div className="space-y-2 text-sm text-slate-500 mt-4">
                    {cliente.telefone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#F26BB5]"/> {cliente.telefone}</div>}
                    {cliente.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#F26BB5]"/> {cliente.email}</div>}
                    {cliente.endereco && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#F26BB5]"/> {cliente.endereco}</div>}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}