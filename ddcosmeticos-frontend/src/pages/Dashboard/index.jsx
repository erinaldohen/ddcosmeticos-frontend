import { useEffect, useState } from "react";
import api from "@/services/api"; // Usa a API real em vez do db.js
import {
  TrendingUp, ShoppingBag, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, Package, Wallet, Plus, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [grafico, setGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // Busca dados reais do Backend Java
        const response = await api.get("/dashboard/resumo");
        const data = response.data;

        setDados({
          faturamentoHoje: data.totalVendidoHoje || 0,
          qtdPedidosHoje: data.quantidadeVendasHoje || 0,
          aPagarHoje: data.aPagarHoje || 0,
          aReceberHoje: data.aReceberHoje || 0,
          saldoDoDia: data.saldoDoDia || 0,
          alertasEstoque: data.produtosAbaixoMinimo || 0,
          totalVencido: data.totalVencidoPagar || 0
        });

        // Adapta a projeção semanal do Java para o gráfico do React
        if (data.projecaoSemanal) {
            const chartData = data.projecaoSemanal.map(item => ({
                name: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                saldo: item.saldoPrevisto,
                entrada: item.aReceber,
                saida: item.aPagar
            }));
            setGrafico(chartData);
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setErro("Não foi possível carregar os dados do servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 flex items-center gap-2 text-[#F22998]"><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div> Carregando dados reais...</div>;

  if (erro) return <div className="p-8 text-red-500 font-bold">{erro}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF]">Visão Geral</h1>
            <p className="text-slate-500">Resumo da operação em tempo real.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate("/vendas/pdv")} className="bg-[#F22998] hover:bg-[#d91e85] text-white shadow-md shadow-[#F22998]/20">
                <ShoppingBag className="mr-2 h-4 w-4"/> Vender (PDV)
            </Button>

            <Button
                variant="outline"
                onClick={() => navigate("/produtos/novo")}
                className="border-slate-200 hover:bg-[#F22998] hover:text-white hover:border-[#F22998] transition-all"
            >
                <Plus className="mr-2 h-4 w-4"/> Produto
            </Button>

            <Button
                variant="outline"
                onClick={() => navigate("/financeiro")}
                className="border-slate-200 hover:bg-[#F22998] hover:text-white hover:border-[#F22998] transition-all"
            >
                <Wallet className="mr-2 h-4 w-4"/> Contas
            </Button>
        </div>
      </div>

      {/* 2. CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* VENDAS HOJE */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendas Hoje</p>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {dados.faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                          {dados.qtdPedidosHoje} pedidos realizados
                      </p>
                  </div>
                  <div className="p-2 bg-[#F22998]/10 rounded-lg text-[#F22998]">
                      <ShoppingBag className="h-5 w-5" />
                  </div>
              </div>
          </div>

          {/* A PAGAR */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Pagar (Hoje)</p>
                      <h3 className="text-2xl font-bold text-red-600 mt-1">
                        {dados.aPagarHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <ArrowDownCircle className="h-5 w-5" />
                  </div>
              </div>
              {dados.totalVencido > 0 && (
                 <p className="text-xs text-red-600 font-bold mt-2">! {dados.totalVencido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} vencidos</p>
              )}
          </div>

          {/* A RECEBER */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber (Hoje)</p>
                      <h3 className="text-2xl font-bold text-[#F26BB5] mt-1">
                        {dados.aReceberHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-[#F26BB5]/10 rounded-lg text-[#F26BB5]">
                      <ArrowUpCircle className="h-5 w-5" />
                  </div>
              </div>
          </div>

          {/* SALDO DO DIA */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo do Dia</p>
                      <h3 className={`text-2xl font-bold mt-1 ${dados.saldoDoDia >= 0 ? 'text-[#34BFBF]' : 'text-red-500'}`}>
                        {dados.saldoDoDia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-[#34BFBF]/10 rounded-lg text-[#34BFBF]">
                      <TrendingUp className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Vendas + Recebimentos - Pagamentos</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 3. GRÁFICO (Projeção de Caixa) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#F22998]" />
                      <h3 className="font-semibold text-lg text-slate-800">Projeção de Caixa (7 Dias)</h3>
                  </div>
              </div>
              <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <defs>
                              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#34BFBF" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#34BFBF" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                          <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [`R$ ${value.toFixed(2)}`, "Saldo Previsto"]}
                          />
                          <Area type="monotone" dataKey="saldo" stroke="#34BFBF" strokeWidth={3} fill="url(#colorSaldo)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* 4. ALERTA DE ESTOQUE (Versão Simplificada) */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-amber-50 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold text-lg text-slate-800 mb-1">Reposição Necessária</h3>

              {dados.alertasEstoque > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-slate-800 my-2">{dados.alertasEstoque}</p>
                    <p className="text-sm text-slate-500 mb-6">Produtos atingiram o estoque mínimo.</p>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/produtos")}>
                        Ver Lista de Produtos
                    </Button>
                  </>
              ) : (
                  <>
                     <p className="text-slate-500 mt-2">Tudo certo! Nenhum produto crítico.</p>
                     <Package className="h-12 w-12 text-slate-200 mt-4" />
                  </>
              )}
          </div>

      </div>
    </div>
  );
}