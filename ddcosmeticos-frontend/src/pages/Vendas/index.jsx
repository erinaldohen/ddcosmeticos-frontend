import { useEffect, useState } from "react";
import { Plus, ShoppingCart, Search, Printer, Calendar, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/db";
import { Cupom } from "@/components/Impressao/Cupom";
import axios from "axios"; // Importamos axios diretamente para evitar o prefixo /api/v1

export default function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  // Estado para controlar qual venda está a emitir nota neste momento
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    // Carrega e inverte a ordem (mais recentes primeiro)
    setVendas(db.getVendas().reverse());
  }, []);

  const vendasFiltradas = vendas.filter(v =>
    (v.cliente && v.cliente.toLowerCase().includes(busca.toLowerCase())) ||
    (v.id && v.id.toString().includes(busca))
  );

  // Função para chamar o Backend Java
  const handleEmitirNfe = async (venda) => {
    // Inicia o loading apenas para este ID
    setLoadingId(venda.id);

    try {
      // Chama a URL direta do seu backend (baseada no IP do seu api.js)
      // Ajuste o IP aqui se o seu servidor mudar (ex: localhost)
      const response = await axios.post(`http://192.168.0.6:8080/nfe/emitir/${venda.id}`);

      // Se der certo:
      const dados = response.data;
      alert(`✅ Sucesso!\nStatus: ${dados.status} - ${dados.motivo}\nChave: ${dados.chave}`);

      // Opcional: Atualizar a venda localmente para dizer que já tem nota
      // (Isso exigiria que o db.js suportasse atualização de status)

    } catch (error) {
      console.error("Erro ao emitir:", error);

      // Tenta pegar a mensagem de erro do backend ou usa uma genérica
      const mensagemErro = error.response?.data || error.message || "Erro de conexão";
      alert(`❌ Erro ao emitir NF-e:\n${mensagemErro}`);

    } finally {
      // Para o loading independente do resultado
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Exibe o Cupom se selecionado */}
      {vendaSelecionada && (
        <Cupom venda={vendaSelecionada} onClose={() => setVendaSelecionada(null)} />
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Título Turquesa #34BFBF */}
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" /> Histórico de Vendas
          </h1>
          <p className="text-slate-500">Consulte todas as vendas realizadas.</p>
        </div>

        {/* Botão de Ação Rosa #F22998 */}
        <Button
            onClick={() => navigate("/vendas/pdv")}
            className="bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Venda (PDV)
        </Button>
      </div>

      {/* BARRA DE FERRAMENTAS */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente ou número da venda..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-10 border-slate-200 focus:border-[#34BFBF] focus:ring-[#34BFBF]"
          />
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
                <tr className="bg-[#F2F2F2] border-b border-slate-200">
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Venda</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Cliente</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Data</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Pagamento</th>
                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Total</th>
                <th className="px-6 py-4 text-center font-bold text-slate-600 uppercase tracking-wider text-xs">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {vendasFiltradas.length === 0 ? (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    Nenhuma venda encontrada.
                    </td>
                </tr>
                ) : (
                vendasFiltradas.map((venda) => (
                    <tr key={venda.id} className="group hover:bg-[#34BFBF]/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        #{venda.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                        {venda.cliente}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(venda.data).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs font-medium text-slate-600 uppercase">
                            {venda.metodo}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#F22998]">
                        {(venda.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {/* BOTÃO VER CUPOM */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-[#34BFBF] border-slate-200 hover:bg-[#34BFBF] hover:text-white hover:border-[#34BFBF]"
                            onClick={() => setVendaSelecionada(venda)}
                        >
                            <Printer className="mr-2 h-3 w-3" /> Cupom
                        </Button>

                        {/* BOTÃO NOVO: EMITIR NF-E */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                            onClick={() => handleEmitirNfe(venda)}
                            disabled={loadingId === venda.id} // Desabilita se estiver carregando
                        >
                            {loadingId === venda.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-3 w-3" />
                            )}
                            {loadingId === venda.id ? "Emitindo..." : "NF-e"}
                        </Button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}