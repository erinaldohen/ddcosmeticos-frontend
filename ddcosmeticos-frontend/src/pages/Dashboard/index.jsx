import { useEffect, useState } from "react";
import { db } from "@/services/db";
import {
  TrendingUp, ShoppingBag, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, Package, Wallet, Plus, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    setDados(db.getDashboardCompleto());
    const reportData = db.getDadosRelatorios();
    setGrafico(reportData.historico);
  }, []);

  if (!dados) return <div className="p-8 flex items-center gap-2 text-[#F22998]"><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div> Carregando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            {/* Título Principal Turquesa #34BFBF */}
            <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF]">Visão Geral</h1>
            <p className="text-slate-500">Resumo da operação da loja.</p>
        </div>
        <div className="flex gap-2">
            {/* Botão Vender (Sólido) */}
            <Button onClick={() => navigate("/vendas/pdv")} className="bg-[#F22998] hover:bg-[#d91e85] text-white shadow-md shadow-[#F22998]/20">
                <ShoppingBag className="mr-2 h-4 w-4"/> Vender (PDV)
            </Button>

            {/* CORREÇÃO AQUI: Botão Produto (Outline -> Hover Sólido) */}
            <Button
                variant="outline"
                onClick={() => navigate("/produtos/novo")}
                className="border-slate-200 hover:bg-[#F22998] hover:text-white hover:border-[#F22998] transition-all"
            >
                <Plus className="mr-2 h-4 w-4"/> Produto
            </Button>

            {/* CORREÇÃO AQUI: Botão Contas (Outline -> Hover Sólido) */}
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
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start z-10 relative">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendas Hoje</p>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">
                        {dados.faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                          {dados.qtdPedidosHoje} pedidos
                      </p>
                  </div>
                  <div className="p-2 bg-[#F22998]/10 rounded-lg text-[#F22998]">
                      <ShoppingBag className="h-5 w-5" />
                  </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <Area type="monotone" dataKey="vendas" stroke="#F22998" fill="#F22998" />
                      </AreaChart>
                  </ResponsiveContainer>
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
              <p className="text-xs text-slate-500 mt-2">Contas vencendo</p>
          </div>

          {/* A RECEBER */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber</p>
                      <h3 className="text-2xl font-bold text-[#F26BB5] mt-1">
                        {dados.aReceberHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-[#F26BB5]/10 rounded-lg text-[#F26BB5]">
                      <ArrowUpCircle className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Boletos e crediário</p>
          </div>

          {/* LUCRO */}
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potencial de Lucro</p>
                      <h3 className="text-2xl font-bold text-[#F22998] mt-1">
                        {dados.patrimonio.lucroPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-[#F22998]/10 rounded-lg text-[#F22998]">
                      <TrendingUp className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Margem em estoque</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 3. GRÁFICO */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#F22998]" />
                      <h3 className="font-semibold text-lg text-slate-800">Movimento da Semana</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs hover:text-[#F22998]" onClick={() => navigate("/relatorios")}>
                      Ver Completo &rarr;
                  </Button>
              </div>
              <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <defs>
                              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#F22998" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#F22998" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                          <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [`R$ ${value.toFixed(2)}`, "Vendas"]}
                          />
                          <Area type="monotone" dataKey="vendas" stroke="#F22998" strokeWidth={3} fill="url(#colorVendas)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* 4. ALERTA DE ESTOQUE */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-lg text-slate-800">Reposição</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                  {dados.baixoEstoque.length > 0 ? (
                      <div className="space-y-3">
                          {dados.baixoEstoque.map(prod => (
                              <div key={prod.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                  <div className="flex-1 min-w-0 pr-2">
                                      <p className="text-sm font-medium text-slate-800 truncate">{prod.nome}</p>
                                      <p className="text-xs text-slate-500">Restam: <strong className="text-red-600">{prod.estoque} un</strong></p>
                                  </div>
                                  <Button size="sm" variant="outline" className="h-8 text-xs bg-white hover:text-red-600" onClick={() => navigate(`/produtos/editar/${prod.id}`)}>
                                      Repor
                                  </Button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 p-4 text-center">
                          <Package className="h-10 w-10 mb-2 opacity-20" />
                          <p className="text-sm">Tudo em ordem!<br/>Estoque saudável.</p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}