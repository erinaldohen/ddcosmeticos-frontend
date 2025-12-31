import { useEffect, useState } from "react";
import { db } from "@/services/db";
import {
  TrendingUp, ShoppingBag, AlertTriangle,
  ArrowDownCircle, ArrowUpCircle, Package, Wallet, Plus, Users, BarChart3
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
    // Buscamos também os dados de relatórios para o mini-gráfico
    const reportData = db.getDadosRelatorios();
    setGrafico(reportData.historico);
  }, []);

  if (!dados) return <div className="p-8">Carregando painel de controlo...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. CABEÇALHO E ATALHOS RÁPIDOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Olá, Administrador</h1>
            <p className="text-muted-foreground">Aqui está o resumo da sua operação hoje.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate("/vendas/pdv")} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                <ShoppingBag className="mr-2 h-4 w-4"/> Vender (PDV)
            </Button>
            <Button variant="outline" onClick={() => navigate("/produtos/novo")}>
                <Plus className="mr-2 h-4 w-4"/> Produto
            </Button>
            <Button variant="outline" onClick={() => navigate("/financeiro")}>
                <Wallet className="mr-2 h-4 w-4"/> Contas
            </Button>
        </div>
      </div>

      {/* 2. SUPER CARDS (OPERACIONAIS) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* VENDAS HOJE (COM MINI GRÁFICO) */}
          <div className="p-6 bg-card rounded-xl border shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start z-10 relative">
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vendas Hoje</p>
                      <h3 className="text-2xl font-bold text-primary mt-1">
                        {dados.faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                          {dados.qtdPedidosHoje} pedidos processados
                      </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <ShoppingBag className="h-5 w-5" />
                  </div>
              </div>
              {/* Mini Gráfico de Fundo */}
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <Area type="monotone" dataKey="vendas" stroke="currentColor" fill="currentColor" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* A PAGAR (ALERTA) */}
          <div className="p-6 bg-card rounded-xl border shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">A Pagar (Urgente)</p>
                      <h3 className="text-2xl font-bold text-red-600 mt-1">
                        {dados.aPagarHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg text-red-600 animate-pulse">
                      <ArrowDownCircle className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Vence hoje ou atrasado</p>
          </div>

          {/* A RECEBER */}
          <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">A Receber (Hoje)</p>
                      <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                        {dados.aReceberHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <ArrowUpCircle className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Boletos e crediário</p>
          </div>

          {/* PATRIMÔNIO (LUCRO) */}
          <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lucro em Stock</p>
                      <h3 className="text-2xl font-bold text-blue-600 mt-1">
                        {dados.patrimonio.lucroPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <TrendingUp className="h-5 w-5" />
                  </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Potencial de venda</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 3. GRÁFICO DE TENDÊNCIA SEMANAL (NOVO) */}
          <div className="lg:col-span-2 bg-card border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Movimento da Semana</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/relatorios")}>
                      Ver Completo &rarr;
                  </Button>
              </div>
              <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafico}>
                          <defs>
                              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#db2777" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(value) => [`R$ ${value.toFixed(2)}`, "Vendas"]}
                          />
                          <Area type="monotone" dataKey="vendas" stroke="#db2777" strokeWidth={3} fill="url(#colorVendas)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* 4. ALERTA DE STOCK (CRÍTICO) */}
          <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-lg">Reposição Urgente</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                  {dados.baixoEstoque.length > 0 ? (
                      <div className="space-y-3">
                          {dados.baixoEstoque.map(prod => (
                              <div key={prod.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                  <div className="flex-1 min-w-0 pr-2">
                                      <p className="text-sm font-medium text-slate-800 truncate">{prod.nome}</p>
                                      <p className="text-xs text-muted-foreground">Restam: <strong className="text-red-600">{prod.estoque} un</strong></p>
                                  </div>
                                  <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => navigate(`/produtos/editar/${prod.id}`)}>
                                      Repor
                                  </Button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed p-4 text-center">
                          <Package className="h-10 w-10 mb-2 opacity-20" />
                          <p className="text-sm">Tudo em ordem!<br/>Stock saudável.</p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}