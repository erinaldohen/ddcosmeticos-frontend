import { useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import {
  FileText, BarChart2, PieChart, TrendingUp, Download,
  CalendarRange, PackageCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Relatorios() {
  const [loadingRelatorio, setLoadingRelatorio] = useState(null);

  // Função genérica para baixar relatórios (PDF/Excel)
  const gerarRelatorio = async (tipo, endpoint) => {
    setLoadingRelatorio(tipo);
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      // Cria link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Relatório de ${tipo} gerado com sucesso!`);
    } catch (error) {
      toast.error("Erro ao gerar relatório. Tente novamente.");
      console.error(error);
    } finally {
      setLoadingRelatorio(null);
    }
  };

  const CardRelatorio = ({ titulo, descricao, icon: Icon, tipo, endpoint, cor }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cor} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${cor.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">{titulo}</h3>
      <p className="text-slate-500 text-sm mb-6 h-10">{descricao}</p>
      <Button
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        onClick={() => gerarRelatorio(tipo, endpoint)}
        disabled={loadingRelatorio === tipo}
      >
        {loadingRelatorio === tipo ? (
          <span className="animate-spin mr-2">⏳</span>
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {loadingRelatorio === tipo ? "Gerando..." : "Baixar PDF"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-[#F22998]" /> Central de Relatórios
        </h1>
        <p className="text-slate-500 mt-1">Extraia insights detalhados sobre sua operação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardRelatorio
          titulo="Vendas Diárias"
          descricao="Extrato detalhado de todas as vendas do dia atual com meios de pagamento."
          icon={TrendingUp}
          tipo="vendas_dia"
          endpoint="/api/v1/relatorios/vendas/diario"
          cor="bg-emerald-500"
        />
        <CardRelatorio
          titulo="Estoque Crítico"
          descricao="Produtos com quantidade abaixo do mínimo ou zerados."
          icon={AlertCircle}
          tipo="estoque_critico"
          endpoint="/api/v1/relatorios/estoque/critico"
          cor="bg-red-500"
        />
        <CardRelatorio
          titulo="Curva ABC"
          descricao="Ranking dos produtos mais vendidos e que geram mais receita."
          icon={PieChart}
          tipo="curva_abc"
          endpoint="/api/v1/relatorios/vendas/abc"
          cor="bg-blue-500"
        />
        <CardRelatorio
          titulo="Fechamento de Caixa"
          descricao="Resumo financeiro de entradas, saídas e sangrias do período."
          icon={PackageCheck}
          tipo="fechamento"
          endpoint="/api/v1/relatorios/financeiro/fechamento"
          cor="bg-purple-500"
        />
      </div>

      {/* ÁREA DE FILTROS AVANÇADOS (VISUAL) */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
        <CalendarRange className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700">Relatórios Personalizados</h3>
        <p className="text-slate-500 text-sm mb-4">Precisa de um período específico?</p>
        <Button variant="outline" className="border-slate-300">
          Selecionar Período e Gerar
        </Button>
      </div>
    </div>
  );
}