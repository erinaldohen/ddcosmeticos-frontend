import { useState, useEffect } from "react";
import { Search, Plus, Trash2, ShoppingCart, CreditCard, Check, User, AlertCircle, Sparkles, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/services/db";
import { Cupom } from "@/components/Impressao/Cupom";
import { useNavigate } from "react-router-dom";

export default function PDV() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState("Consumidor Final");
  const [pagamento, setPagamento] = useState("Dinheiro");

  const [produtos, setProdutos] = useState([]);
  const [clientesLista, setClientesLista] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [vendaConcluida, setVendaConcluida] = useState(null);

  useEffect(() => {
    const prods = db.getProdutos().map(p => ({
        ...p,
        preco: Number(p.preco) || 0,
        estoque: Number(p.estoque) || 0
    }));
    setProdutos(prods);
    setClientesLista(db.getClientes());
  }, []);

  useEffect(() => {
    if (busca.trim() === "") {
      setProdutosFiltrados([]);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = produtos.filter(p =>
        (p.nome && p.nome.toLowerCase().includes(termo)) ||
        (p.codigo && p.codigo.toLowerCase().includes(termo))
      );
      setProdutosFiltrados(filtrados.slice(0, 5));
    }
  }, [busca, produtos]);

  const adicionarAoCarrinho = (produto) => {
    if (produto.estoque <= 0) {
      alert("Produto sem estoque físico!");
      return;
    }
    const itemExistente = carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
      if (itemExistente.qtd + 1 > produto.estoque) {
        alert("Limite de estoque atingido!");
        return;
      }
      setCarrinho(carrinho.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item));
    } else {
      setCarrinho([...carrinho, { ...produto, qtd: 1 }]);
    }
    setBusca("");
    setProdutosFiltrados([]);
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) return;
    const venda = {
      cliente,
      itens: carrinho,
      total: calcularTotal(),
      metodo: pagamento,
      desconto: 0,
      data: new Date().toISOString()
    };
    const vendaSalva = db.salvarVenda(venda);
    const produtosAtualizados = produtos.map(p => {
        const itemVendido = carrinho.find(i => i.id === p.id);
        if(itemVendido) return { ...p, estoque: p.estoque - itemVendido.qtd };
        return p;
    });
    setProdutos(produtosAtualizados);
    setVendaConcluida(vendaSalva);
  };

  const fecharCupomEResetar = () => {
    setVendaConcluida(null);
    setCarrinho([]);
    setCliente("Consumidor Final");
    setPagamento("Dinheiro");
    setBusca("");
  };

  const total = calcularTotal();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 font-sans">

      {vendaConcluida && <Cupom venda={vendaConcluida} onClose={fecharCupomEResetar} />}

      {/* LADO ESQUERDO: Catálogo */}
      <div className="flex-1 flex flex-col gap-6">

        {/* Header e Busca */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative z-20">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/vendas")} className="text-slate-400 hover:text-[#34BFBF]">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#34BFBF]">
                <Sparkles className="h-6 w-6"/> Frente de Caixa
            </h2>
          </div>

          <div className="relative">
            <Input
              placeholder="Digite nome, código ou use o leitor..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              // Foco em #F22998 (Rosa) para indicar ação
              className="pl-4 h-14 text-lg border-slate-200 focus:border-[#F22998] focus:ring-[#F22998] rounded-xl shadow-inner bg-slate-50"
              autoFocus
            />
            <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                <Search className="h-6 w-6" />
            </div>

            {produtosFiltrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-b-xl shadow-2xl mt-1 overflow-hidden z-50">
                {produtosFiltrados.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => adicionarAoCarrinho(prod)}
                    className="p-4 hover:bg-[#F26BB5]/10 cursor-pointer border-b last:border-0 flex justify-between items-center group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{prod.nome}</div>
                      <div className="text-sm text-slate-400">Cód: {prod.codigo || 'S/C'} | Estoque: {prod.estoque}</div>
                    </div>
                    {/* Preço em Rosa Forte */}
                    <div className="font-bold text-[#F22998] text-xl group-hover:scale-110 transition-transform">
                      R$ {(Number(prod.preco) || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atalhos Rápidos */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Tag className="h-3 w-3" /> Mais Vendidos
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {produtos.slice(0, 9).map(prod => (
                    <button
                        key={prod.id}
                        disabled={prod.estoque <= 0}
                        onClick={() => adicionarAoCarrinho(prod)}
                        className="p-4 border border-slate-100 rounded-xl hover:border-[#F22998] hover:bg-white hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group relative overflow-hidden bg-slate-50/50"
                    >
                        <span className="font-bold text-sm text-slate-700 line-clamp-2 z-10">{prod.nome}</span>
                        <div className="flex justify-between items-end mt-2 w-full z-10">
                            <span className="font-bold text-[#F22998] text-base group-hover:text-[#F22998]">
                                R$ {(Number(prod.preco) || 0).toFixed(2)}
                            </span>
                            {prod.estoque <= 0 ? (
                                <AlertCircle className="h-5 w-5 text-slate-300" />
                            ) : (
                                // Botãozinho '+' em Rosa
                                <div className="h-6 w-6 bg-[#F22998] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#F22998]/40 group-hover:scale-110 transition-transform">
                                    <Plus className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* LADO DIREITO: Carrinho */}
      <div className="w-full md:w-[420px] bg-white flex flex-col border border-slate-100 shadow-2xl z-10 h-full fixed right-0 top-0 md:relative md:h-auto md:rounded-2xl overflow-hidden">

        {/* Header do Carrinho: TURQUESA #34BFBF */}
        <div className="p-6 bg-[#34BFBF] text-white flex justify-between items-center shadow-lg shadow-[#34BFBF]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShoppingCart className="h-24 w-24 transform rotate-12 -mr-8 -mt-8" />
            </div>
            <h2 className="font-bold text-xl flex items-center gap-2 z-10">
                <ShoppingCart className="h-6 w-6"/> Caixa Aberto
            </h2>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold border border-white/30 z-10">
                {carrinho.reduce((acc, i) => acc + i.qtd, 0)} itens
            </span>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F2F2F2]/50">
            {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingCart className="h-16 w-16 mb-4 opacity-20"/>
                    <p className="font-medium text-slate-400">Caixa Livre</p>
                    <p className="text-sm">Aguardando produtos...</p>
                </div>
            ) : (
                carrinho.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-5 group">
                        <div className="flex-1">
                            <div className="font-bold text-sm text-slate-700 line-clamp-1">{item.nome}</div>
                            <div className="text-xs text-slate-400 mt-0.5 font-medium">
                                {item.qtd}x R$ {(Number(item.preco)||0).toFixed(2)}
                            </div>
                        </div>
                        <div className="text-right mx-3">
                            <div className="font-bold text-[#34BFBF]">
                                R$ {((item.qtd * (Number(item.preco)||0))).toFixed(2)}
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => removerDoCarrinho(item.id)}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))
            )}
        </div>

        {/* Área de Checkout */}
        <div className="bg-white p-6 border-t border-slate-100 space-y-5 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-20">

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                        <User className="h-3 w-3" /> Cliente
                    </label>
                    <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:border-[#34BFBF] outline-none transition-colors"
                        value={cliente}
                        onChange={e => setCliente(e.target.value)}
                    >
                        <option value="Consumidor Final">Consumidor Final</option>
                        {clientesLista.map(c => (
                            <option key={c.id} value={c.nome}>{c.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Pagamento
                    </label>
                    <select
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:border-[#34BFBF] outline-none transition-colors"
                        value={pagamento}
                        onChange={e => setPagamento(e.target.value)}
                    >
                        {['Dinheiro', 'PIX', 'Crédito', 'Débito', 'Crediário'].map(metodo => (
                            <option key={metodo} value={metodo}>{metodo}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pt-2">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 font-medium text-sm">Total a Pagar</span>
                    {/* TOTAL EM ROSA FORTE #F22998 */}
                    <span className="text-4xl font-bold text-[#F22998] tracking-tight">
                        {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                    </span>
                </div>
                {/* BOTÃO FINALIZAR: Rosa Forte */}
                <Button
                    className="w-full h-14 text-lg font-bold bg-[#F22998] hover:bg-[#d91e85] shadow-lg shadow-[#F22998]/30 active:scale-95 transition-all rounded-xl"
                    onClick={finalizarVenda}
                    disabled={carrinho.length === 0}
                >
                    <Check className="mr-2 h-6 w-6" /> Finalizar Venda
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}