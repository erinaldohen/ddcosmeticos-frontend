import { useState, useEffect } from "react";
import { Search, Plus, Trash2, ShoppingCart, CreditCard, Check, User, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/services/db";
import { Cupom } from "@/components/Impressao/Cupom";

export default function PDV() {
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState("Consumidor Final");
  const [pagamento, setPagamento] = useState("Dinheiro");

  const [produtos, setProdutos] = useState([]);
  const [clientesLista, setClientesLista] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [vendaConcluida, setVendaConcluida] = useState(null);

  useEffect(() => {
    // Carrega produtos garantindo que preço seja número
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
        alert("Quantidade solicitada maior que o estoque!");
        return;
      }
      setCarrinho(carrinho.map(item =>
        item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, qtd: 1 }]);
    }
    setBusca("");
    setProdutosFiltrados([]); // Limpa a busca após adicionar
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      alert("O carrinho está vazio!");
      return;
    }

    const venda = {
      cliente,
      itens: carrinho,
      total: calcularTotal(),
      metodo: pagamento,
      desconto: 0,
      data: new Date().toISOString()
    };

    const vendaSalva = db.salvarVenda(venda);

    // Atualiza estoque localmente
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
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-500">

      {vendaConcluida && (
        <Cupom venda={vendaConcluida} onClose={fecharCupomEResetar} />
      )}

      {/* LADO ESQUERDO: BUSCA E LISTAGEM */}
      <div className="flex-1 flex flex-col gap-4">

        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-xl border shadow-sm relative z-20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-600"/> Buscar Produtos
          </h2>
          <div className="relative">
            <Input
              placeholder="Digite nome ou código de barras..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-4 h-12 text-lg"
              autoFocus
            />
            {/* Dropdown de Resultados */}
            {produtosFiltrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-b-xl shadow-xl mt-1 overflow-hidden">
                {produtosFiltrados.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => adicionarAoCarrinho(prod)}
                    className="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-0 flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{prod.nome}</div>
                      <div className="text-xs text-muted-foreground">Cód: {prod.codigo || 'S/C'} | Estoque: {prod.estoque}</div>
                    </div>
                    <div className="font-bold text-emerald-600 group-hover:scale-110 transition-transform">
                      {/* PROTEÇÃO CONTRA ERRO TOFIXED */}
                      R$ {(Number(prod.preco) || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sugestões Rápidas */}
        <div className="flex-1 bg-white p-4 rounded-xl border shadow-sm overflow-y-auto">
            <h3 className="font-bold text-sm text-muted-foreground uppercase mb-3">Atalhos Rápidos</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {produtos.slice(0, 9).map(prod => (
                    <button
                        key={prod.id}
                        disabled={prod.estoque <= 0}
                        onClick={() => adicionarAoCarrinho(prod)}
                        className="p-3 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex flex-col justify-between h-24 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-border group"
                    >
                        <span className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-emerald-900">{prod.nome}</span>
                        <div className="flex justify-between items-end mt-2 w-full">
                            <span className="font-bold text-emerald-700 text-sm">
                                {/* PROTEÇÃO CONTRA ERRO TOFIXED */}
                                R$ {(Number(prod.preco) || 0).toFixed(2)}
                            </span>
                            {prod.estoque <= 0 ? (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                            ) : (
                                <Plus className="h-5 w-5 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* LADO DIREITO: CARRINHO */}
      <div className="w-full md:w-[400px] bg-white flex flex-col border-l shadow-2xl z-10 h-full fixed right-0 top-0 md:relative md:h-auto md:rounded-xl md:border">
        <div className="p-4 bg-emerald-600 text-white flex justify-between items-center md:rounded-t-xl">
            <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5"/> Caixa
            </h2>
            <span className="bg-emerald-700 px-2 py-1 rounded text-sm font-bold shadow-sm">
                {carrinho.reduce((acc, i) => acc + i.qtd, 0)} itens
            </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingCart className="h-16 w-16 mb-4 opacity-20"/>
                    <p className="font-medium">Caixa Livre</p>
                    <p className="text-sm">Aguardando produtos...</p>
                </div>
            ) : (
                carrinho.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm animate-in slide-in-from-right-5">
                        <div className="flex-1">
                            <div className="font-medium text-sm text-slate-800 line-clamp-1">{item.nome}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {item.qtd}x R$ {(Number(item.preco)||0).toFixed(2)}
                            </div>
                        </div>
                        <div className="text-right mx-3">
                            <div className="font-bold text-slate-700">
                                R$ {((item.qtd * (Number(item.preco)||0))).toFixed(2)}
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => removerDoCarrinho(item.id)}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))
            )}
        </div>

        {/* Checkout */}
        <div className="bg-white p-4 border-t space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Cliente</label>
                <select
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Dinheiro', 'PIX', 'Crédito', 'Débito', 'Crediário'].map(metodo => (
                        <button
                            key={metodo}
                            onClick={() => setPagamento(metodo)}
                            className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                pagamento === metodo
                                ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {metodo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 font-medium text-sm">Total a Pagar</span>
                    <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                        {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                    </span>
                </div>
                <Button
                    className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                    onClick={finalizarVenda}
                    disabled={carrinho.length === 0}
                >
                    <Check className="mr-2 h-5 w-5" /> Finalizar Venda
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}