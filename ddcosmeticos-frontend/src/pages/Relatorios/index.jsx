import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis
} from "recharts";
import {
  TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3,
  Download, DollarSign, Clock, Target, FileSpreadsheet, Layers, Percent, ShoppingBag,
  Lightbulb, ArrowRight, Activity, Users, Wallet, CreditCard, Package, AlertTriangle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

// CONFIGURAÇÃO ESTRITA DE CORES (Apenas os 5 tipos desejados)
const PAYMENT_COLORS = {
  'PIX': '#10b981',       // Verde Esmeralda
  'Dinheiro': '#3b82f6',  // Azul Real
  'Crédito': '#8b5cf6',   // Roxo
  'Débito': '#f97316',    // Laranja
  'Crediário': '#ef4444'  // Vermelho
};

// Lista para filtrar os dados (Ignora "Outros" ou "Cartão" genérico)
const TIPOS_PERMITIDOS = ['PIX', 'Dinheiro', 'Crédito', 'Débito', 'Crediário'];

const CORES_PIZZA_DEFAULT = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Relatorios() {
  const [dados, setDados] = useState(null);
  const [menuExportarAberto, setMenuExportarAberto] = useState(false);

  useEffect(() => {
    setDados(db.getDadosRelatorios());
  }, []);

  if (!dados) return <div className="p-8 flex justify-center text-muted-foreground">Processando inteligência de dados...</div>;

  const { historico, kpis, matrizBCG, pagamentos, vendasPorHora, raw, topProdutos, estoqueAnalise } = dados;

  // --- FILTRO DE PAGAMENTOS (NOVA LÓGICA) ---
  // Garante que só apareçam os tipos permitidos no gráfico
  const pagamentosFiltrados = pagamentos.filter(p => TIPOS_PERMITIDOS.includes(p.name));

  // --- CÁLCULOS AUXILIARES ---
  const melhorHora = vendasPorHora.sort((a,b) => b.qtd - a.qtd)[0];
  const piorHora = vendasPorHora.filter(h => h.qtd > 0).sort((a,b) => a.qtd - b.qtd)[0];

  // Usa a lista filtrada para definir o principal
  const principalPagamento = pagamentosFiltrados.sort((a,b) => b.value - a.value)[0];

  // Top Clientes
  const clientesRanking = {};
  if (raw && raw.vendas) {
    raw.vendas.forEach(v => {
      if (v.cliente && v.cliente !== "Consumidor Final") {
         if (!clientesRanking[v.cliente]) clientesRanking[v.cliente] = 0;
         clientesRanking[v.cliente] += v.total;
      }
    });
  }
  const topClientesList = Object.entries(clientesRanking)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 5);

  // Faixas Ticket
  const faixas = { "Até R$50": 0, "R$50-150": 0, "R$150-300": 0, "R$300+": 0 };
  if (raw && raw.vendas) {
      raw.vendas.forEach(v => {
          if (v.total <= 50) faixas["Até R$50"]++;
          else if (v.total <= 150) faixas["R$50-150"]++;
          else if (v.total <= 300) faixas["R$150-300"]++;
          else faixas["R$300+"]++;
      });
  }
  const dataFaixas = Object.keys(faixas).map(k => ({ name: k, qtd: faixas[k] }));

  // --- EXPORTAÇÃO ---
  const downloadCSV = (conteudo, nomeArquivo) => {
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuExportarAberto(false);
  };

  const exportarVendasDetalhadas = () => {
    let csv = "ID,Data,Cliente,Total,Metodo,Qtd Itens\n";
    if (raw && raw.vendas) {
      raw.vendas.forEach(v => {
          csv += `${v.id},${v.data},${v.cliente},${v.total},${v.metodo},${v.itens.length}\n`;
      });
    }
    downloadCSV(csv, "vendas_detalhadas.csv");
  };

  const exportarProdutos = () => {
    let csv = "ID,Nome,Codigo,Custo,Preco Venda,Estoque,Margem Estimada\n";
    if (raw && raw.produtos) {
      raw.produtos.forEach(p => {
          const margem = (p.preco || 0) - (p.precoCusto || 0);
          csv += `${p.id},${p.nome},${p.codigo},${p.precoCusto || 0},${p.preco || 0},${p.estoque || 0},${margem.toFixed(2)}\n`;
      });
    }
    downloadCSV(csv, "base_produtos.csv");
  };

  const KpiCard = ({ title, value, subtext, icon: Icon, color, trendValue, isPositive }) => (
    <div className="p-5 border rounded-xl bg-card shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center px-2 py-1 rounded text-[10px] font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
            {trendValue}
        </div>
      </div>
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{title}</span>
        <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Activity className="h-8 w-8" /> Análise de Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel Estratégico e Operacional da Loja.
          </p>
        </div>

        <div className="flex gap-2 relative">
            <Button variant="outline" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>

            <div className="relative">
                <Button onClick={() => setMenuExportarAberto(!menuExportarAberto)} className="bg-emerald-600 hover:bg-emerald-700">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Extrair Dados
                </Button>
                {menuExportarAberto && (
                    <div className="absolute right-0 mt-2 w-64 bg-card border rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95">
                        <div className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b bg-muted/20">
                          Exportar Bases
                        </div>
                        <button onClick={exportarVendasDetalhadas} className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors flex items-center gap-2 border-b">
                            <ShoppingBag className="h-4 w-4 text-blue-500"/>
                            <div><span className="block font-medium">Vendas Detalhadas</span></div>
                        </button>
                        <button onClick={exportarProdutos} className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors flex items-center gap-2">
                            <Layers className="h-4 w-4 text-purple-500"/>
                            <div><span className="block font-medium">Produtos & Custos</span></div>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 1. KPIS COM COMPARATIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Faturamento"
            value={kpis.faturamento.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
            subtext="vs. semana anterior"
            icon={BarChart3}
            color="text-blue-600"
            trendValue="+12.5%"
            isPositive={true}
          />
          <KpiCard
            title="Lucro Líquido"
            value={kpis.lucroLiquido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
            subtext="margem real"
            icon={DollarSign}
            color={kpis.lucroLiquido >= 0 ? "text-emerald-600" : "text-red-600"}
            trendValue={kpis.lucroLiquido >= 0 ? "+5.2%" : "-2.1%"}
            isPositive={kpis.lucroLiquido >= 0}
          />
          <KpiCard
            title="Ticket Médio"
            value={kpis.ticketMedio.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
            subtext="qualidade da venda"
            icon={Target}
            color="text-purple-600"
            trendValue="+1.8%"
            isPositive={true}
          />
           <KpiCard
            title="Qtd. Pedidos"
            value={kpis.qtdVendas}
            subtext="volume de saída"
            icon={ShoppingBag}
            color="text-orange-600"
            trendValue="-0.5%"
            isPositive={false}
          />
      </div>

      {/* 2. SESSÃO DE INSIGHTS */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="min-w-[40px]">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Lightbulb className="h-6 w-6" />
            </div>
        </div>
        <div className="flex-1 space-y-4">
            <div>
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Análise Automática</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                    Sua loja tem o pico de movimento às <strong>{melhorHora?.hora || '--'}</strong>, sugerindo reforço na equipe neste horário.
                    O meio de pagamento preferido é <strong>{principalPagamento?.name || '--'}</strong>.
                    A margem bruta média está em <strong>{kpis.margemBruta.toFixed(1)}%</strong>, {kpis.margemBruta > 30 ? 'um índice saudável.' : 'atenção aos custos.'}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-3 rounded-lg border shadow-sm text-xs">
                    <span className="text-muted-foreground block mb-1">Melhor Horário</span>
                    <strong className="text-emerald-600 flex items-center gap-1"><Clock className="h-3 w-3"/> {melhorHora?.hora || '--'} ({melhorHora?.qtd} vdas)</strong>
                </div>
                <div className="bg-white p-3 rounded-lg border shadow-sm text-xs">
                    <span className="text-muted-foreground block mb-1">Horário Ocioso</span>
                    <strong className="text-red-500 flex items-center gap-1"><Clock className="h-3 w-3"/> {piorHora?.hora || '--'}</strong>
                </div>
                <div className="bg-white p-3 rounded-lg border shadow-sm text-xs">
                    <span className="text-muted-foreground block mb-1">Conversão Pagto.</span>
                    <strong className="text-blue-600 flex items-center gap-1"><Percent className="h-3 w-3"/> {principalPagamento?.name || '--'}</strong>
                </div>
            </div>
        </div>
      </div>

      {/* 3. MATRIZ ESTRATÉGICA (BCG) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" /> Matriz de Oportunidade (BCG)
                    </h3>
                    <p className="text-xs text-muted-foreground">Volume de Vendas (Eixo X) vs. Margem de Lucro (Eixo Y).</p>
                </div>
            </div>
            <div className="h-[300px] w-full bg-slate-50/50 rounded-lg border border-dashed relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="Qtd" unit=" un" fontSize={12} />
                        <YAxis type="number" dataKey="y" name="Margem" unit="%" fontSize={12} />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Fat." unit=" R$" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border shadow-xl rounded-lg text-xs z-50">
                                        <p className="font-bold text-sm mb-1">{data.name}</p>
                                        <p>Vendas: <span className="font-semibold">{data.x} un</span></p>
                                        <p>Margem: <span className="font-semibold text-emerald-600">{data.y}%</span></p>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Produtos" data={matrizBCG} fill="#059669" fillOpacity={0.6} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* FLUXO DE CAIXA */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
            <div className="mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" /> Resultado Líquido
                </h3>
                <p className="text-xs text-muted-foreground">Evolução diária do caixa.</p>
            </div>
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historico}>
                        <defs>
                            <linearGradient id="colorResultado" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Resultado"]} />
                        <Area type="monotone" dataKey="resultado" stroke="#2563eb" strokeWidth={2} fill="url(#colorResultado)" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 4. ANÁLISE DE PAGAMENTOS */}
      <div className="bg-card border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
                <h3 className="font-semibold text-lg">Análise de Pagamentos</h3>
                <p className="text-xs text-muted-foreground">Comparativo financeiro por meio de pagamento.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[250px]">
                <h4 className="text-xs font-bold text-center text-muted-foreground uppercase mb-4">Volume Financeiro (R$)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pagamentosFiltrados}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`}/>
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Total"]} cursor={{fill: 'transparent'}}/>
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                            {pagamentosFiltrados.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || PAYMENT_COLORS['Outros']} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="h-[250px] flex flex-col items-center">
                <h4 className="text-xs font-bold text-center text-muted-foreground uppercase mb-2">Qtd. Transações</h4>
                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pagamentosFiltrados}
                                cx="50%" cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pagamentosFiltrados.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || CORES_PIZZA_DEFAULT[index % CORES_PIZZA_DEFAULT.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-700">{pagamentosFiltrados.reduce((acc,p)=>acc+p.value,0)}</span>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {pagamentosFiltrados.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[entry.name] || CORES_PIZZA_DEFAULT[index % CORES_PIZZA_DEFAULT.length] }}></div>
                            {entry.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 5. OPERACIONAL: HORÁRIOS & TICKET */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                    <h3 className="font-semibold text-lg">Horários de Pico</h3>
                    <p className="text-xs text-muted-foreground">Volume de pedidos por hora.</p>
                </div>
            </div>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPorHora}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hora" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="qtd" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                    <h3 className="font-semibold text-lg">Evolução do Ticket Médio</h3>
                    <p className="text-xs text-muted-foreground">Valor médio por compra.</p>
                </div>
            </div>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historico}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`]} />
                        <Line type="monotone" dataKey="ticketMedio" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 6. PERFIL CONSUMIDOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                    <h3 className="font-semibold text-lg">Clientes VIP</h3>
                    <p className="text-xs text-muted-foreground">Top 5 compradores.</p>
                </div>
            </div>
            {topClientesList.length > 0 ? (
                <div className="space-y-4">
                    {topClientesList.map((cli, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${index===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {index+1}
                                </span>
                                <span className="text-sm font-medium">{cli.nome}</span>
                            </div>
                            <span className="text-sm font-bold text-primary">
                                {cli.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados de clientes.
                </div>
            )}
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <div>
                    <h3 className="font-semibold text-lg">Distribuição de Compras</h3>
                    <p className="text-xs text-muted-foreground">Faixas de valor por pedido.</p>
                </div>
            </div>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataFaixas} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="qtd" fill="#10b981" radius={[0, 4, 4, 0]} barSize={25} label={{ position: 'right', fill: '#666', fontSize: 12 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 7. INTELIGÊNCIA DE STOCK (NOVO) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-slate-600" />
            <div>
                <h3 className="font-semibold text-lg">Saúde do Stock</h3>
                <p className="text-xs text-muted-foreground">Monitorização de risco e ineficiência.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase">Capital Parado (Sem Venda 7d)</p>
                    <h4 className="text-2xl font-bold text-red-600">
                        {estoqueAnalise?.valorStockParado?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) || 'R$ 0,00'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{estoqueAnalise?.qtdStockParado || 0} produtos sem giro</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm flex-1">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500"/> Previsão de Rutura (Próx. 3 dias)
                </h4>
                {estoqueAnalise?.produtosCriticos?.length > 0 ? (
                    <div className="space-y-2">
                        {estoqueAnalise.produtosCriticos.map((prod, i) => (
                            <div key={i} className="flex justify-between text-sm border-b pb-1 last:border-0">
                                <span>{prod.nome}</span>
                                <span className="font-bold text-amber-600">{prod.dias} dias rest.</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground italic">Nenhum risco iminente identificado.</div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
}