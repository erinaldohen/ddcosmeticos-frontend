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
  const [larguraPapel, setLarguraPapel] = useState("58mm"); // 58mm ou 80mm

  useEffect(() => {
    // Carrega dados da loja configurados
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setLoja(JSON.parse(saved));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      const texto = `
*COMPROVANTE DE VENDA - ${loja.nome}*
--------------------------------
Data: ${new Date(venda.data).toLocaleString()}
Pedido: #${venda.id}
--------------------------------
Total: ${venda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
--------------------------------
Obrigado pela preferência!
      `;
      navigator.share({
        title: `Cupom #${venda.id}`,
        text: texto
      }).catch(console.error);
    } else {
      alert("Compartilhamento não suportado neste navegador/dispositivo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      {/* CSS DE IMPRESSÃO INJETADO DINAMICAMENTE */}
      <style>{`
        @media print {
            @page { margin: 0; size: auto; }
            body * { visibility: hidden; }

            #area-cupom, #area-cupom * {
                visibility: visible;
            }
            #area-cupom {
                position: absolute;
                left: 0;
                top: 0;
                width: ${larguraPapel};
                margin: 0;
                padding: 10px; /* Margem de segurança da impressora */
                background: white;
                color: black;
                font-family: 'Courier New', Courier, monospace; /* Fonte Térmica */
                font-size: 12px;
                line-height: 1.2;
            }

            /* Remove fundos coloridos para economizar tinta */
            .no-print-color {
                background: transparent !important;
                color: black !important;
                border: none !important;
                box-shadow: none !important;
            }

            /* Esconde botões de ação na impressão */
            .actions-bar { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* BARRA DE AÇÕES (NÃO IMPRIME) */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center actions-bar">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Printer className="h-4 w-4 text-[#34BFBF]"/> Imprimir Cupom
            </h3>
            <Button size="icon" variant="ghost" onClick={onClose} className="hover:bg-red-50 hover:text-red-500 rounded-full h-8 w-8">
                <X className="h-4 w-4"/>
            </Button>
        </div>

        {/* CONTROLES (NÃO IMPRIME) */}
        <div className="p-4 flex gap-2 justify-center bg-white border-b border-slate-100 actions-bar">
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setLarguraPapel("58mm")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${larguraPapel === "58mm" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
                >
                    58mm
                </button>
                <button
                    onClick={() => setLarguraPapel("80mm")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${larguraPapel === "80mm" ? "bg-white shadow text-slate-800" : "text-slate-400"}`}
                >
                    80mm
                </button>
             </div>
        </div>

        {/* ÁREA DO CUPOM (PREVIEW & PRINT) */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-6 flex justify-center">

            {/* O PAPEL TÉRMICO SIMULADO */}
            <div
                id="area-cupom"
                className="bg-white shadow-sm transition-all origin-top"
                style={{
                    width: larguraPapel,
                    minHeight: '200px',
                    padding: '15px',
                    fontFamily: "'Courier New', Courier, monospace", // Fonte monoespaçada estilo impressora
                    fontSize: '12px',
                    color: '#000'
                }}
            >
                {/* CABEÇALHO */}
                <div className="text-center mb-4 leading-tight">
                    <h2 className="font-bold text-lg uppercase mb-1">{loja.nome}</h2>
                    <p className="text-[10px]">{loja.endereco}</p>
                    <p className="text-[10px]">CNPJ: {loja.cnpj}</p>
                    {loja.telefone && <p className="text-[10px]">Tel: {loja.telefone}</p>}
                    <p className="border-b border-black border-dashed my-2"></p>
                    <p className="font-bold">CUPOM NÃO FISCAL</p>
                    <p className="text-[10px]">#{venda.id} - {new Date(venda.data).toLocaleString()}</p>
                </div>

                {/* ITENS */}
                <div className="mb-4">
                    <div className="flex font-bold border-b border-black border-dashed pb-1 mb-1 text-[10px]">
                        <span className="flex-1">ITEM</span>
                        <span className="w-8 text-center">QTD</span>
                        <span className="w-14 text-right">VALOR</span>
                    </div>
                    {venda.itens.map((item, i) => (
                        <div key={i} className="mb-1 text-[11px] leading-tight">
                            <div className="font-bold truncate">{item.nome}</div>
                            <div className="flex justify-between">
                                <span>{item.codigo || '-'}</span>
                                <div className="flex gap-2">
                                    <span>{item.qtd}x {Number(item.preco).toFixed(2)}</span>
                                    <span className="font-bold w-14 text-right">
                                        {(item.qtd * item.preco).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* TOTAIS */}
                <div className="border-t border-black border-dashed pt-2 mb-4">
                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL</span>
                        <span>{venda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>Pagamento:</span>
                        <span className="uppercase">{venda.metodo}</span>
                    </div>
                    {venda.cliente !== "Consumidor Final" && (
                        <div className="flex justify-between text-xs mt-1">
                            <span>Cliente:</span>
                            <span>{venda.cliente}</span>
                        </div>
                    )}
                </div>

                {/* RODAPÉ */}
                <div className="text-center text-[10px] mt-6">
                    <p>Obrigado pela preferência!</p>
                    <p className="mt-1">Volte Sempre.</p>
                    <p className="border-t border-black border-dashed mt-4 pt-2 text-[9px] text-slate-400">
                        Sistema DD Cosméticos
                    </p>
                </div>

                {/* Linha de Corte (Visual apenas) */}
                <div className="flex items-center gap-2 mt-4 text-slate-300 actions-bar justify-center">
                    <Scissors className="h-3 w-3" />
                    <span className="text-[9px] border-b border-dashed border-slate-300 w-full"></span>
                </div>

            </div>
        </div>

        {/* BOTÕES DE AÇÃO DO RODAPÉ (NÃO IMPRIME) */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 actions-bar">
            <Button onClick={handleShare} variant="outline" className="flex-1 border-slate-200 text-slate-600">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
            </Button>
            <Button
                onClick={handlePrint}
                className="flex-1 bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20"
            >
                <Printer className="mr-2 h-4 w-4" /> Imprimir Agora
            </Button>
        </div>

      </div>
    </div>
  );
}