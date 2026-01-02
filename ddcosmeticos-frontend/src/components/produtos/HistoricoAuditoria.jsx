import { useState, useEffect } from "react";
import { History, User, Calendar, Tag, Package, Loader2 } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoricoAuditoria({ produtoId }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (produtoId) carregarHistorico();
  }, [produtoId]);

  const carregarHistorico = async () => {
    try {
      const res = await api.get(`/api/v1/produtos/${produtoId}/historico`);
      setHistorico(res.data);
    } catch (error) {
      console.error("Erro ao carregar auditoria");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#34BFBF]"/></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-[#F26BB5]" /> Linha do Tempo de Alterações
      </h3>

      {historico.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 border-2 border-dashed rounded-xl">
          Nenhuma alteração registrada para este produto.
        </p>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
          {historico.map((item, index) => (
            <div key={index} className="relative pl-8">
              {/* Círculo da Timeline */}
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-[#34BFBF]"></div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.dataHora), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                    <User className="h-3 w-3" /> {item.usuarioResponsavel}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Descrição na época</span>
                    <p className="text-sm text-slate-700 font-medium">{item.descricao}</p>
                  </div>

                  <div className="flex gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Preço</span>
                      <div className="flex items-center gap-1 text-[#34BFBF] font-bold">
                        <Tag className="h-3 w-3" />
                        R$ {Number(item.precoVenda).toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estoque</span>
                      <div className="flex items-center gap-1 text-[#F26BB5] font-bold">
                        <Package className="h-3 w-3" />
                        {item.quantidadeEmEstoque} un
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}