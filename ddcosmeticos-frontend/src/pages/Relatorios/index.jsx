import { useState, useEffect } from "react";
import {
  BarChart3, Calendar, Download, TrendingUp,
  DollarSign, PackageCheck, CreditCard, Loader2,
  PieChart, AlertCircle, ArrowUpRight, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

export default function Relatorios() {
  // Estados de data com atalhos
  const [dataInicio, setDataInicio] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    faturamentoTotal: 0,
    totalVendasRealizadas: 0,
    ticketMedio: 0,
    produtosMaisVendidos: [],
    vendasPorPagamento: []
  });

  const carregarRelatorio = async (inicio = dataInicio, fim = dataFim) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/relatorios/vendas?inicio=${inicio}&fim=${fim}`);
      setDados(res.data);
    } catch (error) {
      console.error("Erro ao carregar dados do relatório", error);
    } finally {
      setLoading(false);
    }
  };

  // Atalhos de Período
  const aplicarAtalho = (tipo) => {
    const hoje = new Date();
    let inicio = new Date();

    if (tipo === '7dias') inicio.setDate(hoje.getDate() - 7);
    if (tipo === 'mes') inicio.setDate(1);
    if (tipo === 'ontem') {
      inicio.setDate(hoje.getDate() - 1);
      hoje.setDate(hoje.getDate() - 1);
    }

    const strInicio = inicio.toISOString().split('T')[0];
    const strFim = hoje.toISOString().split('T')[0];

    setDataInicio(strInicio);
    setDataFim(strFim);
    carregarRelatorio(strInicio, strFim);
  };

  useEffect(() => { carregarRelatorio(); }, []);

  // Lógica para Curva ABC (Frontend)
  const produtosComParticipacao = dados.produtosMaisVendidos.map((p, idx, arr) => {
    const totalGeral = arr.reduce((acc, curr) => acc + curr.total, 0);
    const participacao = (p.total / totalGeral) * 100;

    // Calcula acumulado para definir Classe A (80%), B (15%), C (5%)
    let acumulado = 0;
    for(let i = 0; i <= idx; i++) acumulado += (arr[i].total / totalGeral) * 100;

    let classe = 'C';
    if (acumulado <= 80) classe = 'A';
    else if (acumulado <= 95) classe = 'B';

    return { ...p, participacao, classe };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. HEADER ANALÍTICO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-[#34BFBF]" /> Inteligência de Vendas
          </h1>
          <p className="text-slate-500 font-medium">Análise de performance e lucratividade.</p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="xs" className="text-[10px] h-7" onClick={() => aplicarAtalho('ontem')}>Ontem</Button>
            <Button variant="outline" size="xs" className="text-[10px] h-7" onClick={() => aplicarAtalho('7dias')}>7 Dias</Button>
            <Button variant="outline" size="xs" className="text-[10px] h-7" onClick={() => aplicarAtalho('mes')}>Este Mês</Button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border-none bg-transparent focus-visible:ring-0 w-32 h-8 text-xs font-bold"
            />
            <span className="text-slate-400 text-xs font-bold">➜</span>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border-none bg-transparent focus-visible:ring-0 w-32 h-8 text-xs font-bold"
            />
            <Button onClick={() => carregarRelatorio()} size="sm" className="bg-[#34BFBF] hover:bg-[#2aa8a8] rounded-lg h-8 px-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analisar"}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPIS DE PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardKpi
          label="Faturamento Bruto"
          valor={dados.faturamentoTotal}
          icon={<DollarSign />}
          color="text-emerald-600"
          bg="bg-emerald-50"
          isMoeda
        />
        <CardKpi
          label="Volume de Pedidos"
          valor={dados.totalVendasRealizadas}
          icon={<PackageCheck />}
          color="text-[#F26BB5]"
          bg="bg-pink-50"
        />
        <CardKpi
          label="Ticket Médio"
          valor={dados.ticketMedio}
          icon={<TrendingUp />}
          color="text-blue-600"
          bg="bg-blue-50"
          isMoeda
        />
        <CardKpi
          label="Margem Estimada"
          valor={32.5} // Valor exemplo, pode vir do backend
          icon={<Percent />}
          color="text-purple-600"
          bg="bg-purple-50"
          isPercent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3. CURVA ABC DE PRODUTOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-slate-800">Ranking Curva ABC</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Classificação por impacto no faturamento</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[#34BFBF] text-xs font-bold">
                  <Download className="h-3 w-3 mr-1"/> Exportar Dados
              </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                    <tr>
                        <th className="px-6 py-4 text-left">Produto</th>
                        <th className="px-6 py-4 text-center">Classe</th>
                        <th className="px-6 py-4 text-center">Part. %</th>
                        <th className="px-6 py-4 text-right">Total Gerado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {produtosComParticipacao.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700">{p.nome}</div>
                              <div className="text-[10px] text-slate-400 font-medium">Cód: {p.codigo || '---'}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`
                                  px-3 py-1 rounded-full text-[10px] font-black
                                  ${p.classe === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                    p.classe === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
                                `}>
                                    CLASSE {p.classe}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-slate-500">
                                {p.participacao.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800">
                                R$ {p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>

        {/* 4. PERFORMANCE POR CANAL / PAGAMENTO */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#34BFBF]" /> Mix de Recebimento
              </h3>
              <div className="space-y-5">
                  {dados.vendasPorPagamento.map((pag, idx) => (
                      <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-end">
                              <span className="text-[11px] font-black text-slate-500 uppercase">{pag.forma}</span>
                              <span className="text-xs font-black text-slate-800">R$ {pag.total.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full">
                              <div
                                  className="bg-[#34BFBF] h-full rounded-full transition-all duration-700"
                                  style={{ width: `${(pag.total / (dados.faturamentoTotal || 1)) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* ALERTA DE INSIGHT */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-[#34BFBF]" />
                  </div>
                  <h4 className="font-bold text-sm">Insight do Período</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Os produtos de <strong>Classe A</strong> representam {produtosComParticipacao.filter(p => p.classe === 'A').length} itens do seu catálogo, mas geram 80% da sua receita.
                <span className="block mt-2 text-[#34BFBF]">Dica: Garanta que estes itens nunca fiquem sem estoque.</span>
              </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente de Card Refinado
function CardKpi({ label, valor, icon, color, bg, isMoeda, isPercent }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-[#34BFBF]/30 transition-all group">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800">
          {isMoeda ? `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
           isPercent ? `${valor}%` : valor}
        </p>
      </div>
    </div>
  );
}