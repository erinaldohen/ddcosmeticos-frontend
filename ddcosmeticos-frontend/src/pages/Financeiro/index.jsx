import { useState, useEffect } from "react";
import {
  ArrowUpCircle, ArrowDownCircle, DollarSign,
  Plus, Calendar, CheckCircle2, XCircle, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("resumo"); // resumo, despesas, receitas
  const [novoItem, setNovoItem] = useState({ descricao: "", valor: "", vencimento: "", tipo: "DESPESA" });
  const [formAberto, setFormAberto] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setLancamentos(db.getFinanceiro());
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!novoItem.descricao || !novoItem.valor) return;

    db.salvarLancamento({
        ...novoItem,
        valor: Number(novoItem.valor.replace(',', '.'))
    });

    setNovoItem({ descricao: "", valor: "", vencimento: "", tipo: "DESPESA" });
    setFormAberto(false);
    carregarDados();
  };

  const toggleStatus = (id) => {
    db.atualizarStatusFinanceiro(id);
    carregarDados();
  };

  const excluir = (id) => {
    if(confirm("Excluir este lançamento?")) {
        db.removerLancamento(id);
        carregarDados();
    }
  };

  // Cálculos
  const totalReceitas = lancamentos.filter(l => l.tipo === 'RECEITA').reduce((acc, l) => acc + l.valor, 0);
  const totalDespesas = lancamentos.filter(l => l.tipo === 'DESPESA').reduce((acc, l) => acc + l.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  // Filtragem por Aba
  const listaExibicao = abaAtiva === 'resumo'
    ? lancamentos
    : lancamentos.filter(l => l.tipo === (abaAtiva === 'receitas' ? 'RECEITA' : 'DESPESA'));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <DollarSign className="h-8 w-8" /> Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">Controle de Contas a Pagar e Receber.</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button onClick={() => setAbaAtiva("resumo")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${abaAtiva === 'resumo' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Visão Geral</button>
            <button onClick={() => setAbaAtiva("despesas")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${abaAtiva === 'despesas' ? 'bg-white shadow-sm text-red-600' : 'text-muted-foreground hover:text-foreground'}`}>A Pagar</button>
            <button onClick={() => setAbaAtiva("receitas")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${abaAtiva === 'receitas' ? 'bg-white shadow-sm text-emerald-600' : 'text-muted-foreground hover:text-foreground'}`}>A Receber</button>
        </div>
      </div>

      {/* Cards de Totais */}
      {abaAtiva === 'resumo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                    <h2 className="text-2xl font-bold text-emerald-600">R$ {totalReceitas.toFixed(2)}</h2>
                </div>
                <ArrowUpCircle className="h-10 w-10 text-emerald-100 bg-emerald-600 rounded-full p-2" />
            </div>
            <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Saídas</p>
                    <h2 className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</h2>
                </div>
                <ArrowDownCircle className="h-10 w-10 text-red-100 bg-red-600 rounded-full p-2" />
            </div>
            <div className={`bg-card p-6 rounded-xl border shadow-sm flex items-center justify-between ${saldo >= 0 ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Saldo Previsto</p>
                    <h2 className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>R$ {saldo.toFixed(2)}</h2>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
            </div>
        </div>
      )}

      {/* Botão Novo Lançamento */}
      <div className="flex justify-end">
        <Button onClick={() => setFormAberto(!formAberto)} className={formAberto ? "bg-red-500 hover:bg-red-600" : ""}>
            {formAberto ? <><XCircle className="mr-2 h-4 w-4"/> Cancelar</> : <><Plus className="mr-2 h-4 w-4"/> Novo Lançamento</>}
        </Button>
      </div>

      {/* Formulário Rápido */}
      {formAberto && (
        <form onSubmit={handleSalvar} className="bg-card border p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top-2">
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold">Descrição</label>
                <input required placeholder="Ex: Conta de Luz" className="w-full h-9 px-3 rounded-md border text-sm"
                    value={novoItem.descricao} onChange={e => setNovoItem({...novoItem, descricao: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold">Valor (R$)</label>
                <input required placeholder="0,00" className="w-full h-9 px-3 rounded-md border text-sm"
                    value={novoItem.valor} onChange={e => setNovoItem({...novoItem, valor: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold">Tipo</label>
                <select className="w-full h-9 px-3 rounded-md border text-sm"
                    value={novoItem.tipo} onChange={e => setNovoItem({...novoItem, tipo: e.target.value})}>
                    <option value="DESPESA">Saída (Pagar)</option>
                    <option value="RECEITA">Entrada (Receber)</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-semibold">Vencimento</label>
                <input type="date" className="w-full h-9 px-3 rounded-md border text-sm"
                    value={novoItem.vencimento} onChange={e => setNovoItem({...novoItem, vencimento: e.target.value})} />
            </div>
            <Button type="submit" className="w-full h-9 font-bold bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
        </form>
      )}

      {/* Tabela de Lançamentos */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
                <tr>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Data</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Descrição</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Categoria</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Valor</th>
                    <th className="h-10 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {listaExibicao.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                        <td className="p-4 flex items-center gap-2">
                            {item.tipo === 'RECEITA' ? <ArrowUpCircle className="h-4 w-4 text-emerald-500"/> : <ArrowDownCircle className="h-4 w-4 text-red-500"/>}
                            {item.vencimento ? new Date(item.vencimento).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="p-4 font-medium">{item.descricao}</td>
                        <td className="p-4 text-muted-foreground">{item.categoria || 'Geral'}</td>
                        <td className={`p-4 font-bold ${item.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-4">
                            <button onClick={() => toggleStatus(item.id)}
                                className={`px-2 py-1 rounded-full text-xs font-bold border transition-all
                                ${item.status === 'PAGO'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'}`}>
                                {item.status === 'PAGO' ? 'CONCLUÍDO' : 'PENDENTE'}
                            </button>
                        </td>
                        <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => excluir(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {listaExibicao.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nenhum lançamento encontrado.</div>
        )}
      </div>
    </div>
  );
}