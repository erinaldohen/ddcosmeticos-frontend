import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, ScatterChart, Scatter, ZAxis, ReferenceLine, RadialBarChart, RadialBar,
  FunnelChart, Funnel, LabelList, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  TrendingUp, Download, Calendar, PackageCheck, DollarSign,
  Layers, FileText, FileSpreadsheet, Loader2, ArrowUpRight, ArrowDownRight,
  CreditCard, Users, Sparkles, Lightbulb, TrendingDown, AlertTriangle, Target, ShoppingBag, ShieldAlert,
  Activity, Filter, Clock, Share2, Box, Percent, Award, Scale, PiggyBank, Wallet,
  Repeat, Link as LinkIcon, LayoutGrid, BarChart3, Briefcase, Microscope
} from "lucide-react";

// ==========================================
// 0. DEFINIÇÕES DE IDENTIDADE VISUAL
// ==========================================

const BRAND = {
  teal: '#34BFBF',       // Verde Água
  pink: '#F22998',       // Rosa Vibrante
  softPink: '#F26BB5',   // Rosa Suave
  purple: '#8B5CF6',     // Roxo Ametista Suave
  amber: '#F59E0B',      // Âmbar Dourado
  slate: '#94a3b8',      // Textos Legenda/Eixos
  grid: '#f1f5f9',       // Grades sutis
  dark: '#334155'        // Texto Principal (Substitui o preto)
};

// Paleta completa para itens variados
const BRAND_PALETTE = [BRAND.teal, BRAND.pink, BRAND.softPink, BRAND.purple, BRAND.amber, BRAND.slate];

// ==========================================
// 1. COMPONENTES UTILITÁRIOS
// ==========================================

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="col-span-full mb-2 mt-6 first:mt-0">
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
        <Icon className="h-4 w-4 text-[#34BFBF]" />
      </div>
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </h2>
      <div className="flex-1 h-px bg-slate-200/60 ml-2"></div>
    </div>
    {description && <p className="text-slate-500 text-xs font-medium ml-11">{description}</p>}
  </div>
);

const PremiumTooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-[10px] font-bold text-white bg-slate-900/90 backdrop-blur-md rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/10 uppercase tracking-widest">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/90"></div>
        </div>
      )}
    </div>
  );
};

const Button = ({ children, variant = 'default', size = 'default', className = "", onClick, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none disabled:opacity-50 cursor-pointer";
  const variants = {
    default: "bg-[#F22998] text-white hover:bg-[#d91e85] shadow-lg shadow-[#F22998]/20",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-[#34BFBF]",
    outline: "border border-slate-200 bg-white text-slate-700 hover:border-[#34BFBF] hover:text-[#34BFBF]"
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-xs", icon: "h-10 w-10" };
  return <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
    <defs>
      <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND.teal} stopOpacity={0.4} />
        <stop offset="100%" stopColor={BRAND.teal} stopOpacity={0.05} />
      </linearGradient>
      <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND.pink} stopOpacity={0.4} />
        <stop offset="100%" stopColor={BRAND.pink} stopOpacity={0.05} />
      </linearGradient>
    </defs>
  </svg>
);

const CustomTooltip = ({ active, payload, label, showDelta = false }) => {
  if (active && payload && payload.length) {
    let delta = null;
    let deltaColor = "";
    if (showDelta && payload.length >= 2) {
      const current = payload[0]?.value || 0;
      const previous = payload[1]?.value || 1;
      const diff = ((current - previous) / previous) * 100;
      if (previous !== 0) { delta = diff.toFixed(1); deltaColor = diff >= 0 ? "text-[#34BFBF]" : "text-[#F22998]"; }
    }
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-100 shadow-2xl rounded-xl p-4 min-w-[150px]">
        <p className="font-bold text-slate-400 text-[10px] mb-3 uppercase tracking-wider">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-[#334155] text-xs font-semibold">{entry.name}</span>
            </div>
            <span className="font-bold text-[#334155] text-xs tabular-nums">
               {typeof entry.value === 'number' && Math.abs(entry.value) > 100 ? `R$ ${Math.abs(entry.value).toLocaleString('pt-BR')}` : entry.value}
            </span>
          </div>
        ))}
        {delta && <div className={`mt-3 pt-3 border-t border-slate-50 text-[10px] font-black flex items-center gap-1 ${deltaColor}`}><TrendingUp className="h-3 w-3" /> {Math.abs(delta)}% vs Anterior</div>}
      </div>
    );
  }
  return null;
};

const AiInsightCard = ({ insights, categoria }) => (
    <div className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-[#1e3a3a] text-white p-6 rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/5">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700"><Sparkles className="h-40 w-40" /></div>
      <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-[#34BFBF]/10 rounded-full blur-3xl group-hover:bg-[#34BFBF]/20 transition-all duration-1000"></div>
      <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]"><Sparkles className="h-6 w-6 text-[#34BFBF] animate-pulse" /></div>
        <div className="space-y-6 flex-1 w-full">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-3 tracking-tight">DD Intelligence <span className="text-[#34BFBF] capitalize font-medium">• {categoria}</span></h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">Análise preditiva em tempo real.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights?.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-black/20 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all backdrop-blur-sm group/item">
                  <div className={`flex items-center gap-2 ${insight.color} mb-3 font-bold text-xs uppercase tracking-wider group-hover/item:translate-x-1 transition-transform`}><Icon className="h-4 w-4" /> {insight.title}</div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
);

const ChartCard = ({ title, subtitle, analysis, onDownload, children, fullWidth = false, className="" }) => (
  <div className={`bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'} ${className}`}>
    <div className="p-6 pb-4 flex justify-between items-start border-b border-slate-50">
      <div><h3 className="font-bold text-[#334155] text-lg tracking-tight">{title}</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{subtitle}</p></div>
      <PremiumTooltip text="Exportar visualização">
        <Button variant="ghost" size="icon" onClick={onDownload} className="text-slate-300 hover:text-[#34BFBF] rounded-xl -mt-1 -mr-2"><Download className="h-5 w-5" /></Button>
      </PremiumTooltip>
    </div>
    <div className="w-full px-5 py-4 flex-1 relative" style={{ height: '300px', minHeight: '300px' }}>{children}</div>
    {analysis && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 rounded-b-3xl flex items-start gap-3">
            <Activity className="h-4 w-4 text-[#34BFBF] mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed"><span className="font-bold text-[#334155] uppercase text-[9px] block mb-0.5">Diagnóstico BI:</span>{analysis}</p>
        </div>
    )}
  </div>
);

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`group flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-full min-w-max relative ${active ? "text-white shadow-lg shadow-[#34BFBF]/25" : "text-slate-500 hover:text-slate-900 hover:bg-white"}`}>
    {active && <div className="absolute inset-0 bg-gradient-to-r from-[#34BFBF] to-[#2ca8a8] rounded-full -z-10"></div>}
    <Icon className={`h-4 w-4 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-[#34BFBF]"}`} /> {label}
  </button>
);

const KpiCard = ({ title, value, subtext, icon: Icon, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-5">
            <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p><h4 className="text-2xl font-black text-[#334155] tracking-tight">{value}</h4></div>
            <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-[#34BFBF]/5 transition-colors`}><Icon className="h-6 w-6 text-slate-300 group-hover:text-[#34BFBF] transition-colors" /></div>
        </div>
        <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}{trend === 'down' && <ArrowDownRight className="h-3 w-3" />}{subtext}
        </div>
    </div>
);

// ==========================================
// 2. DADOS MOCKADOS (ESCOPO GLOBAL)
// ==========================================

const mockVendasTendencia = [{ dia: '01', atual: 4000, anterior: 3500, tendencia: 3900 }, { dia: '05', atual: 3000, anterior: 2800, tendencia: 4100 }, { dia: '10', atual: 9800, anterior: 7500, tendencia: 4300 }, { dia: '15', atual: 2780, anterior: 2900, tendencia: 4500 }, { dia: '20', atual: 6890, anterior: 5500, tendencia: 4700 }, { dia: '25', atual: 2390, anterior: 2100, tendencia: 4900 }, { dia: '30', atual: 3490, anterior: 3200, tendencia: 5100 }];
const mockFunil = [{ value: 1200, name: 'Passantes', fill: '#cbd5e1' }, { value: 450, name: 'Visitas', fill: BRAND.teal }, { value: 280, name: 'Experiência', fill: BRAND.purple }, { value: 142, name: 'Venda', fill: BRAND.pink }];
const mockRetencao = [{ mes: 'Jan', novos: 15000, recorrentes: 25000 }, { mes: 'Fev', novos: 12000, recorrentes: 28000 }, { mes: 'Mar', novos: 18000, recorrentes: 32000 }, { mes: 'Abr', novos: 14000, recorrentes: 35000 }];
const mockDistribuicaoTicket = [{ range: '0-50', qtd: 120 }, { range: '51-100', qtd: 250 }, { range: '101-200', qtd: 180 }, { range: '201-500', qtd: 80 }, { range: '500+', qtd: 20 }];
const mockCrossSell = [{ par: 'Shampoo+Cond', freq: 450, conversao: 85 }, { par: 'Base+Pó', freq: 320, conversao: 65 }, { par: 'Perfume+Hidra', freq: 150, conversao: 40 }, { par: 'Batom+Lápis', freq: 110, conversao: 30 }];
const mockVendedores = [{ name: 'Ana', venda: 45000, meta: 40000 }, { name: 'Bia', venda: 38000, meta: 40000 }, { name: 'Carla', venda: 42000, meta: 35000 }, { name: 'Dani', venda: 31000, meta: 35000 }];
const mockMarcas = [{ name: 'L\'Oréal', atual: 15000, anterior: 12000 }, { name: 'Nivea', atual: 11000, anterior: 11500 }, { name: 'Dior', atual: 9000, anterior: 6000 }, { name: 'Boticário', atual: 8500, anterior: 8000 }, { name: 'Vult', atual: 6000, anterior: 7000 }];
const mockDiasSemana = [{ dia: 'Seg', valor: 12000 }, { dia: 'Ter', valor: 15000 }, { dia: 'Qua', valor: 14000 }, { dia: 'Qui', valor: 18000 }, { dia: 'Sex', valor: 24000 }, { dia: 'Sáb', valor: 22000 }, { dia: 'Dom', valor: 8000 }];
const mockOrigem = [{ name: 'Instagram', value: 45, fill: BRAND.pink }, { name: 'Vitrine', value: 30, fill: BRAND.teal }, { name: 'Indicação', value: 15, fill: BRAND.softPink }, { name: 'Google', value: 10, fill: BRAND.amber }];
const mockVendasComparativo = [{ dia: '01', atual: 4000, anterior: 3500, meta: 3800 }, { dia: '05', atual: 3000, anterior: 2800, meta: 3800 }, { dia: '10', atual: 9800, anterior: 7500, meta: 8000 }, { dia: '15', atual: 2780, anterior: 2900, meta: 3000 }, { dia: '20', atual: 6890, anterior: 5500, meta: 6000 }, { dia: '25', atual: 2390, anterior: 2100, meta: 2500 }, { dia: '30', atual: 3490, anterior: 3200, meta: 3500 }];
const mockPagamentos = [{ name: 'Crédito', value: 45000 }, { name: 'PIX', value: 35000 }, { name: 'Débito', value: 25000 }, { name: 'Dinheiro', value: 8000 }];
const mockHorarios = [{ hora: '08h', fluxo: 10 }, { hora: '10h', fluxo: 35 }, { hora: '12h', fluxo: 80 }, { hora: '14h', fluxo: 45 }, { hora: '16h', fluxo: 60 }, { hora: '18h', fluxo: 95 }, { hora: '20h', fluxo: 30 }];
const mockCategoriasMoM = [{ name: 'Cabelos', atual: 45000, anterior: 41000 }, { name: 'Maquiagem', atual: 32000, anterior: 35000 }, { name: 'Perfumaria', atual: 58000, anterior: 49000 }, { name: 'Skincare', atual: 21000, anterior: 18000 }];
const mockTicket = [{ name: 'Sua Loja', valor: 145 }, { name: 'Média Setor', valor: 110 }];

const mockCurvaABC = [{ name: 'Classe A', produtos: 20, receita: 80 }, { name: 'Classe B', produtos: 30, receita: 15 }, { name: 'Classe C', produtos: 50, receita: 5 }];
const mockBCG = [{ name: 'Shampoo', x: 180, y: 140, z: 5000, fill: BRAND.teal }, { name: 'Esmalte', x: 250, y: 20, z: 2000, fill: BRAND.amber }, { name: 'Perfume', x: 30, y: 250, z: 6000, fill: BRAND.pink }, { name: 'Creme', x: 10, y: 10, z: 400, fill: BRAND.purple }];
const mockAging = [{ name: '0-30d', value: 45000, fill: BRAND.teal }, { name: '31-60d', value: 25000, fill: BRAND.softPink }, { name: '61-90d', value: 15000, fill: BRAND.purple }, { name: '>90d', value: 8000, fill: BRAND.amber }];
const mockRuptura = [{ mes: 'Jan', taxa: 4.2 }, { mes: 'Fev', taxa: 3.5 }, { mes: 'Mar', taxa: 2.1 }, { mes: 'Abr', taxa: 2.8 }];
const mockEstoqueCategorias = [{ name: 'Cabelos', valor: 45000 }, { name: 'Maquiagem', valor: 32000 }, { name: 'Perfumaria', valor: 58000 }, { name: 'Skincare', valor: 21000 }];
const mockValidade = [{ periodo: '30d', valor: 2500 }, { periodo: '60d', valor: 5800 }, { periodo: '90d', valor: 12000 }, { periodo: '>90d', valor: 45000 }];
const mockCobertura = [{ name: 'Cabelos', dias: 45 }, { name: 'Make', dias: 25 }, { name: 'Perfume', dias: 90 }, { name: 'Skin', dias: 15 }];

const mockFluxoCaixa = [{ dia: '01', entrada: 5000, saida: 2000, saldo: 3000 }, { dia: '05', entrada: 4200, saida: 4000, saldo: 200 }, { dia: '10', entrada: 12000, saida: 5000, saldo: 7000 }, { dia: '15', entrada: 3000, saida: 8000, saldo: -5000 }, { dia: '20', entrada: 8000, saida: 3000, saldo: 5000 }, { dia: '25', entrada: 4000, saida: 2000, saldo: 2000 }, { dia: '30', entrada: 6000, saida: 1000, saldo: 5000 }];
const mockDRE = [{ name: 'Receita', valor: 124000, fill: BRAND.teal }, { name: 'Custos', valor: -63000, fill: BRAND.softPink }, { name: 'Despesas', valor: -28600, fill: BRAND.amber }, { name: 'Lucro', valor: 32400, fill: BRAND.pink }];
const mockDespesasDetalhadas = [{ name: 'Pessoal', value: 12000, fill: BRAND.teal }, { name: 'Aluguel', value: 8000, fill: BRAND.purple }, { name: 'Mkt/Ads', value: 4500, fill: BRAND.pink }, { name: 'Taxas', value: 3200, fill: BRAND.amber }, { name: 'Outros', value: 900, fill: BRAND.slate }];

const mockFiscalSegregacao = [{ name: 'Monofásico', value: 65000, fill: BRAND.amber }, { name: 'Tributado', value: 35000, fill: BRAND.slate }, { name: 'Subst. Trib.', value: 24000, fill: BRAND.teal }];
const mockFiscalEconomia = [{ mes: 'Jan', pago: 4200, economizado: 2100 }, { mes: 'Fev', pago: 3800, economizado: 1900 }, { mes: 'Mar', pago: 5100, economizado: 3200 }, { mes: 'Abr', pago: 4500, economizado: 2500 }];
const mockFiscalCarga = [{ mes: 'Jan', fat: 100000, carga: 4.5 }, { mes: 'Fev', fat: 95000, carga: 4.2 }, { mes: 'Mar', fat: 130000, carga: 5.1 }, { mes: 'Abr', fat: 124000, carga: 4.8 }];
const mockFiscalCFOP = [{ name: 'Venda', value: 1200, fill: BRAND.teal }, { name: 'Devolução', value: 45, fill: BRAND.pink }, { name: 'Bonificação', value: 80, fill: BRAND.softPink }];
const mockAuditoria = [{ item: 'NCM OK', qtd: 1200 }, { item: 'NCM Erro', qtd: 45 }, { item: 'Sem CEST', qtd: 12 }];

const mockInsightsData = {
  vendas: [{ type: 'opportunity', icon: LinkIcon, title: 'Cross-Selling', text: 'Shampoo + Condicionador: 85% conversão.', color: 'text-emerald-500' }, { type: 'info', icon: Repeat, title: 'Fidelidade Alta', text: '70% de receita recorrente.', color: 'text-[#34BFBF]' }, { type: 'warning', icon: Filter, title: 'Ticket Baixo', text: 'Grande volume na faixa R$ 50-100.', color: 'text-amber-500' }],
  estoque: [{ type: 'danger', icon: AlertTriangle, title: 'Giro Lento', text: 'Produtos parados > 90 dias subiram.', color: 'text-rose-500' }, { type: 'warning', icon: Box, title: 'Cobertura Alta', text: 'Perfumaria com estoque excessivo.', color: 'text-amber-500' }],
  financeiro: [{ type: 'warning', icon: Wallet, title: 'Fluxo de Caixa', text: 'Gap previsto para dia 15.', color: 'text-amber-500' }, { type: 'info', icon: CreditCard, title: 'Taxas de Cartão', text: 'Consomem 2.5% da receita bruta.', color: 'text-blue-500' }],
  fiscal: [{ type: 'opportunity', icon: PiggyBank, title: 'Economia Recorde', text: 'Segregação gerou R$ 3.200 de economia.', color: 'text-emerald-500' }, { type: 'info', icon: ShieldAlert, title: 'Compliance', text: '98% de cadastros corretos.', color: 'text-blue-500' }]
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

export default function RelatoriosDashboard() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("vendas");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 8) + "01");
  const [dataFim, setDataFim] = useState(new Date().toISOString().slice(0, 10));
  const baixarRelatorio = (tipo) => toast.success(`Gerando relatório: ${tipo}`);

  return (
    <div className={`space-y-8 animate-in fade-in pb-10 max-w-[1600px] mx-auto p-8 min-h-screen font-sans bg-[#f8fafc]`}>
      <ChartDefs />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
            <div className="bg-[#34BFBF] p-3 rounded-2xl text-white shadow-lg shadow-[#34BFBF]/30"><TrendingUp className="h-7 w-7" /></div>
            Central de Inteligência
          </h1>
          <p className="text-slate-500 text-sm mt-3 font-semibold ml-1 tracking-wide uppercase tracking-[0.15em]">Analytics & Performance</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50 font-medium text-slate-600 hover:border-[#34BFBF]/40 transition-all group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#34BFBF]">Período:</span>
                <Calendar className="h-4 w-4 text-slate-400 group-hover:text-[#34BFBF]" />
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none w-[115px] cursor-pointer"/>
                <span className="text-slate-300 text-xs mx-1 group-hover:text-indigo-300">•</span>
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none w-[115px] cursor-pointer"/>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <Button size="sm" variant="ghost" className="text-slate-500 hover:text-emerald-600 flex items-center gap-2" onClick={() => baixarRelatorio('Excel')}>
                <FileSpreadsheet className="h-4 w-4" /> EXCEL
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-500 hover:text-[#F22998] flex items-center gap-2" onClick={() => baixarRelatorio('PDF')}>
                <FileText className="h-4 w-4" /> PDF
            </Button>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="bg-white/60 p-2 rounded-full border border-slate-200/60 backdrop-blur-md shadow-sm inline-flex gap-1 overflow-x-auto no-scrollbar">
          <TabButton active={categoriaAtiva === "vendas"} label="Comercial" icon={TrendingUp} onClick={() => setCategoriaAtiva("vendas")} />
          <TabButton active={categoriaAtiva === "estoque"} label="Estoque" icon={PackageCheck} onClick={() => setCategoriaAtiva("estoque")} />
          <TabButton active={categoriaAtiva === "financeiro"} label="Financeiro" icon={DollarSign} onClick={() => setCategoriaAtiva("financeiro")} />
          <TabButton active={categoriaAtiva === "fiscal"} label="Fiscal" icon={Layers} onClick={() => setCategoriaAtiva("fiscal")} />
      </div>

      <AiInsightCard insights={mockInsightsData[categoriaAtiva]} categoria={categoriaAtiva} />

      <div className="animate-in slide-in-from-bottom-6 duration-700">

        {/* ================= ABA COMERCIAL (ORGANIZADA POR SEÇÕES) ================= */}
        {categoriaAtiva === "vendas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Faturamento" value="R$ 124k" subtext="+12% YoY" icon={DollarSign} trend="up" />
                <KpiCard title="Itens/Cupom" value="2.4" subtext="Meta: 3.0" icon={ShoppingBag} trend="down" />
                <KpiCard title="Conversão" value="11.8%" subtext="-0.5% MoM" icon={Target} trend="down" />
                <KpiCard title="Ticket Médio" value="R$ 145" subtext="+30% vs Mercado" icon={Users} trend="up" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SectionHeader icon={BarChart3} title="Performance de Vendas" description="Análise estrutural, tendências e eficácia do funil." />
                <ChartCard title="Tendência de Vendas" subtitle="Regressão Linear" analysis="Crescimento estrutural positivo confirmado pela linha de tendência." className="md:col-span-2" onDownload={() => baixarRelatorio('tendencia')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockVendasTendencia} margin={{top: 10, right: 10, left: -10, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} />
                      <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: BRAND.slate, fontSize: 12, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate, fontSize: 12, fontWeight: 500}} tickFormatter={v => `${v/1000}k`} />
                      <Tooltip content={<CustomTooltipContent />} />
                      <Legend />
                      <Area type="monotone" dataKey="atual" name="Vendas (Real)" fill="url(#gradTeal)" stroke={BRAND.teal} strokeWidth={4} />
                      <Line type="monotone" dataKey="tendencia" name="Tendência" stroke={BRAND.amber} strokeWidth={3} dot={false} strokeDasharray="8 8" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Funil de Eficiência" subtitle="Conversão Loja" analysis="Perda crítica na etapa de experimentação." onDownload={() => baixarRelatorio('funil')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart margin={{top: 20, right: 20, left: 20, bottom: 20}}>
                      <Tooltip content={<CustomTooltipContent />} />
                      <Funnel data={mockFunil} dataKey="value" nameKey="name" isAnimationActive shape={({ x, y, width, height, fill }) => <polygon points={`${x},${y} ${x+width},${y} ${x+width*0.8},${y+height} ${x+width*0.2},${y+height}`} fill={fill} stroke="white" strokeWidth={2} />}>
                        <LabelList position="right" fill={BRAND.slate} dataKey="name" fontWeight="bold" fontSize={11} />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </ChartCard>

                <SectionHeader icon={Users} title="Comportamento do Cliente" description="Hábitos de compra, fidelidade e distribuição de ticket." />
                <ChartCard title="Retenção de Clientes" subtitle="Novos vs Recorrentes" analysis="Receita recorrente crescendo consistentemente." onDownload={() => baixarRelatorio('retencao')}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={mockRetencao} margin={{top: 10, right: 0, left: -15, bottom: 0}}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} />
                       <XAxis dataKey="mes" axisLine={false} tickLine={false} dy={10} tick={{fill: BRAND.slate, fontWeight: 500}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate, fontWeight: 500}} tickFormatter={v => `${v/1000}k`}/>
                       <Tooltip content={<CustomTooltipContent />} />
                       <Legend wrapperStyle={{paddingTop: 20}} formatter={(value) => <span className="text-slate-600 font-semibold text-xs">{value}</span>}/>
                       <Bar dataKey="novos" name="Novos" stackId="a" fill={BRAND.teal} stroke="white" strokeWidth={2} radius={[0,0,8,8]} fillOpacity={0.8} />
                       <Bar dataKey="recorrentes" name="Fiéis" stackId="a" fill={BRAND.softPink} stroke="white" strokeWidth={2} radius={[8,8,0,0]} fillOpacity={0.8} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Distribuição Ticket" subtitle="Faixas de Valor" onDownload={() => baixarRelatorio('histograma')}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={mockDistribuicaoTicket} margin={{top: 10}}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={BRAND.grid} />
                        <XAxis dataKey="range" tick={{fontSize: 11, fill: BRAND.slate, fontWeight: 500}} axisLine={false} tickLine={false} dy={5} />
                        <Tooltip content={<CustomTooltipContent />} />
                        <Bar dataKey="qtd" fill={BRAND.purple} radius={[8,8,0,0]} barSize={45} fillOpacity={0.9} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Cross-Selling (Cesta)" subtitle="Produtos Juntos" analysis="Perfumaria tem oportunidade." onDownload={() => baixarRelatorio('cross_sell')}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={mockCrossSell} layout="vertical" margin={{left: 20, right: 20}}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={BRAND.grid} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="par" type="category" width={100} tick={{fontSize: 10, fill: BRAND.dark, fontWeight: 600}} axisLine={false} tickLine={false} />
                       <Tooltip content={<CustomTooltipContent />} />
                       <Bar dataKey="conversao" name="Conversão (%)" fill={BRAND.pink} radius={[0, 12, 12, 0]} barSize={24} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartCard>

                <SectionHeader icon={Briefcase} title="Gestão Operacional" description="Análise de equipe, marcas, canais e sazonalidade." />
                <ChartCard title="Ranking Vendedores" onDownload={() => baixarRelatorio('vendedores')}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={mockVendedores} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={40} tick={{fontWeight: 'bold', fill: BRAND.dark}} axisLine={false} tickLine={false}/>
                       <Tooltip content={<CustomTooltipContent />} />
                       <Bar dataKey="venda" fill={BRAND.teal} radius={[0,10,10,0]} barSize={30} background={{ fill: BRAND.grid, radius: 10 }} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Top Marcas" onDownload={() => baixarRelatorio('marcas')}>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={mockMarcas} margin={{top: 10}}>
                       <XAxis dataKey="name" tick={{fontSize: 10, fill: BRAND.slate, fontWeight: 500}} axisLine={false} tickLine={false} dy={5} />
                       <Tooltip content={<CustomTooltipContent />} />
                       <Bar dataKey="atual" fill={BRAND.pink} radius={[8,8,0,0]} barSize={40} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Meios de Pagamento" onDownload={() => baixarRelatorio('pgto')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={mockPagamentos} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{mockPagamentos.map((e, i) => <Cell key={i} fill={[BRAND.teal, BRAND.pink, BRAND.softPink, BRAND.purple][i % 4]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Fluxo Horário" onDownload={() => baixarRelatorio('fluxo')}>
                  <ResponsiveContainer width="100%" height="100%"><AreaChart data={mockHorarios}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke={BRAND.grid}/><XAxis dataKey="hora" tick={{fill: BRAND.slate}} /><YAxis hide/><Tooltip/><Area type="monotone" dataKey="fluxo" stroke={BRAND.teal} fill={BRAND.teal} fillOpacity={0.2} /></AreaChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Performance Semanal" onDownload={() => baixarRelatorio('semana')}>
                   <ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockDiasSemana}><PolarGrid stroke={BRAND.grid} /><PolarAngleAxis dataKey="dia" tick={{fill: BRAND.slate, fontSize: 10}} /><Radar name="Vendas" dataKey="valor" stroke={BRAND.pink} fill={BRAND.pink} fillOpacity={0.6} /><Tooltip /></RadarChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Origem do Cliente" onDownload={() => baixarRelatorio('origem')}>
                   <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={mockOrigem} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{mockOrigem.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Evolução YoY" subtitle="Mês Atual vs Anterior" className="md:col-span-2" onDownload={() => baixarRelatorio('yoy')}>
                   <ResponsiveContainer width="100%" height="100%"><AreaChart data={mockVendasComparativo} margin={{top: 10, right: 10, left: -10, bottom: 0}}><CartesianGrid stroke={BRAND.grid} vertical={false} /><XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><Tooltip content={<CustomTooltipContent showDelta={true} />} /><Legend verticalAlign="top" align="right" /><Area type="monotone" dataKey="anterior" name="Ano Anterior" stroke={BRAND.slate} strokeDasharray="5 5" fill="transparent" /><Area type="monotone" dataKey="atual" name="Ano Atual" stroke={BRAND.teal} fill="url(#gradTeal)" /></AreaChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Categorias MoM" subtitle="Variação Mensal" onDownload={() => baixarRelatorio('categorias')}>
                   <ResponsiveContainer width="100%" height="100%"><BarChart data={mockCategoriasMoM}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke={BRAND.grid}/><XAxis dataKey="name" tick={{fill: BRAND.slate, fontSize: 10}} /><YAxis tick={{fill: BRAND.slate, fontSize: 10}}/><Tooltip /><Legend verticalAlign="top" align="right"/><Bar dataKey="anterior" name="Anterior" fill={BRAND.slate} radius={[4,4,0,0]} fillOpacity={0.6} /><Bar dataKey="atual" name="Atual" fill={BRAND.teal} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Ticket vs Benchmark" onDownload={() => baixarRelatorio('ticket')}>
                   <ResponsiveContainer width="100%" height="100%"><BarChart data={mockTicket}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><Tooltip /><ReferenceLine y={110} stroke={BRAND.pink} strokeDasharray="3 3" label={{value: 'Média', fill: BRAND.pink, fontSize: 10}} /><Bar dataKey="valor" fill={BRAND.teal}>{mockTicket.map((e,i) => <Cell key={i} fill={i===0 ? BRAND.teal : BRAND.slate}/>)}</Bar></BarChart></ResponsiveContainer>
                </ChartCard>
            </div>
          </div>
        )}

        {/* ================= ABA ESTOQUE ================= */}
        {categoriaAtiva === "estoque" && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Valor em Estoque" value="R$ 450k" subtext="Custo" icon={PackageCheck} trend="neutral" />
                <KpiCard title="Itens Sem Giro" value="8%" subtext=">90 dias" icon={Clock} trend="up" />
                <KpiCard title="Ruptura Atual" value="2.8%" subtext="Meta: <2%" icon={AlertTriangle} trend="down" />

                <SectionHeader icon={Target} title="Inteligência de Portfólio" description="Análise de rentabilidade, giro e concentração de estoque." />
                <ChartCard title="Curva ABC (Pareto)" subtitle="Concentração de Receita" className="md:col-span-2" onDownload={() => baixarRelatorio('abc')}>
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={mockCurvaABC} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke={BRAND.grid} vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} dy={10}/><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis yAxisId="right" orientation="right" unit="%" axisLine={false} tickLine={false} tick={{fill: BRAND.teal}} />
                          <Tooltip content={<CustomTooltipContent />} /><Bar yAxisId="left" dataKey="produtos" name="% Produtos" fill={BRAND.slate} barSize={50} radius={[8,8,0,0]} fillOpacity={0.5} /><Line yAxisId="right" type="monotone" dataKey="receita" name="% Receita" stroke={BRAND.teal} strokeWidth={4} dot={{r:6, fill: BRAND.teal}} />
                       </ComposedChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Matriz BCG" subtitle="Margem vs Giro" onDownload={() => baixarRelatorio('bcg')}>
                   <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{top:20,right:20,bottom:10,left:0}}><CartesianGrid stroke={BRAND.grid} strokeDasharray="3 3" /><XAxis type="number" dataKey="x" name="Vendas" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis type="number" dataKey="y" name="Margem" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><ZAxis type="number" dataKey="z" range={[100,600]} /><Tooltip cursor={{strokeDasharray:'3 3'}} content={<CustomTooltipContent />} /><Scatter name="Produtos" data={mockBCG} fill={BRAND.teal}>{mockBCG.map((e, i) => <Cell key={i} fill={e.fill} />)}</Scatter></ScatterChart>
                   </ResponsiveContainer>
                </ChartCard>

                <SectionHeader icon={Microscope} title="Eficiência e Riscos" description="Aging, ruptura e cobertura para evitar perdas." />
                <ChartCard title="Aging de Estoque" onDownload={() => baixarRelatorio('aging')}>
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={mockAging} innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" stroke="white" strokeWidth={3}>{mockAging.map((e, i) => <Cell key={i} fill={[BRAND.teal, BRAND.softPink, BRAND.purple, BRAND.amber][i % 4]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Evolução da Ruptura" onDownload={() => baixarRelatorio('ruptura')}>
                    <ResponsiveContainer width="100%" height="100%"><AreaChart data={mockRuptura} margin={{top: 10, right: 10, left: -20, bottom: 0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} /><XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><Tooltip /><Area type="monotone" dataKey="taxa" stroke={BRAND.pink} fill="url(#gradPink)" strokeWidth={3} /></AreaChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Cobertura (Dias)" onDownload={() => baixarRelatorio('cobertura')}>
                    <ResponsiveContainer width="100%" height="100%"><BarChart data={mockCobertura} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={70} axisLine={false} tickLine={false} tick={{fill: BRAND.dark, fontWeight: 600}} /><Tooltip /><ReferenceLine x={30} stroke={BRAND.teal} strokeDasharray="3 3" /><Bar dataKey="dias" fill={BRAND.amber} radius={[0,8,8,0]} barSize={28} /></BarChart></ResponsiveContainer>
                </ChartCard>

                <SectionHeader icon={PackageCheck} title="Gestão de Inventário" description="Visão por categoria e controle de validade." />
                <ChartCard title="Valor em Estoque" onDownload={() => baixarRelatorio('estoque_valor')} className="md:col-span-2">
                   <ResponsiveContainer width="100%" height="100%"><BarChart data={mockEstoqueCategorias}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke={BRAND.grid}/><XAxis dataKey="name" tick={{fill: BRAND.slate}} /><YAxis tick={{fill: BRAND.slate}}/><Tooltip/><Bar dataKey="valor" fill={BRAND.teal} radius={[6,6,0,0]} barSize={50} /></BarChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Risco de Validade" onDownload={() => baixarRelatorio('validade')}>
                    <ResponsiveContainer width="100%" height="100%"><BarChart data={mockValidade} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="periodo" type="category" width={50} tick={{fill: BRAND.slate}}/><Tooltip/><Bar dataKey="valor" fill={BRAND.pink} radius={[0,4,4,0]} /></BarChart></ResponsiveContainer>
                </ChartCard>
             </div>
           </div>
        )}

        {/* ================= ABA FINANCEIRO ================= */}
        {categoriaAtiva === "financeiro" && (
           <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <KpiCard title="Lucro Líquido" value="R$ 32.400" subtext="Margem: 26%" icon={DollarSign} trend="up" />
                  <KpiCard title="CMV Global" value="36%" subtext="Custo de Venda" icon={PackageCheck} trend="down" />
                  <KpiCard title="Taxa Desconto" value="4.8%" subtext="Impacto Margem" icon={Percent} trend="down" />
                  <KpiCard title="Saldo Previsto" value="R$ 15k" subtext="Próx. 7 dias" icon={Wallet} trend="neutral" />

                  <SectionHeader icon={Wallet} title="Gestão de Caixa e Lucratividade" description="Entradas, saídas e demonstração visual de resultados." />
                  <ChartCard title="Fluxo de Caixa Diário" subtitle="Entradas vs Saídas" fullWidth onDownload={() => baixarRelatorio('fluxo_caixa')}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={mockFluxoCaixa} margin={{top: 20, right: 20, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} /><XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><Tooltip content={<CustomTooltipContent />} /><Legend wrapperStyle={{paddingTop: 20}} />
                        <Bar dataKey="entrada" name="Entradas" fill={BRAND.teal} barSize={18} radius={[4,4,0,0]} /><Bar dataKey="saida" name="Saídas" fill={BRAND.purple} barSize={18} radius={[4,4,0,0]} /><Line type="monotone" dataKey="saldo" name="Saldo" stroke={BRAND.pink} strokeWidth={4} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <SectionHeader icon={Scale} title="Análise de Resultados" description="Composição de custos e detalhamento operacional." />
                  <ChartCard title="DRE Visual (Waterfall)" subtitle="Erosão da Receita" className="md:col-span-2" onDownload={() => baixarRelatorio('dre')}>
                    <ResponsiveContainer width="100%" height="100%"><BarChart data={mockDRE} margin={{top: 20, bottom: 20}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: BRAND.dark, fontWeight: 600}} interval={0} /><YAxis axisLine={false} tickLine={false} hide /><Tooltip content={<CustomTooltipContent />} /><Bar dataKey="valor" stroke="white" strokeWidth={2}>{mockDRE.map((e, i) => <Cell key={i} fill={e.fill} radius={[8,8,8,8]} />)}</Bar></BarChart></ResponsiveContainer>
                  </ChartCard>
                  <ChartCard title="Detalhamento de Despesas" onDownload={() => baixarRelatorio('despesas')}>
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={mockDespesasDetalhadas} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{mockDespesasDetalhadas.map((e, i) => <Cell key={i} fill={[BRAND.teal, BRAND.purple, BRAND.pink, BRAND.amber, BRAND.softPink][i % 5]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart></ResponsiveContainer>
                  </ChartCard>
               </div>
           </div>
        )}

        {/* ================= ABA FISCAL ================= */}
        {categoriaAtiva === "fiscal" && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Recuperação DAS" value="R$ 3.200" subtext="No último mês" icon={PiggyBank} trend="up" />
                <KpiCard title="Carga Tributária" value="5.1%" subtext="Alíquota Efetiva" icon={Scale} trend="down" />
                <KpiCard title="NCMs Inválidos" value="45" subtext="Ação Requerida" icon={ShieldAlert} trend="down" />

                <SectionHeader icon={PiggyBank} title="Eficiência Tributária" description="Recuperação de créditos e monitoramento da carga." />
                <ChartCard title="Segregação de Receita" subtitle="Impacto no PIS/COFINS" onDownload={() => baixarRelatorio('fiscal_segregacao')}>
                   <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={mockFiscalSegregacao} innerRadius={70} outerRadius={90} dataKey="value" paddingAngle={4} stroke="white" strokeWidth={3}>{mockFiscalSegregacao.map((e, i) => <Cell key={i} fill={[BRAND.amber, BRAND.slate, BRAND.teal][i % 3]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" iconType="circle" /></PieChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Economia Gerada" subtitle="Imposto Pago vs Economizado" className="md:col-span-2" onDownload={() => baixarRelatorio('fiscal_economia')}>
                   <ResponsiveContainer width="100%" height="100%"><BarChart data={mockFiscalEconomia} margin={{top: 20, right: 20}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} /><XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><Tooltip content={<CustomTooltipContent />} /><Legend verticalAlign="top" iconType="circle" /><Bar dataKey="pago" name="Pago" stackId="a" fill={BRAND.pink} radius={[0,0,4,4]} fillOpacity={0.6} /><Bar dataKey="economizado" name="Economizado" stackId="a" fill={BRAND.teal} radius={[8,8,0,0]} /></BarChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Evolução Carga Tributária" onDownload={() => baixarRelatorio('fiscal_carga')}>
                   <ResponsiveContainer width="100%" height="100%"><ComposedChart data={mockFiscalCarga} margin={{top: 20, right: 0, left: -10, bottom: 0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.grid} /><XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} dy={10} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: BRAND.slate}} /><YAxis yAxisId="right" orientation="right" unit="%" axisLine={false} tickLine={false} tick={{fill: BRAND.purple, fontWeight: 'bold'}} /><Tooltip content={<CustomTooltipContent />} /><Legend verticalAlign="top" align="right" /><Bar yAxisId="left" dataKey="fat" name="Faturamento" fill={BRAND.grid} barSize={40} radius={[8,8,0,0]} /><Line yAxisId="right" type="monotone" dataKey="carga" name="Carga (%)" stroke={BRAND.purple} strokeWidth={4} dot={{r:5, fill: BRAND.purple, stroke: 'white', strokeWidth: 2}} /></ComposedChart></ResponsiveContainer>
                </ChartCard>

                <SectionHeader icon={ShieldAlert} title="Compliance e Operações" description="Auditoria de cadastro e operações fiscais (CFOP)." />
                <ChartCard title="Operações Fiscais" onDownload={() => baixarRelatorio('fiscal_cfop')}>
                   <ResponsiveContainer width="100%" height="100%"><BarChart data={mockFiscalCFOP} layout="vertical" margin={{left: 20, right: 20, top: 20}}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={BRAND.grid} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: BRAND.dark, fontWeight: 600}} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltipContent />} /><Bar dataKey="value" name="Qtd" radius={[0,10,10,0]} barSize={32}>{mockFiscalCFOP.map((e, i) => <Cell key={i} fill={[BRAND.teal, BRAND.pink, BRAND.softPink][i % 3]} stroke="white" strokeWidth={2} />)}</Bar></BarChart></ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Auditoria de Cadastro" className="md:col-span-2" onDownload={() => baixarRelatorio('auditoria')}>
                    <ResponsiveContainer width="100%" height="100%"><BarChart data={mockAuditoria} layout="vertical" margin={{top: 10}}><XAxis type="number" hide/><YAxis dataKey="item" type="category" width={80} tick={{fill: BRAND.slate}}/><Tooltip/><Bar dataKey="qtd" fill={BRAND.teal} radius={[0,4,4,0]} barSize={30} /></BarChart></ResponsiveContainer>
                </ChartCard>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

// ============= COMPONENTES DE APOIO INTERNOS =============
const CustomTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-2xl rounded-xl p-4 min-w-[150px]">
        <p className="font-bold text-slate-400 text-[10px] mb-3 uppercase tracking-wider">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-[#334155] text-xs font-semibold">{entry.name}</span>
            </div>
            <span className="font-bold text-[#334155] text-xs tabular-nums">
               {typeof entry.value === 'number' && Math.abs(entry.value) > 100 ? `R$ ${Math.abs(entry.value).toLocaleString('pt-BR')}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};