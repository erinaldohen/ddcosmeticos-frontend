import { useEffect, useState } from "react";
import { Printer, X, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Cupom({ venda, onClose }) {
  const [loja, setLoja] = useState({
    nome: "DD Cosméticos",
    cnpj: "57.648.950/0001-44",
    endereco: "Rua Principal, 123",
    telefone: "(81) 99999-9999"
  });

  const [tipoPapel, setTipoPapel] = useState(() => localStorage.getItem("dd-tipo-papel") || "58mm");
  const [whatsappCliente, setWhatsappCliente] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setLoja(JSON.parse(saved));
  }, []);

  const mudarTipoPapel = (t) => {
    setTipoPapel(t);
    localStorage.setItem("dd-tipo-papel", t);
  };

  const handlePrint = () => window.print();

  // Mapeamento dinâmico: O Backend retorna 'itensVenda', 'valorTotal' e 'formaPagamento'
  const itens = venda.itensVenda || venda.itens || [];
  const totalVenda = venda.valorTotal || venda.total || 0;
  const metodoPagto = venda.formaPagamento || venda.metodo || "N/A";

  const montarMensagem = () => {
    const textoItens = itens
      .map(i => {
        const nome = i.produtoNome || i.nome || "Produto";
        const qtd = i.quantidade || i.qtd || 1;
        const preco = i.precoUnitario || i.preco || 0;
        return `• ${nome}\n  ${qtd} un x R$ ${Number(preco).toFixed(2)} = R$ ${(qtd * preco).toFixed(2)}`;
      })
      .join('\n\n');

    return `*${loja.nome}*\n` +
      `*RECIBO DE VENDA Nº ${venda.id}*\n` +
      `----------------------------\n` +
      `${textoItens}\n` +
      `----------------------------\n` +
      `*TOTAL: R$ ${Number(totalVenda).toFixed(2)}*\n` +
      `Pagamento: ${metodoPagto}\n` +
      `Data: ${new Date(venda.dataVenda || Date.now()).toLocaleString()}\n\n` +
      `*NÃO É DOCUMENTO FISCAL*\n` +
      `Obrigado pela preferência!`;
  };

  const shareWhatsApp = () => {
    const mensagem = encodeURIComponent(montarMensagem());
    const numeroLimpo = whatsappCliente.replace(/\D/g, "");
    if (numeroLimpo) {
      const numeroFinal = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;
      window.open(`https://wa.me/${numeroFinal}?text=${mensagem}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
    }
  };

  const larguraRecibo = tipoPapel === "80mm" ? "74mm" : "50mm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 no-print">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #area-impressao, #area-impressao * { visibility: visible !important; color: #000 !important; }
          #area-impressao {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: ${larguraRecibo} !important;
            margin: 0 !important; padding: 2mm !important;
            background: white !important;
          }
          .linha-flex { display: flex !important; justify-content: space-between !important; width: 100% !important; }
          @page { margin: 0 !important; size: auto; }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Recibo de Venda</h3>
            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full h-8 w-8"><X className="h-4 w-4"/></Button>
        </div>

        <div className="p-2 flex justify-center gap-2 bg-white border-b border-dashed">
            {["58mm", "80mm"].map((t) => (
                <button key={t} onClick={() => mudarTipoPapel(t)} className={`px-4 py-1 text-[10px] font-black rounded-md border transition-all ${tipoPapel === t ? "bg-black text-white" : "text-slate-400 border-slate-200"}`}>
                    {t}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-200 p-4 flex justify-center">
            <div id="area-impressao" className="bg-white p-4 shadow-lg" style={{ width: larguraRecibo, fontFamily: "'Courier New', monospace", textTransform: 'uppercase', color: '#000', fontWeight: '900', lineHeight: '1.1' }}>
                <div className="text-center mb-1">
                    <h2 className="text-[13px] font-black">{loja.nome}</h2>
                    <p className="text-[10px]">{loja.endereco}</p>
                    <p className="text-[10px]">CNPJ: {loja.cnpj}</p>
                </div>
                <div className="border-b-2 border-black mb-1"></div>
                <div className="text-[10px] space-y-0.5 mb-1">
                    <div className="linha-flex"><span>VENDA:</span><span>{venda.id}</span></div>
                    <div className="linha-flex"><span>DATA:</span><span>{new Date(venda.dataVenda || Date.now()).toLocaleDateString()}</span></div>
                </div>
                <div className="border-b border-black mb-2"></div>
                <table className="w-full text-[10px] mb-2 border-collapse">
                    <tbody>
                        {itens.map((item, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-1">
                                    <div className="font-black">{item.produtoNome || item.nome}</div>
                                    <div>{item.quantidade || item.qtd} UN X {Number(item.precoUnitario || item.preco).toFixed(2)}</div>
                                </td>
                                <td className="text-right font-black align-bottom">
                                    {((item.quantidade || item.qtd) * (item.precoUnitario || item.preco)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-t-2 border-black pt-2 mb-2">
                    <div className="linha-flex font-black text-[13px]"><span>TOTAL R$</span><span>{Number(totalVenda).toFixed(2)}</span></div>
                    <div className="linha-flex text-[10px] mt-1"><span>PAGTO:</span><span>{metodoPagto}</span></div>
                </div>
                <div className="text-center mt-4">
                    <p className="text-[10px] font-black border-2 border-black p-1 inline-block">NÃO É DOCUMENTO FISCAL</p>
                </div>
            </div>
        </div>

        <div className="p-4 bg-white border-t space-y-3">
            <Input placeholder="WhatsApp p/ envio" value={whatsappCliente} onChange={(e) => setWhatsappCliente(e.target.value)} className="h-10 text-center font-bold" type="tel"/>
            <Button onClick={handlePrint} className="w-full bg-black text-white font-bold h-11 rounded-xl"><Printer className="mr-2 h-5 w-5" /> IMPRIMIR EM {tipoPapel}</Button>
            <Button onClick={shareWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-xl"><MessageCircle className="mr-2 h-5 w-5" /> ENVIAR WHATSAPP</Button>
        </div>
      </div>
    </div>
  );
}