import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { formatarMoeda, formatarDataCurta } from "@/lib/formatters";
import {
  Search, Calendar, CheckCircle, XCircle, Clock,
  MoreHorizontal, Eye, Filter, ArrowRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Vendas() {
  const [pagina, setPagina] = useState(0);
  const [termo, setTermo] = useState("");

  // --- QUERY DE DADOS ---
  const { data, isLoading, isError, isPlaceholderData, refetch, isRefetching } = useQuery({
    queryKey: ['vendas', pagina, termo],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pagina,
        size: 10,
        sort: 'dataVenda,desc',
        // Envia busca se houver (requer suporte no backend, mas não quebra se não tiver)
        ...(termo && { busca: termo })
      });
      const res = await api.get(`/api/v1/vendas?${params.toString()}`);
      return res.data;
    },
    placeholderData: (prev) => prev, // Mantém dados antigos enquanto carrega novos
    refetchInterval: 30000, // Atualiza a cada 30s
  });

  const vendas = data?.content || [];
  const totalPaginas = data?.totalPages || 0;

  // Componente interno para Status
  const StatusBadge = ({ status }) => {
    const map = {
      APROVADA: { variant: "default", className: "bg-emerald-500 hover:bg-emerald-600 border-none" },
      PENDENTE: { variant: "secondary", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
      CANCELADA: { variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200 border-none" },
      ORCAMENTO: { variant: "outline", className: "text-blue-500 border-blue-200" }
    };

    const config = map[status] || { variant: "outline", className: "text-slate-500" };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Histórico de Vendas</h1>
          <p className="text-slate-500 text-sm">Monitore todas as transações em tempo real.</p>
        </div>
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className={isRefetching ? "animate-spin" : ""}
            >
                <RefreshCw className="h-4 w-4 text-slate-400" />
            </Button>
            <Link to="/vendas/pdv">
              <Button className="bg-[#34BFBF] hover:bg-[#2aa8a8] text-white shadow-md">
                <ArrowRight className="mr-2 h-4 w-4" /> Abrir Caixa (PDV)
              </Button>
            </Link>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente ou documento..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={termo}
            onChange={(e) => { setTermo(e.target.value); setPagina(0); }}
          />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-[#34BFBF] hover:border-[#34BFBF]">
              <Calendar className="mr-2 h-4 w-4" /> Data
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-[#34BFBF] hover:border-[#34BFBF]">
              <Filter className="mr-2 h-4 w-4" /> Status
            </Button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Forma Pagto</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : vendas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      Nenhuma venda encontrada.
                    </td>
                  </tr>
                ) : (
                  vendas.map((venda) => (
                    // IMPORTANTE: venda.idVenda (DTO) vs venda.id (Entity)
                    <tr key={venda.idVenda} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{formatarDataCurta(venda.dataVenda)}</span>
                            <span className="text-[10px] text-slate-400">
                                {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{venda.clienteNome || "Consumidor Final"}</div>
                        <div className="text-[10px] text-slate-400 font-normal font-mono">
                            {venda.clienteDocumento || "---"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {venda.formaPagamento ? venda.formaPagamento.replace('_', ' ') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={venda.statusFiscal} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800 text-base">
                        {/* IMPORTANTE: Usa valorTotal, não totalVenda */}
                        {formatarMoeda(venda.valorTotal)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#34BFBF] hover:bg-slate-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>

        {/* PAGINAÇÃO */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            variant="outline" size="sm"
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            disabled={pagina === 0 || isLoading}
          >
            Anterior
          </Button>
          <span className="text-xs font-medium text-slate-500">
            Página <span className="font-bold text-slate-700">{pagina + 1}</span> de {totalPaginas || 1}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPagina(p => (isPlaceholderData || !data?.last ? p + 1 : p))}
            disabled={isPlaceholderData || data?.last || isLoading}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}