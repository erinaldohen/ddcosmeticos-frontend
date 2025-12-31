import { useState, useEffect } from "react";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/services/db";

export default function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [novaTransacao, setNovaTransacao] = useState({ descricao: "", valor: "", tipo: "entrada", data: "" });
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    atualizarDados();
  }, []);

  const atualizarDados = () => {
    const dados = db.getFinanceiro();
    setTransacoes(dados.sort((a,b) => new Date(b.data) - new Date(a.data)));

    const rec = dados.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor), 0);
    const desp = dados.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor), 0);
    setResumo({ receitas: rec, despesas: desp, saldo: rec - desp });
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valor) return;

    db.salvarTransacao({
        ...novaTransacao,
        valor: Number(novaTransacao.valor),
        data: novaTransacao.data || new Date().toISOString()
    });
    setNovaTransacao({ descricao: "", valor: "", tipo: "entrada", data: "" });
    atualizarDados();
  };

  const handleExcluir = (id) => {
    if(confirm("Excluir transação?")) {
        db.excluirTransacao(id);
        atualizarDados();
    }
  };

  const listaFiltrada = filtroTipo === 'todos' ? transacoes : transacoes.filter(t => t.tipo === filtroTipo);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <Wallet className="h-8 w-8" /> Financeiro
          </h1>
          <p className="text-slate-500">Controle de caixa e despesas.</p>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receitas</p>
                    <h3 className="text-2xl font-bold text-[#34BFBF] mt-1">
                        {resumo.receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="p-2 bg-[#34BFBF]/10 rounded-lg text-[#34BFBF]"><ArrowUpCircle className="h-5 w-5"/></div>
            </div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas</p>
                    <h3 className="text-2xl font-bold text-red-500 mt-1">
                        {resumo.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className="p-2 bg-red-50 rounded-lg text-red-500"><ArrowDownCircle className="h-5 w-5"/></div>
            </div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Atual</p>
                    <h3 className={`text-2xl font-bold mt-1 ${resumo.saldo >= 0 ? 'text-[#F22998]' : 'text-red-600'}`}>
                        {resumo.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </div>
                <div className={`p-2 rounded-lg ${resumo.saldo >= 0 ? 'bg-[#F22998]/10 text-[#F22998]' : 'bg-red-50 text-red-600'}`}>
                    <Wallet className="h-5 w-5"/>
                </div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORMULÁRIO */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm sticky top-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Nova Transação</h3>
                <form onSubmit={handleSalvar} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                        <Input value={novaTransacao.descricao} onChange={e => setNovaTransacao({...novaTransacao, descricao: e.target.value})} placeholder="Ex: Conta de Luz" className="focus:border-[#F22998]"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                        <Input type="number" step="0.01" value={novaTransacao.valor} onChange={e => setNovaTransacao({...novaTransacao, valor: e.target.value})} placeholder="0,00" className="focus:border-[#F22998]"/>
                    </div>
                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <button type="button" onClick={() => setNovaTransacao({...novaTransacao, tipo: 'entrada'})}
                                className={`p-2 rounded-lg text-sm font-bold border transition-all ${novaTransacao.tipo === 'entrada' ? 'bg-[#34BFBF] text-white border-[#34BFBF]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                Entrada
                            </button>
                            <button type="button" onClick={() => setNovaTransacao({...novaTransacao, tipo: 'saida'})}
                                className={`p-2 rounded-lg text-sm font-bold border transition-all ${novaTransacao.tipo === 'saida' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                Saída
                            </button>
                         </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Data (Opcional)</label>
                        <Input type="date" value={novaTransacao.data} onChange={e => setNovaTransacao({...novaTransacao, data: e.target.value})} className="focus:border-[#F22998]"/>
                    </div>
                    <Button type="submit" className="w-full bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20">
                        <Plus className="mr-2 h-4 w-4"/> Adicionar
                    </Button>
                </form>
            </div>
        </div>

        {/* LISTA DE TRANSAÇÕES */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {['todos', 'entrada', 'saida'].map(tipo => (
                    <button
                        key={tipo}
                        onClick={() => setFiltroTipo(tipo)}
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                            filtroTipo === tipo
                            ? 'bg-[#34BFBF] text-white'
                            : 'bg-white text-slate-500 border border-slate-200 hover:text-[#34BFBF]'
                        }`}
                    >
                        {tipo === 'todos' ? 'Todas' : tipo}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {listaFiltrada.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Nenhuma transação encontrada.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {listaFiltrada.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[#F2F2F2] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.tipo === 'entrada' ? 'bg-[#34BFBF]/10 text-[#34BFBF]' : 'bg-red-50 text-red-500'}`}>
                                        {item.tipo === 'entrada' ? <ArrowUpCircle className="h-5 w-5"/> : <ArrowDownCircle className="h-5 w-5"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{item.descricao}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3"/> {new Date(item.data).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold ${item.tipo === 'entrada' ? 'text-[#34BFBF]' : 'text-red-500'}`}>
                                        {item.tipo === 'saida' && '- '}{Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleExcluir(item.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}