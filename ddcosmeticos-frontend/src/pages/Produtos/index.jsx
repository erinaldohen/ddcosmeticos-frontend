import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit, Trash2, Package, RefreshCw, Layers, Tag, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado apenas para mostrar "Nenhum resultado para X" e controlar o botão X
  const [termoExibido, setTermoExibido] = useState("");

  // REFERÊNCIA DIRETA AO INPUT (Evita re-renderizar a cada tecla)
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

      // Se tiver termo de busca, mostra tudo (inclusive inativos se for busca exata)
      // Se for listagem geral, filtra os ativos
      if (termo) {
          setProdutos(listaFormatada);
      } else {
          setProdutos(listaFormatada.filter(p => p.ativo));
      }

    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // --- LÓGICA OTIMIZADA PARA LEITOR ---

  // Função que realmente dispara a ação
  const executarBusca = () => {
    const valor = inputRef.current?.value || "";
    setTermoExibido(valor); // Atualiza visualmente só agora
    buscarDados(valor);
  };

  const handleInputChange = () => {
    // NÃO chamamos setBusca aqui para não travar a tela.
    // Apenas reiniciamos o timer.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
        executarBusca();
    }, 500);
  };

  const handleKeyDown = (e) => {
      // O leitor de código de barras geralmente envia um "Enter" no final.
      // Isso faz a busca ser instantânea assim que o leitor termina.
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
    if (confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
      try {
        await api.delete(`/api/v1/produtos/${produto.codigo}`);
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
      } catch (error) {
        alert("Erro ao excluir. Verifique se o produto tem vendas vinculadas.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
            <Package className="h-8 w-8" /> Catálogo de Produtos
          </h1>
          <p className="text-slate-500">Gerencie estoque, preços e dados fiscais.</p>
        </div>

        <div className="flex gap-2">
            <Button variant="outline" onClick={limparBusca} title="Recarregar">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate("/produtos/novo")} className="bg-[#F22998] hover:bg-[#d91e85] text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

          {/* INPUT OTIMIZADO (NÃO CONTROLADO) */}
          <Input
            ref={inputRef}
            placeholder="Escaneie o código ou digite o nome..."
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pl-10 border-slate-200 focus:border-[#34BFBF]"
            autoFocus
            defaultValue="" // Importante: não usar "value={busca}"
          />

          {termoExibido && (
              <button
                onClick={limparBusca}
                className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
              >
                  <X className="h-4 w-4"/>
              </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#34BFBF]"/>
                Buscando produtos...
            </div>
        ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-[#F2F2F2]">
                <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-bold text-slate-600">Produto</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600">Marca / NCM</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600">Preço</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-600">Estoque</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {produtos.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">
                            Nenhum produto encontrado para "{termoExibido}".
                        </td>
                    </tr>
                ) : (
                    produtos.map((prod) => (
                    <tr key={prod.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">{prod.nome}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                    {prod.codigo}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                                {prod.marca && prod.marca !== "Genérico" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                        <Layers className="h-3 w-3" /> {prod.marca}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                    <Tag className="h-3 w-3" /> {prod.ncm}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#F22998]">
                            {prod.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                prod.estoque <= 5
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                                {prod.estoque} un
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100">
                                <Link to={`/produtos/editar/${prod.id}`}>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:bg-blue-50">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(prod)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                )))}
            </tbody>
            </table>
        </div>
        )}
      </div>
    </div>
  );
}