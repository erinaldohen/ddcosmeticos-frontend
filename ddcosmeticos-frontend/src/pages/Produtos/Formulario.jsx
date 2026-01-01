import { useState, useEffect } from "react";
import { Save, ArrowLeft, Package, Calendar, Hash, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/services/db";

export default function FormularioProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const [produto, setProduto] = useState({
    nome: "",
    codigoBarras: "",
    precoVenda: "",
    precoCusto: "",
    estoqueMinimo: 0,
    ncm: "", // <--- Campo Fiscal (Backend: Produto.java)
    lote: "", // <--- Campo Rastreabilidade (Backend: LoteProduto.java)
    validade: "" // <--- Campo Rastreabilidade (Backend: EstoqueRequestDTO.java)
  });

  useEffect(() => {
    if (id) {
      const p = db.getProdutoById(id);
      if (p) setProduto(p);
    }
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sincronizando com a lógica do ProdutoController.java (Sessão 2)
      if (id) {
        db.updateProduto(id, produto);
      } else {
        db.addProduto({ ...produto, quantidadeEmEstoque: 0, ativo: true });
      }
      alert("Produto salvo com sucesso!");
      navigate("/produtos");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/produtos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-700">
          {id ? "Editar Produto" : "Novo Produto"}
        </h1>
      </div>

      <form onSubmit={handleSave} className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#F22998] flex items-center gap-2">
              <Package className="h-4 w-4" /> Dados Gerais
            </h3>
            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                required
                value={produto.nome}
                onChange={e => setProduto({...produto, nome: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Código de Barras (EAN)</Label>
              <Input
                required
                value={produto.codigoBarras}
                onChange={e => setProduto({...produto, codigoBarras: e.target.value})}
              />
            </div>
          </div>

          {/* SEÇÃO 2: FISCAL E TRIBUTAÇÃO */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#34BFBF] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Fiscal (NFC-e)
            </h3>
            <div className="space-y-2">
              <Label>NCM (8 dígitos)</Label>
              <Input
                placeholder="Ex: 33049990"
                value={produto.ncm}
                onChange={e => setProduto({...produto, ncm: e.target.value})}
              />
              <p className="text-[10px] text-slate-400">Essencial para emissão de nota fiscal.</p>
            </div>
          </div>

          {/* SEÇÃO 3: RASTREABILIDADE (LOTE E VALIDADE) */}
          <div className="space-y-4 md:col-span-2 border-t pt-6">
            <h3 className="font-bold text-orange-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Controle de Lote
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input
                  placeholder="Nº do Lote"
                  value={produto.lote}
                  onChange={e => setProduto({...produto, lote: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={produto.validade}
                  onChange={e => setProduto({...produto, validade: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input
                  type="number"
                  value={produto.estoqueMinimo}
                  onChange={e => setProduto({...produto, estoqueMinimo: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: PRECIFICAÇÃO */}
          <div className="space-y-4 md:col-span-2 border-t pt-6">
            <h3 className="font-bold text-green-600 flex items-center gap-2">
              <Hash className="h-4 w-4" /> Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço de Custo (R$)</Label>
                <Input
                  type="number" step="0.01"
                  value={produto.precoCusto}
                  onChange={e => setProduto({...produto, precoCusto: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda (R$)</Label>
                <Input
                  type="number" step="0.01"
                  value={produto.precoVenda}
                  onChange={e => setProduto({...produto, precoVenda: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#F22998] hover:bg-[#d91e85] text-white font-bold"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}