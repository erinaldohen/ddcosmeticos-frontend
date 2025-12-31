import { useEffect, useState } from "react";
import { Printer, X, Scissors, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cupom({ venda, onClose }) {
  const [loja, setLoja] = useState({
    nome: "DD Cosméticos",
    cnpj: "00.000.000/0001-00",
    endereco: "Endereço não configurado",
    telefone: ""
  });

  // Define a largura REAL do papel, mas usaremos uma largura "SEGURA" interna
  const [tipoPapel, setTipoPapel] = useState("58mm");

  useEffect(() => {
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setLoja(JSON.parse(saved));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Cupom #${venda.id}`,
        text: `Pedido #${venda.id} - R$ ${venda.total}`
      }).catch(console.error);
    } else {
      alert("Função indisponível.");
    }
  };

  // Lógica de Largura Segura (Para não cortar as laterais)
  // 80mm -> Usamos 72mm de conteúdo
  // 58mm -> Usamos 48mm de conteúdo
  const larguraConteudo = tipoPapel === "80mm" ? "72mm" : "48mm";
  const tamanhoFonte = tipoPapel === "80mm" ? "12px" : "11px";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      <style>{`
        @media print {
            /* ZERA TODAS AS MARGENS DA PÁGINA PARA ECONOMIZAR PAPEL */
            @page {
                size: auto;
                margin: 0mm;
            }

            body {
                margin: 0;
                padding: 0;
            }

            /* Oculta tudo que não é cupom */
            body * {
                visibility: hidden;
                height: 0;
                overflow: hidden;
            }

            /* Mostra e posiciona o cupom */
            #printable-content, #printable-content * {
                visibility: visible;
                height: auto;
                overflow: visible;
            }

            #printable-content {
                position: absolute;
                left: 0;
                top: 0;
                /* Largura segura para evitar corte lateral */
                width: ${larguraConteudo} !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white;
            }

            /* FORÇA CONTRASTE MÁXIMO PARA IMPRESSORA TÉRMICA */
            * {
                color: #000000 !important; /* Preto puro */
                font-family: 'Courier New', Courier, monospace !important; /* Fonte monoespaçada */
                font-weight: 700 !important; /* Negrito forçado para legibilidade */
                text-transform: uppercase !important; /* Maiúsculas são mais legíveis */
            }

            /* Remove tons de cinza ou bordas fracas */
            .text-slate-500, .text-slate-400 {
                color: #000000 !important;
            }
            .border-dashed {
                border-color: #000000 !important;
                border-width: 1px !important;
            }
        }
      `}</style>

      {/* MODAL NA TELA (INTERFACE) */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER (Não imprime) */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center no-print" style={{visibility: 'visible', height: 'auto'}}>
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Printer className="h-4 w-4 text-[#34BFBF]"/> Impressão Térmica
            </h3>
            <Button size="icon" variant="ghost" onClick={onClose} className="hover:bg-red-50 hover:text-red-500 rounded-full h-8 w-8">
                <X className="h-4 w-4"/>
            </Button>
        </div>

        {/* CONTROLES (Não imprime) */}
        <div className="p-3 flex justify-center bg-white border-b border-slate-100 no-print" style={{visibility: 'visible', height: 'auto'}}>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setTipoPapel("58mm")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tipoPapel === "58mm" ? "bg-white shadow text-[#F22998]" : "text-slate-400"}`}
                >
                    58mm (Pequeno)
                </button>
                <button
                    onClick={() => setTipoPapel("80mm")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${tipoPapel === "80mm" ? "bg-white shadow text-[#F22998]" : "text-slate-400"}`}
                >
                    80mm (Padrão)
                </button>
             </div>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center" style={{visibility: 'visible', height: 'auto'}}>

            {/* --- CUPOM REAL --- */}
            <div
                id="printable-content"
                className="bg-white shadow-sm"
                style={{
                    width: larguraConteudo,
                    // Estilos visuais para a tela (simulação)
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: tamanhoFonte,
                    lineHeight: '1.1',
                    color: '#000',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    padding: '2px' // Padding mínimo na tela
                }}
            >
                {/* CABEÇALHO */}
                <div className="text-center mb-2">
                    <h2 className="text-sm font-black mb-1">{loja.nome}</h2>
                    <p className="text-[10px] leading-tight">{loja.endereco}</p>
                    <p className="text-[10px]">CNPJ:{loja.cnpj}</p>
                    {loja.telefone && <p className="text-[10px]">Tel:{loja.telefone}</p>}

                    <div className="border-b border-dashed border-black my-1"></div>

                    <div className="flex justify-between text-[10px]">
                        <span>#{venda.id}</span>
                        <span>{new Date(venda.data).toLocaleDateString()} {new Date(venda.data).toLocaleTimeString().slice(0,5)}</span>
                    </div>
                </div>

                {/* ITENS */}
                <div className="mb-2">
                    <div className="flex border-b border-dashed border-black pb-1 mb-1 text-[10px]">
                        <span className="flex-1 text-left">ITEM</span>
                        <span className="w-8 text-center">QTD</span>
                        <span className="w-14 text-right">TOT</span>
                    </div>
                    {venda.itens.map((item, i) => (
                        <div key={i} className="mb-1 text-[10px]">
                            <div className="truncate text-left w-full">{item.nome}</div>
                            <div className="flex justify-between">
                                <span className="text-[9px]">{item.codigo || '.'}</span>
                                <div className="flex gap-1">
                                    <span>{item.qtd}x{Number(item.preco).toFixed(2)}</span>
                                    <span className="w-14 text-right">
                                        {(item.qtd * item.preco).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* TOTAIS */}
                <div className="border-t border-dashed border-black pt-1 mb-2">
                    <div className="flex justify-between text-sm font-black mb-1">
                        <span>TOTAL</span>
                        <span>{venda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>PAGAMENTO</span>
                        <span>{venda.metodo}</span>
                    </div>
                    {venda.cliente && venda.cliente !== "Consumidor Final" && (
                        <div className="flex justify-between text-[10px] mt-1">
                            <span>CLIENTE</span>
                            <span className="text-right truncate max-w-[120px]">{venda.cliente}</span>
                        </div>
                    )}
                </div>

                {/* RODAPÉ ECONÔMICO */}
                <div className="text-center text-[9px] mt-2 pb-0">
                    <p>OBRIGADO PELA PREFERENCIA!</p>
                    <p className="mt-1">*** NAO E DOCUMENTO FISCAL ***</p>
                </div>

                {/* Linha de Corte (Aparece só na tela) */}
                <div className="flex items-center gap-2 mt-4 text-slate-300 no-print justify-center" style={{visibility: 'visible'}}>
                    <Scissors className="h-3 w-3" />
                    <span className="text-[9px] border-b border-dashed border-slate-300 w-full"></span>
                </div>
            </div>
            {/* --- FIM CUPOM --- */}

        </div>

        {/* RODAPÉ MODAL (Não imprime) */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 no-print" style={{visibility: 'visible', height: 'auto'}}>
            <Button onClick={handleShare} variant="outline" className="flex-1 border-slate-200 text-slate-600">
                <Share2 className="mr-2 h-4 w-4" /> Enviar
            </Button>
            <Button
                onClick={handlePrint}
                className="flex-1 bg-[#F22998] hover:bg-[#d91e85] text-white font-bold"
            >
                <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
        </div>

      </div>
    </div>
  );
}