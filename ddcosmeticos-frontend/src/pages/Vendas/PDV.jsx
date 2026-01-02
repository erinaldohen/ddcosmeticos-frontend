import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Check, Sparkles,
  ArrowLeft, Loader2, Calculator, Keyboard, PauseCircle, Wallet, User, FileText, XCircle, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Cupom } from "@/components/Impressao/Cupom";

const BEEP_SOUND = "data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";

// Função utilitária para formatar moeda BRL
const formatarMoedaInput = (valor) => {
  if (!valor) return "";
  const numero = valor.replace(/\D/g, "") / 100;
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const parseMoeda = (valorFormatado) => {
  if (!valorFormatado) return 0;
  return Number(valorFormatado.replace(/[^0-9,-]+/g, "").replace(",", ".")) / 100; // Ajuste para input com mascara
};

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

  // Input agora é string formatada (R$)
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

  // --- IDENTIFICAÇÃO DO OPERADOR (Ao carregar) ---
  useEffect(() => {
    // Tenta pegar do localStorage (padrão de autenticação JWT)
    // Ajuste a chave conforme seu sistema de login ('user', 'usuario', 'auth_data')
    const usuarioSalvo = localStorage.getItem("usuario") || localStorage.getItem("user");
    if (usuarioSalvo) {
      try {
        const userObj = JSON.parse(usuarioSalvo);
        // Pega o nome ou login ou email
        setOperador(userObj.nome || userObj.login || userObj.email || "Operador");
      } catch (e) {
        setOperador("Operador Local");
      }
    } else {
        setOperador("Caixa 01"); // Fallback
    }
  }, []);

  // --- CÁLCULOS ---
  const subTotal = carrinho.reduce((acc, item) => acc + (item.precoVenda * item.qtd), 0);

  // Tratamento do desconto
  const valorDesconto = desconto ? Number(desconto.replace(/\D/g, "") / 100) : 0;
  const totalVenda = Math.max(0, subTotal - valorDesconto);

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const restante = Math.max(0, totalVenda - totalPago);
  const troco = totalPago > totalVenda ? totalPago - totalVenda : 0;

  // --- AUTOPREENCHIMENTO INTELIGENTE ---
  // Sempre que o restante muda, atualiza o input de pagamento sugerido
  useEffect(() => {
    if (restante > 0) {
        const valorFormatado = restante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        setValorPagamentoInput(valorFormatado);
    } else {
        setValorPagamentoInput("");
    }
  }, [restante, carrinho, desconto]); // Atualiza se mudar itens, desconto ou pagamentos

  const playBeep = () => { try { new Audio(BEEP_SOUND).play(); } catch (e) {} };

  // --- ATALHOS ---
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === "F2") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "F4") { e.preventDefault(); if(carrinho.length > 0) cancelarVendaTotal(); }
      if (e.key === "F6") { e.preventDefault(); if(carrinho.length > 0) suspenderVenda(); }
      if (e.key === "F9") { e.preventDefault(); if (restante <= 0 && carrinho.length > 0) finalizarVenda(); }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [carrinho, restante, pagamentos]);

  // --- 1. BUSCA ---
  const buscarProduto = async (termo) => {
    if (!termo) { setProdutosEncontrados([]); return; }
    setLoadingBusca(true);
    try {
        const { data } = await api.get(`/api/v1/produtos?busca=${termo}`);
        if (data.length === 1 && data[0].codigoBarras === termo) {
            adicionarAoCarrinho(data[0]);
            playBeep();
            limparBusca();
        } else {
            setProdutosEncontrados(data);
        }
    } catch (error) {
        console.error("Erro busca:", error);
    } finally {
        setLoadingBusca(false);
    }
  };

  const handleInputChange = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
        const valor = inputRef.current?.value;
        if (valor) buscarProduto(valor); else setProdutosEncontrados([]);
    }, 300);
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          const valor = inputRef.current?.value;
          if (valor) buscarProduto(valor);
      }
      if (e.key === 'Escape') limparBusca();
  };

  const limparBusca = () => {
      if (inputRef.current) { inputRef.current.value = ""; inputRef.current.focus(); }
      setProdutosEncontrados([]);
  };

  // --- 2. CARRINHO ---
  const adicionarAoCarrinho = (produto) => {
    if (produto.quantidadeEmEstoque <= 0) {
        // alert(`🚫 Produto sem estoque!`); // Descomente para bloquear
        // return;
    }

    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id);
      if (existente) {
        return prev.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item);
      }
      return [...prev, {
          id: produto.id,
          descricao: produto.descricao,
          precoVenda: produto.precoVenda,
          estoqueAtual: produto.quantidadeEmEstoque,
          qtd: 1
      }];
    });
    if (produtosEncontrados.length > 0) limparBusca();
  };

  const alterarQuantidade = (id, delta) => {
    setCarrinho(prev => prev.map(item => {
        if (item.id === id) {
            const novaQtd = Math.max(1, item.qtd + delta);
            return { ...item, qtd: novaQtd };
        }
        return item;
    }));
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  // --- 3. FINANCEIRO INTELIGENTE ---

  const handleValorPagamentoChange = (e) => {
      // Aplica máscara de moeda em tempo real
      const valorRaw = e.target.value.replace(/\D/g, "");
      const numero = Number(valorRaw) / 100;
      const formatado = numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      setValorPagamentoInput(formatado);
  };

  const handleDescontoChange = (e) => {
    const valorRaw = e.target.value.replace(/\D/g, "");
    const numero = Number(valorRaw) / 100;
    const formatado = numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    setDesconto(formatado);
  };

  const adicionarPagamento = (valorOverride = null) => {
      // Se passou um valor direto (botões de sugestão), usa ele. Se não, usa o input.
      let valorParaPagar;

      if (valorOverride) {
          valorParaPagar = valorOverride;
      } else {
          // Converte a string "R$ 10,00" para float 10.00
          const valorRaw = valorPagamentoInput.replace(/\D/g, "");
          valorParaPagar = Number(valorRaw) / 100;
      }

      if (!valorParaPagar || valorParaPagar <= 0) return;

      // Adiciona o pagamento
      setPagamentos(prev => [...prev, { formaPagamento: metodoSelecionado, valor: valorParaPagar }]);

      // O useEffect vai recalcular o restante e atualizar o input automaticamente
  };

  const removerPagamento = (index) => {
      setPagamentos(prev => prev.filter((_, i) => i !== index));
  };

  // --- 4. AÇÕES FINAIS ---
  const gerarPayload = () => {
      const docLimpo = clienteDocumento.replace(/\D/g, '');
      return {
          clienteNome: clienteNome || "Consumidor Final",
          clienteDocumento: docLimpo.length > 0 ? docLimpo : null,
          pagamentos: pagamentos,
          quantidadeParcelas: 1,
          descontoTotal: valorDesconto,
          ehOrcamento: false,
          itens: carrinho.map(item => ({
              produtoId: item.id,
              quantidade: item.qtd,
              precoUnitario: item.precoVenda
          }))
      };
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return;
    setLoadingFinalizar(true);

    try {
      const payload = gerarPayload();
      const response = await api.post("/api/v1/vendas", payload);
      setVendaConcluida(response.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      alert(`❌ Erro: ${msg}`);
    } finally {
      setLoadingFinalizar(false);
    }
  };

  const suspenderVenda = async () => {
      if(!confirm("Suspender venda atual?")) return;
      setLoadingFinalizar(true);
      try {
          const payload = gerarPayload();
          await api.post("/api/v1/vendas/suspender", payload);
          alert("✅ Venda suspensa!");
          resetarTotalmente();
      } catch (error) {
          alert("Erro ao suspender");
      } finally {
          setLoadingFinalizar(false);
      }
  };

  const cancelarVendaTotal = () => {
      if (confirm("⚠️ Cancelar toda a venda e limpar a tela?")) {
          resetarTotalmente();
      }
  };

  const resetarTotalmente = () => {
    setVendaConcluida(null);
    setCarrinho([]);
    setPagamentos([]);
    setClienteNome("Consumidor Final");
    setClienteDocumento("");
    setDesconto("");
    limparBusca();
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-300 font-sans pb-2">

      {vendaConcluida && <Cupom venda={vendaConcluida} onClose={resetarTotalmente} />}

      {/* --- ESQUERDA: PRODUTOS --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-20">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/vendas")} className="h-8 w-8 text-slate-400">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#34BFBF]"/> PDV
                    </h2>
                    {/* IDENTIFICAÇÃO DO OPERADOR AUTOMÁTICA */}
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                        OPERADOR: <span className="text-[#F22998] font-bold">{operador}</span>
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={cancelarVendaTotal} className="text-red-500 border-red-200 hover:bg-red-50 h-8 text-xs px-2">
                    <XCircle className="mr-1 h-3 w-3"/> F4 Cancelar
                </Button>
                <Button variant="outline" size="sm" onClick={suspenderVenda} className="text-orange-500 border-orange-200 hover:bg-orange-50 h-8 text-xs px-2">
                    <PauseCircle className="mr-1 h-3 w-3"/> F6 Suspender
                </Button>
            </div>
          </div>

          <div className="relative">
            <Input
              ref={inputRef}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="F2: Bipe o código ou digite o nome..."
              className="pl-10 h-12 text-lg border-slate-200 focus:border-[#F22998] focus:ring-2 focus:ring-[#F22998]/20 bg-slate-50"
              autoFocus
            />
            <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                {loadingBusca ? <Loader2 className="h-5 w-5 animate-spin text-[#F22998]"/> : <Search className="h-5 w-5" />}
            </div>

            {produtosEncontrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-b-xl shadow-2xl mt-1 overflow-hidden z-50 max-h-[50vh] overflow-y-auto">
                {produtosEncontrados.map(prod => (
                  <div key={prod.id} onClick={() => adicionarAoCarrinho(prod)} className="p-3 hover:bg-[#F26BB5]/5 cursor-pointer border-b flex justify-between items-center group">
                    <div>
                      <div className="font-bold text-slate-800">{prod.descricao}</div>
                      <div className="text-xs text-slate-400 flex gap-2">
                        <span className="font-mono bg-slate-100 px-1 rounded">{prod.codigoBarras}</span>
                        <span>Estoque: {prod.quantidadeEmEstoque}</span>
                      </div>
                    </div>
                    <div className="font-bold text-[#F22998]">R$ {Number(prod.precoVenda).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carrinho */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Produto</span>
                <span className="mr-14">Qtd / Total</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {carrinho.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                        <ShoppingCart className="h-12 w-12 mb-2"/>
                        <p>Carrinho vazio</p>
                    </div>
                ) : (
                    carrinho.map(item => (
                        <div key={item.id} className="flex items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm group animate-in slide-in-from-left-2">
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-700 truncate">{item.descricao}</div>
                                <div className="text-xs text-slate-400">Unit: R$ {Number(item.precoVenda).toFixed(2)}</div>
                            </div>

                            <div className="flex items-center gap-1 mx-3 bg-slate-100 rounded-md p-0.5 border border-slate-200">
                                <button onClick={() => alterarQuantidade(item.id, -1)} className="h-7 w-7 flex items-center justify-center bg-white rounded hover:bg-slate-200 text-slate-600 shadow-sm">-</button>
                                <span className="font-bold w-8 text-center text-sm text-slate-700">{item.qtd}</span>
                                <button onClick={() => alterarQuantidade(item.id, 1)} className="h-7 w-7 flex items-center justify-center bg-white rounded hover:bg-[#34BFBF] hover:text-white text-[#34BFBF] shadow-sm">+</button>
                            </div>

                            <div className="w-20 text-right font-bold text-[#34BFBF]">
                                R$ {(item.qtd * Number(item.precoVenda)).toFixed(2)}
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-red-500 ml-1" onClick={() => removerDoCarrinho(item.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* --- DIREITA: FINANCEIRO --- */}
      <div className="w-full md:w-[420px] bg-white flex flex-col border border-slate-200 shadow-2xl z-10 h-full rounded-xl overflow-hidden">

        {/* Painel Totais */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-600">TOTAL</span>
                <span className="text-3xl font-bold text-[#F22998]">{totalVenda.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
            </div>

            <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-slate-400">Desconto (R$)</span>
                <Input
                    className="w-28 h-8 text-right text-xs border-red-100 text-red-500 font-bold focus:border-red-300"
                    value={desconto}
                    onChange={handleDescontoChange}
                    placeholder="R$ 0,00"
                />
            </div>
        </div>

        {/* Pagamentos */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">

            {restante > 0.01 ? (
                <div className="bg-[#34BFBF]/5 p-4 rounded-xl border border-[#34BFBF]/20 space-y-3">
                    <p className="text-center text-[#34BFBF] font-bold text-sm">
                        FALTA PAGAR: {restante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>

                    <div className="space-y-2">
                        <select
                            className="w-full h-10 px-2 rounded-md border border-slate-300 text-sm bg-white focus:border-[#34BFBF] outline-none"
                            value={metodoSelecionado}
                            onChange={e => setMetodoSelecionado(e.target.value)}
                        >
                            <option value="DINHEIRO">DINHEIRO</option>
                            <option value="PIX">PIX</option>
                            <option value="CREDITO">CRÉDITO</option>
                            <option value="DEBITO">DÉBITO</option>
                        </select>

                        <div className="flex gap-2">
                            <Input
                                ref={pagamentoRef}
                                className="h-10 text-right font-bold flex-1"
                                placeholder="R$ 0,00"
                                value={valorPagamentoInput}
                                onChange={handleValorPagamentoChange}
                                onKeyDown={e => e.key === 'Enter' && adicionarPagamento()}
                            />
                            <Button onClick={() => adicionarPagamento()} className="bg-[#34BFBF] hover:bg-[#2aa8a8] text-white h-10 w-12 font-bold shadow-sm">
                                <Plus className="h-5 w-5"/>
                            </Button>
                        </div>

                        {/* SUGESTÕES INTELIGENTES (Botões Rápidos) */}
                        {metodoSelecionado === "DINHEIRO" && (
                            <div className="flex gap-2 flex-wrap justify-center mt-2">
                                <Button size="sm" variant="outline" onClick={() => adicionarPagamento(restante)} className="text-xs h-7 border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                                    Exato
                                </Button>
                                {/* Sugere nota de 50 ou 100 se o valor for próximo */}
                                {restante < 50 && (
                                    <Button size="sm" variant="outline" onClick={() => adicionarPagamento(50)} className="text-xs h-7">
                                        R$ 50
                                    </Button>
                                )}
                                {restante < 100 && (
                                    <Button size="sm" variant="outline" onClick={() => adicionarPagamento(100)} className="text-xs h-7">
                                        R$ 100
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center animate-in zoom-in-95">
                    <Check className="h-10 w-10 text-green-600 mx-auto mb-1"/>
                    <p className="text-green-700 font-bold text-lg">Pagamento Concluído</p>
                    {troco > 0 && <div className="mt-2 text-sm bg-white/50 py-1 rounded text-green-800 font-mono font-bold">Troco: {troco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>}
                </div>
            )}

            <div className="space-y-2">
                {pagamentos.length > 0 && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lançamentos</label>}
                {pagamentos.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 text-sm shadow-sm animate-in fade-in">
                        <span className="flex items-center gap-2 font-medium text-slate-600">
                            <Wallet className="h-3 w-3 text-slate-400"/> {p.formaPagamento}
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700">{p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            <button onClick={() => removerPagamento(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-5 bg-white border-t border-slate-100 space-y-3">
            {/* CPF E CLIENTE */}
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-slate-400"/>
                    <Input
                        className="bg-slate-50 text-xs h-9 pl-8" placeholder="Cliente (Opcional)"
                        value={clienteNome} onChange={e => setClienteNome(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <FileText className="absolute left-2 top-2.5 h-4 w-4 text-slate-400"/>
                    <Input
                        className="bg-slate-50 text-xs h-9 pl-8" placeholder="CPF/CNPJ"
                        value={clienteDocumento}
                        onChange={e => {
                            // Mascara CPF/CNPJ visual
                            let v = e.target.value.replace(/\D/g,"");
                            if(v.length > 14) v = v.slice(0,14);
                            if(v.length > 11) {
                                v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
                            } else {
                                v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
                            }
                            setClienteDocumento(v);
                        }}
                    />
                </div>
            </div>

            <Button
                className="w-full h-12 text-base font-bold bg-[#F22998] hover:bg-[#d91e85] shadow-lg shadow-[#F22998]/20 active:scale-95 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={finalizarVenda}
                disabled={carrinho.length === 0 || restante > 0.01 || loadingFinalizar}
            >
                {loadingFinalizar ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                Finalizar Venda (F9)
            </Button>
        </div>
      </div>
    </div>
  );
}