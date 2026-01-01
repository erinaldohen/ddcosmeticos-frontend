import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Package, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api"; // <--- Importando a API Real

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // Função para carregar dados do Java
  const carregarProdutos = async () => {
    setLoading(true);
    try {
      // Chama o Backend: GET http://localhost:8080/api/v1/produtos
      const response = await api.get("/api/v1/produtos");

      // Mapeia os campos do Java para o formato que o React já esperava
      const listaFormatada = response.data.map(p => ({
        id: p.id,
        nome: p.descricao,              // Java: descricao -> React: nome
        codigo: p.codigoBarras,         // Java: codigoBarras -> React: codigo
        preco: Number(p.precoVenda),    // Java: precoVenda -> React: preco
        estoque: Number(p.quantidadeEmEstoque), // Java: quantidadeEmEstoque -> React: estoque
        ativo: p.ativo
      }));

      // Filtra apenas os ativos (opcional, já que o backend pode trazer inativos)
      setProdutos(listaFormatada.filter(p => p.ativo));

    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao carregar produtos. Verifique se o Backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleDelete = async (produto) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      try {
        // O Controller deleta pelo Código de Barras (EAN)
        await api.delete(`/api/v1/produtos/${produto.codigo}`);

        // Remove da lista visualmente sem precisar recarregar tudo
        setProdutos(prev => prev.filter(p => p.id !== produto.id));

      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Não foi possível excluir o produto.");
      }
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    (p.nome && p.nome.toLowerCase().includes(busca.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <Package className="h-8 w-8" /> Produtos
          </h1>
          <p className="text-slate-500">Gerencie seu catálogo de estoque.</p>
        </div>

        <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={carregarProdutos}
                disabled={loading}
                title="Recarregar Lista"
            >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
                onClick={() => navigate("/produtos/novo")}
                className="bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20"
            >
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-10 border-slate-200 focus:border-[#34BFBF] focus:ring-[#34BFBF]"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium bg-[#F2F2F2] px-4 py-2 rounded-lg border border-slate-200">
            Total: <span className="text-[#34BFBF] font-bold">{produtos.length}</span> itens
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#34BFBF]" />
                Carregando produtos do banco de dados...
            </div>
        ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
                <tr className="bg-[#F2F2F2] border-b border-slate-200">
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Produto</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Código</th>
                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Preço</th>
                <th className="px-6 py-4 text-center font-bold text-slate-600 uppercase tracking-wider text-xs">Estoque</th>
                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    Nenhum produto encontrado.
                    </td>
                </tr>
                ) : (
                produtosFiltrados.map((prod) => (
                    <tr key={prod.id} className="group hover:bg-[#34BFBF]/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{prod.nome}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {prod.codigo || "-"}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F22998]">
                        {(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            prod.estoque <= 5
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                            {prod.estoque} un
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Link to={`/produtos/editar/${prod.id}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-[#34BFBF] hover:bg-[#34BFBF]/10 hover:text-[#34BFBF]">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(prod)}
                                className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        )}
      </div>
    </div>
  );
}