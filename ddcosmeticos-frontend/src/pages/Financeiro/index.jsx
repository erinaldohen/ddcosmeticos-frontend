import { useState, useEffect } from "react";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import api from "@/services/api";

export default function Financeiro() {
  const [loading, setLoading] = useState(false);
  const [dataFechamento, setDataFechamento] = useState(new Date().toISOString().split('T')[0]);

  // Resumo vindo do Backend (FechamentoCaixaDTO)
  const [resumo, setResumo] = useState(null);

  // Nova movimentação manual (Sangria/Suprimento)
  const [novaMov, setNovaMov] = useState({ valor: "", tipo: "SANGRIA", motivo: "" });

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Chama o endpoint que criamos no CaixaController
      const { data } = await api.get(`/api/v1/caixa/fechamento?data=${dataFechamento}`);
      setResumo(data);
    } catch (error) {
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataFechamento]);

  const handleMovimentacaoManual = async (e) => {
    e.preventDefault();
    if (!novaMov.valor || !novaMov.motivo) return toast.error("Preencha valor e motivo.");

    try {
      const payload = {
        valor: Number(novaMov.valor),
        tipo: novaMov.tipo, // SANGRIA ou SUPRIMENTO (Enum no backend)
        motivo: novaMov.motivo
      };

      await api.post("/api/v1/caixa/movimentacao", payload);
      toast.success("Movimentação registrada!");
      setNovaMov({ valor: "", tipo: "SANGRIA", motivo: "" });
      carregarDados(); // Recarrega saldo
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar movimentação.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">

      {/* HEADER E FILTRO DE DATA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#34BFBF] flex items-center gap-2">
            <Wallet className="h-6 w-6" /> Fluxo de Caixa
          </h1>
          <p className="text-slate-500 text-sm">Controle diário de entradas e saídas.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-600">Data:</span>
            <Input
                type="date"
                value={dataFechamento}
                onChange={e => setDataFechamento(e.target.value)}
                className="w-40"
            />
            <Button size="icon" variant="ghost" onClick={carregarDados} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
            </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO (Dados Reais do Backend) */}
      {resumo && (
        <div className="grid gap-4 md:grid-cols-4">
            <CardResumo
                titulo="Total Vendas (Bruto)"
                valor={resumo.totalVendasBruto}
                icone={<ArrowUpCircle className="text-[#34BFBF]"/>}
                cor="text-[#34BFBF]" bg="bg-[#34BFBF]/10"
            />
            <CardResumo
                titulo="Total Sangrias/Saídas"
                valor={resumo.totalSangrias}
                icone={<ArrowDownCircle className="text-red-500"/>}
                cor="text-red-500" bg="bg-red-50"
            />
            <CardResumo
                titulo="Saldo em Dinheiro (Gaveta)"
                valor={resumo.saldoFinalDinheiroEmEspecie}
                icone={<Wallet className="text-[#F22998]"/>}
                cor="text-[#F22998]" bg="bg-[#F22998]/10"
                destaque
            />
             <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Qtd Vendas</p>
                <p className="text-2xl font-bold text-slate-700">{resumo.quantidadeVendas}</p>
            </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORMULÁRIO DE LANÇAMENTO MANUAL (Sangria/Suprimento) */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm sticky top-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Movimentação Manual</h3>
                <form onSubmit={handleMovimentacaoManual} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button type="button" onClick={() => setNovaMov({...novaMov, tipo: 'SUPRIMENTO'})}
                                className={`p-2 rounded-lg text-xs font-bold border transition-all ${novaMov.tipo === 'SUPRIMENTO' ? 'bg-[#34BFBF] text-white border-[#34BFBF]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                SUPRIMENTO (Entrada)
                            </button>
                            <button type="button" onClick={() => setNovaMov({...novaMov, tipo: 'SANGRIA'})}
                                className={`p-2 rounded-lg text-xs font-bold border transition-all ${novaMov.tipo === 'SANGRIA' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                SANGRIA (Saída)
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                        <Input
                            type="number" step="0.01"
                            value={novaMov.valor}
                            onChange={e => setNovaMov({...novaMov, valor: e.target.value})}
                            placeholder="0,00"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Motivo</label>
                        <Input
                            value={novaMov.motivo}
                            onChange={e => setNovaMov({...novaMov, motivo: e.target.value})}
                            placeholder="Ex: Pagamento de Fornecedor / Troco"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold">
                        <Plus className="mr-2 h-4 w-4"/> Registrar
                    </Button>
                </form>
            </div>
        </div>

        {/* DETALHAMENTO POR FORMA DE PAGAMENTO */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Detalhamento por Forma de Pagamento</h3>
                {resumo && resumo.totaisPorFormaPagamento && (
                    <div className="space-y-3">
                        {Object.entries(resumo.totaisPorFormaPagamento).map(([forma, valor]) => (
                            <div key={forma} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-bold text-slate-600">{forma}</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
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

function CardResumo({ titulo, valor, icone, cor, bg, destaque }) {
    return (
        <div className={`p-5 bg-white rounded-xl border ${destaque ? 'border-[#F22998]/50 ring-1 ring-[#F22998]/20' : 'border-slate-100'} shadow-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{titulo}</p>
                    <h3 className={`text-xl font-bold mt-1 ${cor}`}>
                        {valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                    </h3>
                </div>
                <div className={`p-2 rounded-lg ${bg}`}>{icone}</div>
            </div>
        </div>
    );
}