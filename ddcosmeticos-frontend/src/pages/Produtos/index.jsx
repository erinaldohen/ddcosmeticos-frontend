import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit, Trash2, Package, RefreshCw, Layers, Tag, X, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import HistoricoAuditoria from "@/components/produtos/HistoricoAuditoria";
import api from "@/services/api";

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [termoExibido, setTermoExibido] = useState("");
  const [produtoParaAuditoria, setProdutoParaAuditoria] = useState(null);

  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const buscarDados = async (termo = "") => {
    setLoading(true);
    try {
      const url = termo ? `/api/v1/produtos?busca=${termo}` : "/api/v1/produtos";
      const response = await api.get(url);

      const listaFormatada = response.data.map(p => ({
        id: p.id,
        nome: p.descricao || "Sem Descrição",
        codigo: p.codigoBarras || "---",
        marca: p.marca || "Genérico",
        ncm: p.ncm || "S/ NCM",
        preco: Number(p.precoVenda || 0),
        estoque: Number(p.quantidadeEmEstoque || 0),
        ativo: p.ativo !== false
      }));

      setProdutos(termo ? listaFormatada : listaFormatada.filter(p => p.ativo));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscarDados(); }, []);

  const executarBusca = () => {
    const valor = inputRef.current?.value || "";
    setTermoExibido(valor);
    buscarDados(valor);
  };

  const handleInputChange = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => executarBusca(), 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      executarBusca();
    }
  };

  const limparBusca = () => {
    if (inputRef.current) inputRef.current.value = "";
    setTermoExibido("");
    buscarDados("");
  };

  const handleDelete = async (produto) => {
    if (confirm(`Inativar "${produto.nome}"?`)) {
      try {
        await api.delete(`/api/v1/produtos/${produto.codigo}`);
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
      } catch (error) {
        alert("Erro ao inativar.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* MODAL DE AUDITORIA (SIDEBAR) */}
      <Sheet open={!!produtoParaAuditoria} onOpenChange={() => setProdutoParaAuditoria(null)}>
        <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <History className="text-[#34BFBF]" /> Auditoria de Produto
            </SheetTitle>
            {produtoParaAuditoria && (
                <div className="text-sm text-slate-500">
                    Exibindo histórico de: <span className="font-bold">{produtoParaAuditoria.nome}</span>
                </div>
            )}
          </SheetHeader>
          {produtoParaAuditoria && <HistoricoAuditoria produtoId={produtoParaAuditoria.id} />}
        </SheetContent>
      </Sheet>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#34BFBF] flex items-center gap-2">
            <Package className="h-8 w-8" /> Catálogo
          </h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={limparBusca}><RefreshCw className={loading ? 'animate-spin' : ''} /></Button>
            <Button onClick={() => navigate("/produtos/novo")} className="bg-[#F22998] hover:bg-[#d91e85]">
                <Plus className="mr-2 h-4 w-4" /> Novo
            </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
        <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-12 h-12 border-slate-200 focus:border-[#34BFBF]"
          placeholder="Código de barras ou nome..."
        />
        {termoExibido && <button onClick={limparBusca} className="absolute right-7 top-7"><X className="h-4 w-4 text-slate-400"/></button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Produto</th>
              <th className="px-6 py-4 text-left">Marca</th>
              <th className="px-6 py-4 text-left">Preço</th>
              <th className="px-6 py-4 text-center">Estoque</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {produtos.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{prod.nome}</div>
                  <div className="text-xs font-mono text-slate-400">{prod.codigo}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{prod.marca}</span>
                </td>
                <td className="px-6 py-4 font-bold text-[#F22998]">
                  {prod.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${prod.estoque <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {prod.estoque} un
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setProdutoParaAuditoria(prod)} title="Ver Auditoria">
                    <History className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Link to={`/produtos/editar/${prod.id}`}>
                    <Button size="icon" variant="ghost" className="text-blue-500"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(prod)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}