import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Trash2, Plus, Minus, CreditCard,
  Banknote, CheckCircle2, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComprovanteModal } from "@/components/vendas/ComprovanteModal";
import { db } from "@/services/db";

export default function PDV() {
  const navigate = useNavigate();

  // Estados
  const [catalogo, setCatalogo] = useState([]);
  const [listaClientes, setListaClientes] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState("");
  const [cliente, setCliente] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [dadosVendaFinalizada, setDadosVendaFinalizada] = useState(null);

  // Carrega dados com proteção contra falhas
  useEffect(() => {
    try {
      const prods = db.getProdutos() || [];
      const clis = db.getClientes() || [];
      setCatalogo(prods);
      setListaClientes(clis);
    } catch (error) {
      console.error("Erro ao carregar PDV:", error);
    }
  }, []);

  // Adicionar item
  const adicionarAoCarrinho = (produto) => {
    const estoqueAtual = Number(produto.estoque || 0);

    if (estoqueAtual <= 0) return alert("Produto sem estoque!");

    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.id === produto.id);
      if (itemExistente) {
        if (itemExistente.qtd + 1 > estoqueAtual) {
          alert("Estoque insuficiente!");
          return prev;
        }
        return prev.map((item) =>
          item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };

  const removerDoCarrinho = (id) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  };

  const alterarQtd = (id, delta) => {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, qtd: Math.max(1, item.qtd + delta) };
        }
        return item;
      })
    );
  };

  // Cálculo seguro do subtotal (evita NaN)
  const subtotal = carrinho.reduce((acc, item) => {
    const preco = Number(item.preco || 0);
    return acc + (preco * item.qtd);
  }, 0);

  const finalizarVenda = (metodoPagamento) => {
    if (carrinho.length === 0) return;

    const venda = {
      itens: carrinho,
      total: subtotal,
      metodo: metodoPagamento,
      cliente: cliente || "Consumidor Final",
    };

    try {
      const vendaSalva = db.salvarVenda(venda);
      setDadosVendaFinalizada({ ...vendaSalva, clienteNome: venda.cliente });
      setModalOpen(true);
    } catch (error) {
      alert("Erro ao salvar venda: " + error.message);
    }
  };

  const resetarPDV = () => {
    setCarrinho([]);
    setCliente("");
    setBusca("");
    setModalOpen(false);
    // Recarrega catálogo
    setCatalogo(db.getProdutos());
  };

  const produtosFiltrados = catalogo.filter(p =>
    (p.nome && p.nome.toLowerCase().includes(busca.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <>
      <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">

        {/* CATÁLOGO (ESQUERDA) */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/vendas")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Buscar produto (Nome ou Cód)..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-10 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 bg-muted/20 rounded-xl p-4 overflow-y-auto border border-dashed border-muted-foreground/20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosFiltrados.map((prod) => {
                // Proteção de variáveis
                const preco = Number(prod.preco || 0);
                const estoque = Number(prod.estoque || 0);
                const semEstoque = estoque <= 0;

                return (
                  <button
                    key={prod.id}
                    onClick={() => adicionarAoCarrinho(prod)}
                    disabled={semEstoque}
                    className={`bg-card p-4 rounded-xl border shadow-sm transition-all text-left flex flex-col justify-between h-40 group relative
                      ${semEstoque ? 'opacity-60 cursor-not-allowed bg-muted' : 'hover:ring-2 hover:ring-primary hover:scale-[1.02]'}`}
                  >
                    <div>
                      <div className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {prod.nome || "Produto sem nome"}
                      </div>
                      <div className="text-xs text-muted-foreground">Cód: {prod.codigo || "-"}</div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="font-bold text-lg text-primary">
                        {preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full font-bold
                         ${estoque <= 2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                         {estoque} un
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARRINHO (DIREITA) */}
        <div className="w-full lg:w-[400px] bg-card border rounded-xl shadow-lg flex flex-col h-full">
          <div className="p-5 border-b bg-primary text-primary-foreground rounded-t-xl">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Carrinho
            </h2>
          </div>

          <div className="p-4 border-b bg-muted/10">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Cliente</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              >
                <option value="">Consumidor Final (Sem cadastro)</option>
                {listaClientes.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <ShoppingBag className="h-12 w-12 mb-2" />
                <p>Caixa Livre</p>
              </div>
            ) : (
              carrinho.map((item) => {
                const precoItem = Number(item.preco || 0);
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="text-sm font-medium line-clamp-1">{item.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {precoItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background rounded-md border px-1 h-8">
                      <button onClick={() => alterarQtd(item.id, -1)} className="p-1 hover:text-primary"><Minus className="h-3 w-3"/></button>
                      <span className="text-xs font-bold w-4 text-center">{item.qtd}</span>
                      <button onClick={() => alterarQtd(item.id, 1)} className="p-1 hover:text-primary"><Plus className="h-3 w-3"/></button>
                    </div>
                    <div className="text-sm font-bold w-16 text-right">
                      {(precoItem * item.qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <button onClick={() => removerDoCarrinho(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-6 bg-muted/10 border-t space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="text-3xl font-bold text-primary">
                {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-14 flex-col gap-1 text-xs" onClick={() => finalizarVenda("Dinheiro")}>
                <Banknote className="h-4 w-4"/> Dinheiro
              </Button>
              <Button variant="outline" className="h-14 flex-col gap-1 text-xs" onClick={() => finalizarVenda("Cartão")}>
                <CreditCard className="h-4 w-4"/> Cartão
              </Button>
            </div>
            <Button
              className="w-full h-12 text-lg font-bold shadow-lg"
              onClick={() => finalizarVenda("PIX")}
              disabled={carrinho.length === 0}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> PIX / Finalizar
            </Button>
          </div>
        </div>
      </div>

      <ComprovanteModal
        open={modalOpen}
        dadosVenda={dadosVendaFinalizada}
        onClose={() => setModalOpen(false)}
        onNovaVenda={resetarPDV}
      />
    </>
  );
}