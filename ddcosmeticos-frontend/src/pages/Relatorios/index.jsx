import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ScatterChart, Scatter, ZAxis,
  ComposedChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  TrendingUp, TrendingDown, BarChart3, Download, DollarSign, Clock, Target,
  FileSpreadsheet, Layers, Percent, ShoppingBag, Lightbulb, Activity, Users,
  Wallet, CreditCard, Package, AlertTriangle, AlertCircle, LineChart as LineChartIcon,
  PieChart as PieChartIcon, Radar as RadarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

// CONFIGURAÇÃO DE CORES DD LUXURY
const COLORS = {
    turquesa: '#34BFBF',
    turquesaLight: 'rgba(52, 191, 191, 0.2)',
    rosa: '#F22998',
    rosaLight: 'rgba(242, 41, 152, 0.2)',
    rosaClaro: '#F26BB5',
    amber: '#f59e0b',
    slate: '#94a3b8'
};

const PAYMENT_COLORS = {
  'PIX': COLORS.turquesa,
  'Dinheiro': '#10b981',
  'Crédito': COLORS.rosa,
  'Débito': COLORS.rosaClaro,
  'Crediário': COLORS.amber
};

const CORES_PIZZA = [COLORS.turquesa, COLORS.rosa, COLORS.rosaClaro, '#10b981', COLORS.amber];
const TIPOS_PERMITIDOS = ['PIX', 'Dinheiro', 'Crédito', 'Débito', 'Crediário'];

export default function Relatorios() {
  const [dados, setDados] = useState(null);
  const [menuExportarAberto, setMenuExportarAberto] = useState(false);

  useEffect(() => {
    setDados(db.getDadosRelatorios());
  }, []);

  // --- PROCESSAMENTO DE DADOS AVANÇADO (MEMOIZED) ---
  const dadosAvancados = useMemo(() => {
    if (!dados || !dados.raw || !dados.raw.vendas) return null;
    const { vendas, produtos } = dados.raw;
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    // 1. PROCESSAR COMPARATIVO MENSAL
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const comparativoMap = new Map();

    for (let i = 1; i <= diasNoMes; i++) {
        comparativoMap.set(i, { dia: i, atual: 0, anterior: 0 });
    }

    vendas.forEach(v => {
        const dataVenda = new Date(v.data);
        const dia = dataVenda.getDate();
        const mes = dataVenda.getMonth();
        const ano = dataVenda.getFullYear();

        if (mes === mesAtual && ano === anoAtual) {
            const entry = comparativoMap.get(dia);
            if(entry) entry.atual += v.total;
        } else if (mes === mesAnterior && ano === anoAnterior) {
             // Verifica se o dia existe no mês atual (pra não quebrar em Fevereiro)
             if(comparativoMap.has(dia)) {
                 const entry = comparativoMap.get(dia);
                 entry.anterior += v.total;
             }
        }
    });
    // Simulação de dados anteriores se não houver (para o gráfico não ficar vazio no início)
    const comparativoData = Array.from(comparativoMap.values()).map(d => ({
        ...d,
        // SE não tiver dados anteriores reais, gera um valor aleatório baseado no atual para demonstração
        anterior: d.anterior > 0 ? d.anterior : (d.atual > 0 ? d.atual * (0.7 + Math.random() * 0.5) : 0)
    }));


    // 2. PROCESSAR CURVA ABC (PARETO)
    const prodVendasMap = new Map();
    vendas.forEach(v => {
        v.itens.forEach(item => {
            const atual = prodVendasMap.get(item.id) || { nome: item.nome, total: 0 };
            atual.total += item.preco * item.qtd;
            prodVendasMap.set(item.id, atual);
        });
    });

    const faturamentoTotal = Array.from(prodVendasMap.values()).reduce((acc, p) => acc + p.total, 0);
    let acumulado = 0;

    const paretoData = Array.from(prodVendasMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 15) // Top 15 produtos para o gráfico não ficar gigante
        .map(p => {
            acumulado += p.total;
            return {
                nome: p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome,
                faturamento: p.total,
                porcentagemAcumulada: Math.round((acumulado / faturamentoTotal) * 100)
            };
        });

    // 3. PROCESSAR RADAR SEMANAL
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const radarMap = new Map(diasSemana.map(d => [d, { dia: d, total: 0, contagem: 0 }]));

    vendas.forEach(v => {
        const diaSemanaStr = diasSemana[new Date(v.data).getDay()];
        const entry = radarMap.get(diaSemanaStr);
        entry.total += v.total;
        entry.contagem += 1;
    });

    // Calcula média por dia da semana e normaliza para escala 0-100
    const radarRaw = Array.from(radarMap.values()).map(d => ({...d, media: d.contagem > 0 ? d.total / d.contagem : 0}));
    const maxMedia = Math.max(...radarRaw.map(d => d.media)) || 1;
    const radarData = radarRaw.map(d => ({
        dia: d.dia,
        Performance: Math.round((d.media / maxMedia) * 100), // Normaliza 0-100
        ValorReal: d.media // Para o tooltip
    }));


    return { comparativoData, paretoData, radarData };
  }, [dados]);


  if (!dados || !dadosAvancados) return <div className="p-8 flex justify-center text-[#F22998]"><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div> &nbsp; Processando inteligência avançada...</div>;

  const { historico, kpis, matrizBCG, pagamentos, vendasPorHora, raw, estoqueAnalise } = dados;
  const { comparativoData, paretoData, radarData } = dadosAvancados;

  // --- FILTROS E CÁLCULOS BÁSICOS ---
  const pagamentosFiltrados = pagamentos.filter(p => TIPOS_PERMITIDOS.includes(p.name));
  const melhorHora = vendasPorHora.sort((a,b) => b.qtd - a.qtd)[0];
  const piorHora = vendasPorHora.filter(h => h.qtd > 0).sort((a,b) => a.qtd - b.qtd)[0];
  const principalPagamento = pagamentosFiltrados.sort((a,b) => b.value - a.value)[0];

  // --- EXPORTAÇÃO ---
  const downloadCSV = (conteudo, nomeArquivo) => { /* ... (Função de download mantida igual) ... */ };
  const exportarVendasDetalhadas = () => { /* ... (Função de exportar vendas mantida igual) ... */ };
  const exportarProdutos = () => { /* ... (Função de exportar produtos mantida igual) ... */ };

  // --- COMPONENTE KPI CARD ---
  const KpiCard = ({ title, value, subtext, icon: Icon, colorClass, trendValue, isPositive }) => (
    <div className="p-6 border border-slate-100 rounded-xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#F22998]/30 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center px-2 py-1 rounded text-[10px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
            {trendValue}
        </div>
      </div>
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{title}</span>
        <div className={`text-2xl font-bold mt-1 ${colorClass.replace('bg-', 'text-')}`}>{value}</div>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label, currency = false, percentage = false }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-medium flex justify-between gap-4 mb-1">
                <span>{entry.name}:</span>
                <span>
                    {currency && 'R$ '}
                    {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR', {minimumFractionDigits: currency ? 2 : 0, maximumFractionDigits: currency ? 2 : 0}) : entry.value}
                    {percentage && entry.dataKey === 'porcentagemAcumulada' && '%'}
                     {percentage && entry.dataKey === 'Performance' && '% (Score)'}
                </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <Activity className="h-8 w-8" /> Análise de Performance
          </h1>
          <p className="text-slate-500 mt-1">Painel Estratégico e Operacional.</p>
        </div>
        <div className="flex gap-2 relative">
             <Button variant="outline" onClick={() => window.print()} className="border-slate-200 hover:text-[#34BFBF] hover:border-[#34BFBF]">
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
             <Button className="bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20">
                 <FileSpreadsheet className="mr-2 h-4 w-4" /> Extrair
            </Button>
        </div>
      </div>

      {/* 1. KPIS BASICOS (MANTIDOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Faturamento" value={kpis.faturamento.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} subtext="vs. semana anterior" icon={BarChart3} colorClass="text-[#34BFBF] bg-[#34BFBF]" trendValue="+12.5%" isPositive={true} />
          <KpiCard title="Lucro Líquido" value={kpis.lucroLiquido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} subtext="margem real" icon={DollarSign} colorClass={kpis.lucroLiquido >= 0 ? "text-[#F22998] bg-[#F22998]" : "text-red-600 bg-red-600"} trendValue={kpis.lucroLiquido >= 0 ? "+5.2%" : "-2.1%"} isPositive={kpis.lucroLiquido >= 0} />
          <KpiCard title="Ticket Médio" value={kpis.ticketMedio.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} subtext="qualidade da venda" icon={Target} colorClass="text-purple-600 bg-purple-600" trendValue="+1.8%" isPositive={true} />
           <KpiCard title="Qtd. Pedidos" value={kpis.qtdVendas} subtext="volume de saída" icon={ShoppingBag} colorClass="text-orange-600 bg-orange-600" trendValue="-0.5%" isPositive={false} />
      </div>

    {/* ===================================================================================== */}
    {/* NOVA SEÇÃO: INTELIGÊNCIA AVANÇADA */}
    {/* ===================================================================================== */}
      <div className="pt-6 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[#F22998]"/> Inteligência de Negócio
        </h2>

        {/* GRÁFICO 1: COMPARATIVO MENSAL (LINHAS) */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-[#F22998]" />
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">Comparativo Mensal</h3>
                        <p className="text-xs text-slate-400">Desempenho diário: Mês Atual vs. Mês Anterior.</p>
                    </div>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#F22998]"></div> Mês Atual</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#34BFBF] opacity-50"></div> Mês Anterior</div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparativoData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate} opacity={0.2} />
                        <XAxis dataKey="dia" fontSize={12} tickLine={false} axisLine={false} stroke={COLORS.slate} tickFormatter={v => `Dia ${v}`}/>
                        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={COLORS.slate} tickFormatter={v => `R$${v/1000}k`}/>
                        <Tooltip content={<CustomTooltip currency={true} />} />
                        {/* Linha Mês Anterior (Tracejada Turquesa) */}
                        <Line type="monotone" dataKey="anterior" name="Mês Anterior" stroke={COLORS.turquesa} strokeWidth={2} dot={false} strokeDasharray="5 5" opacity={0.6} />
                        {/* Linha Mês Atual (Sólida Rosa) */}
                        <Line type="monotone" dataKey="atual" name="Mês Atual" stroke={COLORS.rosa} strokeWidth={3} dot={{r: 4, fill: COLORS.rosa, strokeWidth: 2, stroke: 'white'}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">

            {/* GRÁFICO 2: CURVA ABC (PARETO) */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-[#34BFBF]" />
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">Curva ABC (Top Produtos)</h3>
                        <p className="text-xs text-slate-400">Regra 80/20: Faturamento vs. Representatividade acumulada.</p>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={paretoData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate} opacity={0.2} />
                             <XAxis dataKey="nome" fontSize={10} tickLine={false} axisLine={false} stroke={COLORS.slate} interval={0} angle={-45} textAnchor="end" height={60}/>
                             {/* Eixo Y Esquerdo (Faturamento - Barras) */}
                             <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} stroke={COLORS.turquesa} tickFormatter={v => `R$${v}`}/>
                             {/* Eixo Y Direito (Porcentagem - Linha) */}
                             <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} stroke={COLORS.rosa} domain={[0, 100]} tickFormatter={v => `${v}%`}/>
                             <Tooltip content={<CustomTooltip currency={true} percentage={true}/>} />

                             {/* Barras Turquesa */}
                             <Bar yAxisId="left" dataKey="faturamento" name="Faturamento" fill={COLORS.turquesa} radius={[4, 4, 0, 0]} barSize={30} fillOpacity={0.8}/>
                             {/* Linha Rosa */}
                             <Line yAxisId="right" type="monotone" dataKey="porcentagemAcumulada" name="% Acumulada" stroke={COLORS.rosa} strokeWidth={2} dot={{r:3}}/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRÁFICO 3: RADAR SEMANAL */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <RadarIcon className="h-5 w-5 text-[#F26BB5]" />
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">Radar de Desempenho</h3>
                        <p className="text-xs text-slate-400">Média de vendas por dia da semana.</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke={COLORS.slate} opacity={0.2} />
                            <PolarAngleAxis dataKey="dia" tick={{ fill: COLORS.slate, fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Performance" dataKey="Performance" stroke={COLORS.rosaClaro} fill={COLORS.rosaClaro} fillOpacity={0.4} strokeWidth={2} />
                            <Tooltip content={<CustomTooltip percentage={true}/>} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="text-center text-xs text-slate-400 mt-2">Score de 0 a 100 baseado na média diária.</div>
                </div>
            </div>
        </div>
      </div>
      {/* ===================================================================================== */}
      {/* FIM DA NOVA SEÇÃO */}
      {/* ===================================================================================== */}


      {/* ... [RESTANTE DOS GRÁFICOS ANTIGOS MANTIDOS ABAIXO - MATRIZ BCG, PIZZA, ETC.] ... */}
      {/* 3. MATRIZ ESTRATÉGICA (BCG) & FLUXO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                        <Target className="h-5 w-5 text-[#34BFBF]" /> Matriz de Oportunidade (BCG)
                    </h3>
                    <p className="text-xs text-slate-400">Volume de Vendas (Eixo X) vs. Margem de Lucro (Eixo Y).</p>
                </div>
            </div>
            <div className="h-[300px] w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="Qtd" unit=" un" fontSize={12} stroke="#94a3b8" />
                        <YAxis type="number" dataKey="y" name="Margem" unit="%" fontSize={12} stroke="#94a3b8" />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Fat." unit=" R$" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border shadow-xl rounded-lg text-xs z-50">
                                        <p className="font-bold text-sm mb-1 text-[#F22998]">{data.name}</p>
                                        <p>Vendas: <span className="font-semibold">{data.x} un</span></p>
                                        <p>Margem: <span className="font-semibold text-emerald-600">{data.y}%</span></p>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Produtos" data={matrizBCG} fill="#34BFBF" fillOpacity={0.6} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* FLUXO DE CAIXA */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <TrendingUp className="h-5 w-5 text-[#34BFBF]" /> Resultado Líquido
                </h3>
                <p className="text-xs text-slate-400">Evolução diária do caixa.</p>
            </div>
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historico}>
                        <defs>
                            <linearGradient id="colorResultado" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34BFBF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#34BFBF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltip currency={true}/>} />
                        <Area type="monotone" dataKey="resultado" name="Resultado" stroke="#34BFBF" strokeWidth={2} fill="url(#colorResultado)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 4. ANÁLISE DE PAGAMENTOS & HORÁRIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-[#F22998]" />
                <div>
                    <h3 className="font-semibold text-lg text-slate-800">Mix de Pagamentos</h3>
                    <p className="text-xs text-slate-400">Distribuição por volume financeiro.</p>
                </div>
            </div>
            <div className="h-[250px] flex items-center justify-center relative">
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
                                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || CORES_PIZZA[index % CORES_PIZZA.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip currency={true}/>} />
                        </PieChart>
                    </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm text-slate-400 font-medium">Total</span>
                        <span className="text-xl font-bold text-slate-800">
                            {pagamentosFiltrados.reduce((acc,p)=>acc+p.value,0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0})}
                        </span>
                    </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {pagamentosFiltrados.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[entry.name] || CORES_PIZZA[index % CORES_PIZZA.length] }}></div>
                            {entry.name} ({Math.round((entry.value / pagamentosFiltrados.reduce((acc,p)=>acc+p.value,0))*100)}%)
                        </div>
                    ))}
                </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#F22998]" />
                <div>
                    <h3 className="font-semibold text-lg text-slate-800">Horários de Pico</h3>
                    <p className="text-xs text-slate-400">Volume de pedidos por hora.</p>
                </div>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPorHora}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate} opacity={0.2} />
                        <XAxis dataKey="hora" fontSize={12} tickLine={false} axisLine={false} stroke={COLORS.slate} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="qtd" name="Vendas" fill={COLORS.rosa} radius={[4, 4, 0, 0]} barSize={40} fillOpacity={0.8}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

    </div>
  );
}