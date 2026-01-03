import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit, Trash2, Package, RefreshCw, X, History, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "react-hot-toast";
import HistoricoAuditoria from "@/components/produtos/HistoricoAuditoria";
import api from "@/services/api";

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [termoExibido, setTermoExibido] = useState("");
  const [produtoParaAuditoria, setProdutoParaAuditoria] = useState(null);

  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const buscarDados = async (termo = "", pagina = 0) => {
    setLoading(true);
    try {
      // Monta a URL com paginação
      const params = new URLSearchParams();
      if (termo) params.append("busca", termo);
      params.append("page", pagina);
      params.append("size", 10); // 10 itens por página
      params.append("sort", "descricao,asc");

      const response = await api.get(`/api/v1/produtos?${params.toString()}`);

      // CORREÇÃO CRÍTICA: Detecta se é Page (response.data.content) ou List (response.data)
      const dadosBrutos = response.data.content || response.data || [];

      const listaFormatada = dadosBrutos.map(p => ({
        id: p.id,
        nome: p.descricao || "Sem Descrição",
        codigo: p.codigoBarras || "---",
        marca: p.marca || "Genérico",
        ncm: p.ncm || "S/ NCM",
        preco: Number(p.precoVenda || 0),
        estoqueTotal: Number(p.quantidadeEmEstoque || 0),
        // Campos opcionais (podem não vir no DTO simples)
        estoqueFiscal: p.estoqueFiscal ? Number(p.estoqueFiscal) : 0,
        estoqueNaoFiscal: p.estoqueNaoFiscal ? Number(p.estoqueNaoFiscal) : 0,
        ativo: p.ativo !== false
      }));

      setProdutos(listaFormatada);

      // Atualiza o total de páginas se vier do backend
      if (response.data.totalPages) {
        setTotalPaginas(response.data.totalPages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega na montagem
  useEffect(() => { buscarDados(); }, []);

  const executarBusca = () => {
    const valor = inputRef.current?.value || "";
    setTermoExibido(valor);
    setPaginaAtual(0); // Reseta para a primeira página ao buscar
    buscarDados(valor, 0);
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
    setPaginaAtual(0);
    buscarDados("", 0);
  };

  const handleDelete = async (produto) => {
    toast((t) => (
      <span>
        Inativar <b>{produto.nome}</b>?
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="destructive" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/api/v1/produtos/${produto.codigo}`);
              // Remove da lista localmente para feedback instantâneo
              setProdutos(prev => prev.filter(p => p.id !== produto.id));
              toast.success("Produto inativado!");
            } catch (err) {
              toast.error("Erro ao inativar.");
            }
          }}>Confirmar</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Cancelar</Button>
        </div>
      </span>
    ), { duration: 5000 });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* MODAL DE HISTÓRICO */}
      <Sheet open={!!produtoParaAuditoria} onOpenChange={() => setProdutoParaAuditoria(null)}>
        <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <History className="text-[#34BFBF]" /> Histórico de Alterações
            </SheetTitle>
            {produtoParaAuditoria && (
                <div className="text-sm text-slate-500 italic">
                    Auditoria de: <span className="font-bold text-slate-700">{produtoParaAuditoria.nome}</span>
                </div>
            )}
          </SheetHeader>
          {produtoParaAuditoria && <HistoricoAuditoria produtoId={produtoParaAuditoria.id} />}
        </SheetContent>
      </Sheet>

      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#34BFBF] flex items-center gap-2">
            <Package className="h-8 w-8" /> Catálogo de Produtos
          </h1>
          <p className="text-slate-500 text-sm">Gerencie preços, estoque e regras fiscais.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => buscarDados(termoExibido, paginaAtual)}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate("/produtos/novo")} className="bg-[#F22998] hover:bg-[#d91e85] text-white">
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative flex items-center">
        <Search className="absolute left-7 h-5 w-5 text-slate-400" />
        <Input
          ref={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-12 h-12 border-slate-200 focus:ring-[#34BFBF] focus:border-[#34BFBF]"
          placeholder="Pesquisar por nome, marca ou código de barras..."
        />
        {termoExibido && (
          <button onClick={limparBusca} className="absolute right-7 p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-4 w-4 text-slate-400"/>
          </button>
        )}
      </div>

      {/* TABELA DE DADOS */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Produto</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Marca</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Preço Venda</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Estoque</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && produtos.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-400">Carregando catálogo...</td></tr>
              ) : produtos.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-400">Nenhum produto encontrado.</td></tr>
              ) : produtos.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{prod.nome}</div>
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {prod.codigo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {prod.marca}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#F22998]">
                    {prod.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${prod.estoqueTotal <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {prod.estoqueTotal} un
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setProdutoParaAuditoria(prod)} title="Ver Auditoria">
                            <History className="h-4 w-4 text-slate-400 hover:text-[#34BFBF]" />
                        </Button>
                        <Link to={`/produtos/editar/${prod.id}`}>
                            <Button size="icon" variant="ghost" className="text-blue-500 hover:bg-blue-50"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(prod)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ COM PAGINAÇÃO */}
        {totalPaginas > 1 && (
            <div className="bg-slate-50 p-4 border-t flex justify-center items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual === 0}
                    onClick={() => { setPaginaAtual(p => p - 1); buscarDados(termoExibido, paginaAtual - 1); }}
                >
                    Anterior
                </Button>
                <span className="text-xs font-medium text-slate-600">
                    Página <span className="font-bold">{paginaAtual + 1}</span> de {totalPaginas}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual + 1 >= totalPaginas}
                    onClick={() => { setPaginaAtual(p => p + 1); buscarDados(termoExibido, paginaAtual + 1); }}
                >
                    Próxima
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}