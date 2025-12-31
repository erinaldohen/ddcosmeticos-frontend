import { useEffect, useState } from "react";
import { Printer, X, ShoppingBag, MessageCircle, Share2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Cupom({ venda, onClose }) {
  const [loja, setLoja] = useState({
    nome: "DD Cosméticos",
    cnpj: "00.000.000/0001-00",
    endereco: "Endereço não configurado",
    telefone: "(00) 0000-0000"
  });

  const [tipoPapel, setTipoPapel] = useState("58mm");
  const [whatsappCliente, setWhatsappCliente] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setLoja(JSON.parse(saved));
  }, []);

  const handlePrint = () => window.print();

  // --- FORMATAÇÃO DA MENSAGEM ---
  const montarMensagem = () => {
    const textoItens = venda.itens
      .map(i => {
        const unitario = Number(i.preco).toFixed(2);
        const subtotal = (i.qtd * i.preco).toFixed(2);
        return `• ${i.nome}\n  ${i.qtd} un x R$ ${unitario} = R$ ${subtotal}`;
      })
      .join('\n\n');

    return `*${loja.nome}*\n` +
      `*RECIBO DE VENDA Nº ${venda.id?.toString().slice(-6)}*\n` +
      `----------------------------\n` +
      `${textoItens}\n` +
      `----------------------------\n` +
      `*TOTAL: R$ ${venda.total.toFixed(2)}*\n` +
      `Pagamento: ${venda.metodo}\n` +
      `Data: ${new Date(venda.data).toLocaleString()}\n\n` +
      `*NÃO É DOCUMENTO FISCAL*\n` +
      `Obrigado pela preferência!`;
  };

  // --- FUNÇÃO COMPARTILHAR WHATSAPP (COM OU SEM CONTATO) ---
  const shareWhatsApp = () => {
    const mensagem = encodeURIComponent(montarMensagem());
    const numeroLimpo = whatsappCliente.replace(/\D/g, "");

    if (numeroLimpo) {
      // Se digitou número, envia direto (wa.me)
      const numeroFinal = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;
      window.open(`https://wa.me/${numeroFinal}?text=${mensagem}`, '_blank');
    } else {
      // Se não digitou, abre a lista de contatos para escolher
      window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
    }
  };

  const shareGeneral = async () => {
    const texto = montarMensagem();
    const shareData = { title: `Recibo ${loja.nome}`, text: texto };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.location.href = `mailto:?subject=Recibo ${loja.nome}&body=${encodeURIComponent(texto)}`;
      }
    } catch (err) { console.log(err); }
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
            padding-right: 8mm !important; padding-left: 1mm !important;
            margin: 0 !important; background: white !important;
          }
          .linha-flex { display: flex !important; justify-content: space-between !important; width: 100% !important; }
          @page { margin: 0 !important; size: auto; }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh]">

        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                Opções de Recibo
            </h3>
            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full"><X/></Button>
        </div>

        <div className="p-2 flex justify-center gap-2 bg-white border-b border-dashed">
            {["58mm", "80mm"].map((t) => (
                <button key={t} onClick={() => setTipoPapel(t)} className={`px-4 py-1 text-[11px] font-bold rounded-md border ${tipoPapel === t ? "bg-black text-white" : "text-slate-500 border-slate-200"}`}>
                    {t}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-200 p-4 flex justify-center">
            <div id="area-impressao" className="bg-white p-4 shadow-lg" style={{ width: larguraRecibo, fontFamily: "'Courier New', Courier, monospace", textTransform: 'uppercase', color: '#000', fontWeight: '900', lineHeight: '1.2' }}>
                <div className="text-center mb-1">
                    <h2 className="text-[14px] font-black">{loja.nome}</h2>
                    <p className="text-[11px]">{loja.endereco}</p>
                    <p className="text-[11px]">CNPJ: {loja.cnpj}</p>
                </div>
                <div className="border-b-2 border-black mb-1"></div>
                <div className="text-[11px] space-y-0.5 mb-1">
                    <div className="linha-flex"><span>Nº DA VENDA:</span><span className="font-black">{venda.id?.toString().slice(-6)}</span></div>
                    <div className="linha-flex"><span>DATA: {new Date(venda.data).toLocaleDateString()}</span><span>HORA: {new Date(venda.data).toLocaleTimeString()}</span></div>
                </div>
                <div className="border-b border-black mb-2"></div>
                <table className="w-full text-[11px] mb-2 border-collapse">
                    <tbody>
                        {venda.itens.map((item, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-2 text-left">
                                    <div className="font-black">{item.nome}</div>
                                    <div className="text-[10px]">{item.qtd} UN X R$ {Number(item.preco).toFixed(2)}</div>
                                </td>
                                <td className="text-right py-2 align-top font-black">{(item.qtd * item.preco).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-t-2 border-black pt-2 mb-2">
                    <div className="linha-flex font-black text-[14px]"><span>TOTAL R$</span><span>{venda.total.toFixed(2)}</span></div>
                    <div className="linha-flex text-[11px] mt-2"><span>FORMA PAGTO:</span><span>{venda.metodo}</span></div>
                </div>
                <div className="text-center mt-5 space-y-2">
                    <p className="text-[11px] font-black">*** OBRIGADO PELA PREFERÊNCIA ***</p>
                    <p className="text-[10px] border-2 border-black p-1 font-black">NÃO É DOCUMENTO FISCAL</p>
                </div>
            </div>
        </div>

        {/* --- AÇÕES --- */}
        <div className="p-4 bg-white border-t space-y-3">

            {/* Campo WhatsApp Sem Agenda */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Enviar p/ WhatsApp (DDD + Número)</label>
                <div className="flex gap-2">
                    <Input
                        placeholder="Ex: 11999999999"
                        value={whatsappCliente}
                        onChange={(e) => setWhatsappCliente(e.target.value)}
                        className="h-10 border-2"
                        type="tel"
                    />
                </div>
            </div>

            <Button onClick={handlePrint} className="w-full bg-black text-white font-bold h-11 rounded-xl">
                <Printer className="mr-2 h-5 w-5" /> IMPRIMIR CUPOM
            </Button>

            <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-xl">
                    <MessageCircle className="mr-2 h-5 w-5" /> WHATSAPP
                </Button>
                <Button onClick={shareGeneral} variant="outline" className="border-2 border-black font-bold h-11 rounded-xl text-black">
                    <Share2 className="mr-2 h-5 w-5" /> OUTROS
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}