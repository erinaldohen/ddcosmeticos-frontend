import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Check, Sparkles,
  ArrowLeft, Loader2, PauseCircle, Wallet, User, FileText, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import { Cupom } from "@/components/Impressao/Cupom";

const BEEP_SOUND = "data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";

export default function PDV() {
  const navigate = useNavigate();

  // --- DADOS DA SESSÃO ---
  const [operador, setOperador] = useState("Não Identificado");

  // --- DADOS DA VENDA ---
  const [carrinho, setCarrinho] = useState([]);
  const [clienteNome, setClienteNome] = useState("Consumidor Final");
  const [clienteDocumento, setClienteDocumento] = useState("");

  // --- FINANCEIRO ---
  const [pagamentos, setPagamentos] = useState([]);
  const [metodoSelecionado, setMetodoSelecionado] = useState("DINHEIRO");
  const [valorPagamentoInput, setValorPagamentoInput] = useState("");
  const [desconto, setDesconto] = useState("");

  // --- INTERFACE ---
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);
  const [produtosEncontrados, setProdutosEncontrados] = useState([]);
  const [vendaConcluida, setVendaConcluida] = useState(null);

  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const pagamentoRef = useRef(null);

  // --- IDENTIFICAÇÃO DO OPERADOR ---
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario") || localStorage.getItem("user");
    if (usuarioSalvo) {
      try {
        const userObj = JSON.parse(usuarioSalvo);
        setOperador(userObj.nome || userObj.login || "Operador");
      } catch (e) { setOperador("Operador Local"); }
    } else { setOperador("Caixa 01"); }
  }, []);

  // --- CÁLCULOS ---
  const subTotal = carrinho.reduce((acc, item) => acc + (item.precoVenda * item.qtd), 0);
  const valorDesconto = desconto ? Number(desconto.replace(/\D/g, "") / 100) : 0;
  const totalVenda = Math.max(0, subTotal - valorDesconto);
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const restante = Math.max(0, totalVenda - totalPago);
  const troco = totalPago > totalVenda ? totalPago - totalVenda : 0;

  // --- ATUALIZAÇÃO AUTOMÁTICA DO VALOR DE PAGAMENTO ---
  useEffect(() => {
    if (restante > 0.01) {
        setValorPagamentoInput(restante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    } else { setValorPagamentoInput(""); }
  }, [restante]);

  const playBeep = () => { try { new Audio(BEEP_SOUND).play(); } catch (e) {} };

  // --- BUSCA DE PRODUTOS ---
  const buscarProduto = async (termo) => {
    if (!termo) { setProdutosEncontrados([]); return; }
    setLoadingBusca(true);
    try {
        const { data } = await api.get(`/api/v1/produtos?busca=${termo}`);
        const lista = data.content || data;
        if (lista.length === 1 && (lista[0].codigoBarras === termo)) {
            adicionarAoCarrinho(lista[0]);
            playBeep();
            limparBusca();
        } else { setProdutosEncontrados(lista); }
    } catch (error) { console.error("Erro busca:", error); } finally { setLoadingBusca(false); }
  };

  const handleInputChange = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
        const valor = inputRef.current?.value;
        if (valor) buscarProduto(valor); else setProdutosEncontrados([]);
    }, 300);
  };

  const limparBusca = () => {
    if (inputRef.current) { inputRef.current.value = ""; inputRef.current.focus(); }
    setProdutosEncontrados([]);
  };

  // --- GERENCIAMENTO DO CARRINHO ---
  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id);
      if (existente) {
        return prev.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item);
      }
      return [...prev, {
          id: produto.id,
          descricao: produto.descricao,
          precoVenda: produto.precoVenda,
          codigoBarras: produto.codigoBarras,
          qtd: 1
      }];
    });
    limparBusca();
  };

  const alterarQuantidade = (id, delta) => {
    setCarrinho(prev => prev.map(item => item.id === id ? { ...item, qtd: Math.max(1, item.qtd + delta) } : item));
  };

  const removerDoCarrinho = (id) => setCarrinho(prev => prev.filter(item => item.id !== id));

  // --- FINANCEIRO ---
  const handleValorPagamentoChange = (e) => {
      const valorRaw = e.target.value.replace(/\D/g, "");
      setValorPagamentoInput((Number(valorRaw) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  };

  const handleDescontoChange = (e) => {
    const valorRaw = e.target.value.replace(/\D/g, "");
    setDesconto((Number(valorRaw) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  };

  const adicionarPagamento = (valorOverride = null) => {
      const valor = valorOverride || Number(valorPagamentoInput.replace(/\D/g, "")) / 100;
      if (!valor || valor <= 0) return;
      setPagamentos(prev => [...prev, { formaPagamento: metodoSelecionado, valor: valor, parcelas: 1 }]);
  };

  const removerPagamento = (index) => setPagamentos(prev => prev.filter((_, i) => i !== index));

  // --- FINALIZAÇÃO E INTEGRAÇÃO BACKEND ---
  const finalizarVenda = async () => {
    if (carrinho.length === 0) return toast.error("Carrinho vazio!");
    if (restante > 0.01) return toast.error("Pagamento incompleto!");

    setLoadingFinalizar(true);
    const docLimpo = clienteDocumento.replace(/\D/g, '');

    const payload = {
        clienteNome: clienteNome || "Consumidor Final",
        clienteDocumento: docLimpo.length > 0 ? docLimpo : null,
        descontoTotal: valorDesconto,
        ehOrcamento: false,
        apenasItensComNfEntrada: false,
        pagamentos: pagamentos.map(p => ({
            formaPagamento: p.formaPagamento,
            valor: p.valor,
            parcelas: 1
        })),
        itens: carrinho.map(item => ({
            produtoId: item.id,
            quantidade: item.qtd,
            precoUnitario: item.precoVenda
        }))
    };

    try {
        const { data } = await api.post("/api/v1/vendas", payload);
        toast.success("Venda realizada com sucesso!");
        setVendaConcluida({
            id: data.id,
            total: data.totalVenda || totalVenda,
            metodo: data.formaPagamento || metodoSelecionado,
            data: data.dataVenda || new Date(),
            itens: carrinho.map(c => ({ nome: c.descricao, qtd: c.qtd, preco: c.precoVenda }))
        });
    } catch (error) {
        toast.error(error.response?.data?.message || "Erro ao processar venda.");
    } finally { setLoadingFinalizar(false); }
  };

  const suspenderVenda = async () => {
      if(!confirm("Suspender venda atual?")) return;
      try {
          const payload = {
              clienteNome: "Venda Suspensa - " + new Date().toLocaleTimeString(),
              statusFiscal: "EM_ESPERA",
              itens: carrinho.map(i => ({ produtoId: i.id, quantidade: i.qtd, precoUnitario: i.precoVenda }))
          };
          await api.post("/api/v1/vendas/suspender", payload);
          toast.success("Venda em espera.");
          resetarTotalmente();
      } catch (e) { toast.error("Erro ao suspender"); }
  };

  const resetarTotalmente = () => {
    setVendaConcluida(null);
    setCarrinho([]);
    setPagamentos([]);
    setDesconto("");
    setClienteNome("Consumidor Final");
    setClienteDocumento("");
    limparBusca();
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-300 pb-2">
      {vendaConcluida && <Cupom venda={vendaConcluida} onClose={resetarTotalmente} />}

      {/* --- COLUNA ESQUERDA: CARRINHO --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-20">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/vendas")} className="h-8 w-8 text-slate-400"><ArrowLeft/></Button>
                <div>
                    <h2 className="text-lg font-bold text-slate-700">PDV DD COSMÉTICOS</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">OPERADOR: <span className="text-[#F22998]">{operador}</span></p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => confirm("Limpar?") && resetarTotalmente()} className="text-red-500 h-8 text-xs"><XCircle className="mr-1 h-3 w-3"/> F4 Limpar</Button>
                <Button variant="outline" size="sm" onClick={suspenderVenda} className="text-orange-500 h-8 text-xs"><PauseCircle className="mr-1 h-3 w-3"/> F6 Espera</Button>
            </div>
          </div>

          <div className="relative">
            <Input ref={inputRef} onChange={handleInputChange} placeholder="Bipe o código ou digite o nome..." className="pl-10 h-12 text-lg bg-slate-50 border-slate-200" autoFocus />
            <div className="absolute left-3 top-3.5 text-slate-400">
                {loadingBusca ? <Loader2 className="h-5 w-5 animate-spin text-[#F22998]"/> : <Search className="h-5 w-5" />}
            </div>
            {produtosEncontrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-b-xl shadow-2xl z-50 max-h-[40vh] overflow-y-auto">
                {produtosEncontrados.map(prod => (
                  <div key={prod.id} onClick={() => adicionarAoCarrinho(prod)} className="p-3 hover:bg-slate-50 cursor-pointer border-b flex justify-between">
                    <div><div className="font-bold text-slate-800">{prod.descricao}</div><div className="text-xs text-slate-400">{prod.codigoBarras} | Est: {prod.quantidadeEmEstoque}</div></div>
                    <div className="font-bold text-[#F22998]">R$ {Number(prod.precoVenda).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-3 border-b text-[10px] font-bold text-slate-500 flex justify-between"><span>PRODUTO</span><span>SUBTOTAL</span></div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {carrinho.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300"><ShoppingCart className="h-12 w-12 mb-2"/><p>Carrinho vazio</p></div>
                ) : (
                    carrinho.map(item => (
                        <div key={item.id} className="flex items-center bg-white p-2 rounded-lg border shadow-sm">
                            <div className="flex-1"><div className="font-bold text-sm text-slate-700">{item.descricao}</div><div className="text-xs text-slate-400">R$ {Number(item.precoVenda).toFixed(2)}</div></div>
                            <div className="flex items-center gap-1 mx-4 bg-slate-100 rounded p-1">
                                <button onClick={() => alterarQuantidade(item.id, -1)} className="h-6 w-6 bg-white rounded shadow-sm">-</button>
                                <span className="font-bold w-8 text-center">{item.qtd}</span>
                                <button onClick={() => alterarQuantidade(item.id, 1)} className="h-6 w-6 bg-white rounded shadow-sm">+</button>
                            </div>
                            <div className="w-20 text-right font-bold text-[#34BFBF]">R$ {(item.qtd * item.precoVenda).toFixed(2)}</div>
                            <Button variant="ghost" size="icon" onClick={() => removerDoCarrinho(item.id)} className="ml-2 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* --- COLUNA DIREITA: FINANCEIRO --- */}
      <div className="w-full md:w-[400px] bg-white border rounded-xl shadow-xl flex flex-col">
        <div className="p-5 bg-slate-50 border-b space-y-2">
            <div className="flex justify-between items-end"><span className="text-xs font-bold text-slate-500">VALOR TOTAL</span><span className="text-3xl font-black text-[#F22998]">{totalVenda.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
            <div className="flex items-center gap-2 justify-end"><span className="text-[10px] text-slate-400">DESCONTO</span><Input className="w-24 h-8 text-right text-xs font-bold" value={desconto} onChange={handleDescontoChange} placeholder="R$ 0,00"/></div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
            {restante > 0.01 ? (
                <div className="bg-[#34BFBF]/5 p-4 rounded-xl border border-[#34BFBF]/20 space-y-3">
                    <p className="text-center text-[#34BFBF] font-black">FALTA PAGAR: {restante.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                    <select className="w-full h-10 px-2 rounded-md border text-sm" value={metodoSelecionado} onChange={e => setMetodoSelecionado(e.target.value)}>
                        <option value="DINHEIRO">DINHEIRO</option><option value="PIX">PIX</option><option value="CREDITO">CRÉDITO</option><option value="DEBITO">DÉBITO</option>
                    </select>
                    <div className="flex gap-2">
                        <Input className="h-10 text-right font-black flex-1" value={valorPagamentoInput} onChange={handleValorPagamentoChange} />
                        <Button onClick={() => adicionarPagamento()} className="bg-[#34BFBF] h-10 w-12"><Plus/></Button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-1"/><p className="text-green-700 font-bold">PAGAMENTO OK</p>
                    {troco > 0 && <div className="text-xs font-bold text-green-800">TROCO: {troco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>}
                </div>
            )}

            <div className="space-y-2">
                {pagamentos.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border text-sm">
                        <span className="font-bold text-slate-600">{p.formaPagamento}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-slate-700">R$ {p.valor.toFixed(2)}</span>
                            <button onClick={() => removerPagamento(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-5 border-t space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <Input className="bg-slate-50 text-[10px] h-9" placeholder="Nome Cliente" value={clienteNome} onChange={e => setClienteNome(e.target.value)} />
                <Input className="bg-slate-50 text-[10px] h-9" placeholder="CPF/CNPJ" value={clienteDocumento} onChange={e => setClienteDocumento(e.target.value)} />
            </div>
            <Button className="w-full h-12 bg-[#F22998] hover:bg-[#d91e85] text-white font-bold rounded-xl shadow-lg" onClick={finalizarVenda} disabled={carrinho.length === 0 || restante > 0.01 || loadingFinalizar}>
                {loadingFinalizar ? <Loader2 className="animate-spin" /> : "FINALIZAR VENDA (F9)"}
            </Button>
        </div>
      </div>
    </div>
  );
}