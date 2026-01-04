import { useState } from "react";
import { Package, Search, Save, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import api from "@/services/api";

export default function Estoque() {
  const [busca, setBusca] = useState("");
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form de Ajuste
  const [ajuste, setAjuste] = useState({ quantidade: "", motivo: "AJUSTE_ENTRADA", observacao: "" });

  const buscarProduto = async () => {
    if(!busca) return;
    setLoading(true);
    try {
        // Busca exata por código de barras primeiro
        const { data } = await api.get(`/api/v1/produtos?busca=${busca}`);
        const lista = data.content || data;

        if(lista.length > 0) {
            setProduto(lista[0]); // Pega o primeiro encontrado
            setAjuste({ quantidade: "", motivo: "AJUSTE_ENTRADA", observacao: "" });
        } else {
            toast.error("Produto não encontrado.");
            setProduto(null);
        }
    } catch (e) {
        toast.error("Erro na busca.");
    } finally {
        setLoading(false);
    }
  };

  const realizarAjuste = async (e) => {
      e.preventDefault();
      if(!ajuste.quantidade || !produto) return;

      try {
          const payload = {
              codigoBarras: produto.codigoBarras,
              quantidade: Number(ajuste.quantidade),
              motivo: ajuste.motivo, // Enum deve bater com o Backend
              observacao: ajuste.observacao
          };

          await api.post("/api/v1/estoque/ajuste", payload);

          toast.success("Estoque atualizado com sucesso!");
          setProduto(null);
          setBusca("");
          setAjuste({ quantidade: "", motivo: "AJUSTE_ENTRADA", observacao: "" });
      } catch (error) {
          const msg = error.response?.data?.message || "Erro ao atualizar estoque";
          toast.error(msg);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
        <h1 className="text-2xl font-bold text-[#34BFBF] flex items-center gap-2">
            <Package className="h-6 w-6" /> Controle de Estoque
        </h1>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
            <div className="flex gap-2 mb-6">
                <Input
                    placeholder="Digite o código de barras ou nome..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && buscarProduto()}
                />
                <Button onClick={buscarProduto} disabled={loading} className="bg-[#34BFBF] hover:bg-[#2aa8a8]">
                    <Search className="h-4 w-4"/>
                </Button>
            </div>

            {produto && (
                <div className="animate-in slide-in-from-top-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                        <h3 className="font-bold text-lg text-slate-800">{produto.descricao}</h3>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                            <span>Cod: {produto.codigoBarras}</span>
                            <span className="font-bold text-[#F22998]">Estoque Atual: {produto.quantidadeEmEstoque}</span>
                        </div>
                    </div>

                    <form onSubmit={realizarAjuste} className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Tipo Movimentação</label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-300 px-3 bg-white text-sm"
                                    value={ajuste.motivo}
                                    onChange={e => setAjuste({...ajuste, motivo: e.target.value})}
                                >
                                    <optgroup label="Entradas">
                                        <option value="AJUSTE_ENTRADA">Entrada (Ajuste/Sobra)</option>
                                        <option value="COMPRA_FORNECEDOR">Compra</option>
                                    </optgroup>
                                    <optgroup label="Saídas">
                                        <option value="AJUSTE_SAIDA">Saída (Ajuste)</option>
                                        <option value="PERDA_OU_QUEBRA">Perda / Quebra</option>
                                        <option value="USO_INTERNO">Uso Interno</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantidade</label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={ajuste.quantidade}
                                    onChange={e => setAjuste({...ajuste, quantidade: e.target.value})}
                                    placeholder="Ex: 10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Observação</label>
                            <Input
                                value={ajuste.observacao}
                                onChange={e => setAjuste({...ajuste, observacao: e.target.value})}
                                placeholder="Motivo detalhado..."
                            />
                        </div>

                        <Button type="submit" className="w-full bg-[#F22998] hover:bg-[#d91e85] font-bold">
                            <Save className="mr-2 h-4 w-4"/> Confirmar Ajuste
                        </Button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
}