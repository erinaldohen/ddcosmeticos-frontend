import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // <--- O Poder do React Query
import api from "@/services/api";
import { formatarMoeda, formatarDataCurta } from "@/lib/formatters"; // <--- Nossos formatadores
import {
  TrendingUp, ShoppingBag, AlertTriangle, ArrowDownCircle,
  ArrowUpCircle, Package, Wallet, BarChart3, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  // --- BUSCA DE DADOS OTIMIZADA ---
  // A chave ['dashboard-resumo'] identifica este pedido no cache.
  const { data: dados, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: async () => {
      const response = await api.get("/api/v1/dashboard/resumo");
      return response.data;
    },
    // Transforma os dados antes de entregar ao componente (evita lógica no JSX)
    select: (data) => ({
      faturamentoHoje: data.totalVendidoHoje || 0,
      qtdPedidosHoje: data.quantidadeVendasHoje || 0,
      aPagarHoje: data.aPagarHoje || 0,
      aReceberHoje: data.aReceberHoje || 0,
      saldoDoDia: data.saldoDoDia || 0,
      alertasEstoque: data.produtosAbaixoMinimo || 0,
      totalVencido: data.totalVencidoPagar || 0,
      grafico: (data.projecaoSemanal || []).map(item => ({
        name: formatarDataCurta(item.data),
        saldo: item.saldoPrevisto || 0,
        entrada: item.aReceber || 0,
        saida: item.aPagar || 0
      }))
    })
  });

  // --- RENDERIZAÇÃO DE ESTADOS ---

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4 animate-in fade-in">
      <div className="animate-spin h-10 w-10 border-4 border-[#34BFBF] border-t-transparent rounded-full"></div>
      <p className="text-slate-500 font-medium tracking-wide">Carregando indicadores...</p>
    </div>
  );

  if (isError) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <p className="text-red-500 font-bold">Falha ao carregar indicadores.</p>
      <Button onClick={() => refetch()}>Tentar Novamente</Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Olá, <span className="text-[#34BFBF]">Administrador</span>
            </h1>
            <p className="text-slate-500">
                Visão geral da operação em {new Date().toLocaleDateString('pt-BR')}.
            </p>
        </div>
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className={isRefetching ? "animate-spin" : ""}
                title="Atualizar dados"
            >
                <RefreshCw className="h-4 w-4 text-slate-400" />
            </Button>

            <Button onClick={() => navigate("/vendas/pdv")} className="bg-[#F22998] hover:bg-[#d91e85] text-white shadow-lg shadow-[#F22998]/20">
                <ShoppingBag className="mr-2 h-4 w-4"/> Frente de Caixa (PDV)
            </Button>

            <Button variant="outline" onClick={() => navigate("/financeiro")} className="border-slate-200 hover:border-[#34BFBF] hover:text-[#34BFBF]">
                <Wallet className="mr-2 h-4 w-4"/> Financeiro
            </Button>
        </div>
      </div>

      {/* 2. CARDS PRINCIPAIS (KPIs) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* VENDAS HOJE */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faturamento Hoje</p>
                      <h3 className="text-2xl font-black text-slate-800">
                        {formatarMoeda(dados.faturamentoHoje)}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                          {dados.qtdPedidosHoje} vendas realizadas
                      </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-6 w-6" />
                  </div>
              </div>
          </div>

          {/* A PAGAR */}
          <div className={`group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 ${dados.totalVencido > 0 ? 'border-l-red-500' : 'border-l-slate-200'} flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contas a Pagar (Hoje)</p>
                      <h3 className="text-2xl font-black text-red-600">
                        {formatarMoeda(dados.aPagarHoje)}
                      </h3>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-red-600">
                      <ArrowDownCircle className="h-6 w-6" />
                  </div>
              </div>
              {dados.totalVencido > 0 && (
                 <div className="mt-4 px-2 py-1 bg-red-50 rounded-md flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-[10px] text-red-600 font-black uppercase">
                        {formatarMoeda(dados.totalVencido)} VENCIDOS
                    </span>
                 </div>
              )}
          </div>

          {/* A RECEBER */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A Receber (Hoje)</p>
                      <h3 className="text-2xl font-black text-[#F26BB5]">
                        {formatarMoeda(dados.aReceberHoje)}
                      </h3>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-xl text-[#F26BB5]">
                      <ArrowUpCircle className="h-6 w-6" />
                  </div>
              </div>
          </div>

          {/* SALDO DO DIA */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Previsto</p>
                      <h3 className={`text-2xl font-black ${dados.saldoDoDia >= 0 ? 'text-[#34BFBF]' : 'text-red-500'}`}>
                        {formatarMoeda(dados.saldoDoDia)}
                      </h3>
                  </div>
                  <div className="p-3 bg-[#34BFBF]/10 rounded-xl text-[#34BFBF]">
                      <TrendingUp className="h-6 w-6" />
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase">Liquidez diária</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 3. GRÁFICO (Projeção de Caixa) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">Fluxo de Caixa Semanal</h3>
                        <p className="text-xs text-slate-400 font-medium">Projeção de Entradas vs Saídas</p>
                      </div>
                  </div>
              </div>

              <div className="h-[300px] w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dados.grafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#34BFBF" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#34BFBF" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            fontSize={11}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            stroke="#94a3b8"
                            dy={10}
                          />
                          <YAxis
                            fontSize={11}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            stroke="#94a3b8"
                          />
                          <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [formatarMoeda(value), ""]}
                          />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />

                          <Area type="monotone" name="Saldo" dataKey="saldo" stroke="#34BFBF" strokeWidth={3} fill="url(#colorSaldo)" />
                          <Area type="monotone" name="Receitas" dataKey="entrada" stroke="#F26BB5" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                          <Area type="monotone" name="Despesas" dataKey="saida" stroke="#f87171" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* 4. ALERTAS DE ESTOQUE */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
              <div className={`p-5 rounded-3xl mb-4 ${dados.alertasEstoque > 0 ? 'bg-amber-50 animate-pulse' : 'bg-slate-50'}`}>
                  <AlertTriangle className={`h-10 w-10 ${dados.alertasEstoque > 0 ? 'text-amber-500' : 'text-slate-200'}`} />
              </div>
              <h3 className="font-bold text-xl text-slate-800">Estoque Crítico</h3>

              {dados.alertasEstoque > 0 ? (
                  <>
                    <div className="my-4">
                        <span className="text-5xl font-black text-slate-800">{dados.alertasEstoque}</span>
                        <span className="text-slate-400 font-bold ml-2 uppercase text-xs tracking-widest">Produtos</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-8 px-4 font-medium leading-relaxed">
                        Existem produtos que atingiram ou estão abaixo do estoque mínimo.
                    </p>
                    <Button
                        onClick={() => navigate("/produtos")}
                        className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold shadow-lg"
                    >
                        Gerenciar Reposição
                    </Button>
                  </>
              ) : (
                  <div className="mt-4">
                     <p className="text-slate-400 font-medium">Nenhum alerta de estoque.<br/>Operação estável.</p>
                     <Package className="h-16 w-16 text-slate-50 mx-auto mt-6" />
                  </div>
              )}
          </div>

      </div>
    </div>
  );
}