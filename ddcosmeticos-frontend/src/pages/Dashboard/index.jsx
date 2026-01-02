import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  TrendingUp, ShoppingBag, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, Package, Wallet, Plus, BarChart3, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [grafico, setGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get("/api/v1/dashboard/resumo");
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

      if (data.projecaoSemanal) {
        const chartData = data.projecaoSemanal.map(item => ({
          name: new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
          saldo: item.saldoPrevisto,
          entrada: item.aReceber,
          saida: item.aPagar
        }));
        setGrafico(chartData);
      }
      setErro(null);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setErro("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-[#34BFBF] border-t-transparent rounded-full"></div>
      <p className="text-slate-500 font-medium tracking-wide">Sincronizando com a DD Cosméticos...</p>
    </div>
  );

  if (erro) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <p className="text-red-500 font-bold">{erro}</p>
      <Button onClick={() => fetchDashboard()}>Tentar Novamente</Button>
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
            <p className="text-slate-500">Resumo da operação em {new Date().toLocaleDateString('pt-BR')}.</p>
        </div>
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchDashboard(true)}
                className={refreshing ? "animate-spin" : ""}
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

      {/* 2. CARDS PRINCIPAIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* VENDAS HOJE */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faturamento Hoje</p>
                      <h3 className="text-2xl font-black text-slate-800">
                        {dados.faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                          {dados.qtdPedidosHoje} vendas processadas
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compromissos (Hoje)</p>
                      <h3 className="text-2xl font-black text-red-600">
                        {dados.aPagarHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-red-600">
                      <ArrowDownCircle className="h-6 w-6" />
                  </div>
              </div>
              {dados.totalVencido > 0 && (
                 <div className="mt-4 px-2 py-1 bg-red-50 rounded-md flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-[10px] text-red-600 font-black uppercase">
                        {dados.totalVencido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} VENCIDOS
                    </span>
                 </div>
              )}
          </div>

          {/* A RECEBER */}
          <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previsão Recebimento</p>
                      <h3 className="text-2xl font-black text-[#F26BB5]">
                        {dados.aReceberHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                        {dados.saldoDoDia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

          {/* 3. GRÁFICO (Projeção de Caixa Avançado) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">Fluxo de Caixa Semanal</h3>
                        <p className="text-xs text-slate-400 font-medium">Previsão baseada em Contas a Pagar e Receber</p>
                      </div>
                  </div>
              </div>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <defs>
                              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#34BFBF" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#34BFBF" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} stroke="#94a3b8" dy={10} />
                          <YAxis fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} stroke="#94a3b8" />
                          <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [`R$ ${value.toLocaleString()}`, ""]}
                          />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                          <Area type="monotone" name="Saldo Acumulado" dataKey="saldo" stroke="#34BFBF" strokeWidth={3} fill="url(#colorSaldo)" />
                          <Area type="monotone" name="Entradas" dataKey="entrada" stroke="#F26BB5" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                          <Area type="monotone" name="Saídas" dataKey="saida" stroke="#f87171" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* 4. REPOSIÇÃO DE ESTOQUE */}
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
                        Existem produtos que atingiram ou ultrapassaram o estoque de segurança.
                    </p>
                    <Button
                        onClick={() => navigate("/produtos")}
                        className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold"
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