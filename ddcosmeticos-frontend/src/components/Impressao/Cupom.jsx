import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cupom({ venda, onClose }) {
  const [loja, setLoja] = useState({
    nome: "DD Cosméticos",
    endereco: "Endereço não configurado",
    telefone: "",
    cnpj: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setLoja(JSON.parse(saved));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!venda) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:bg-white print:p-0 print:block">

      <div className="bg-white w-[380px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col print:shadow-none print:w-full print:h-auto print:max-h-none print:rounded-none animate-in fade-in zoom-in-95">

        {/* Header UI (Não Imprime) */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 print:hidden">
          <h3 className="font-bold text-slate-800">Comprovante</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>

        {/* Conteúdo Impresso */}
        <div id="cupom-content" className="p-6 text-sm font-mono text-slate-900 leading-tight bg-white">

          <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-xl font-bold uppercase">{loja.nome}</h2>
            {loja.cnpj && <p className="text-xs">CNPJ: {loja.cnpj}</p>}
            <p className="text-xs mt-1">{loja.endereco}</p>
            {loja.telefone && <p className="text-xs">Tel: {loja.telefone}</p>}
            <p className="text-xs mt-2 text-slate-500">*** NÃO É DOCUMENTO FISCAL ***</p>
          </div>

          <div className="mb-4 text-xs">
            <div className="flex justify-between">
              <span>Data: {new Date(venda.data).toLocaleDateString()}</span>
              <span>Hora: {new Date(venda.data).toLocaleTimeString().slice(0,5)}</span>
            </div>
            <p>Venda Nº: <strong>{venda.id}</strong></p>
            <p>Cliente: {venda.cliente}</p>
          </div>

          <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
            <div className="grid grid-cols-12 text-xs font-bold mb-2 border-b border-slate-200 pb-1">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTD</span>
              <span className="col-span-4 text-right">VALOR</span>
            </div>
            {venda.itens.map((item, i) => (
              <div key={i} className="grid grid-cols-12 text-xs mb-1">
                <span className="col-span-6 truncate">{item.nome}</span>
                <span className="col-span-2 text-center">{item.qtd}</span>
                <span className="col-span-4 text-right">
                  {((Number(item.preco)||0) * item.qtd).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-lg font-bold mt-4">
            <span>TOTAL</span>
            <span>{(Number(venda.total)||0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
          </div>

          <div className="mt-2 text-xs border-t border-dashed border-slate-300 pt-2">
            <div className="flex justify-between">
              <span>Pagamento:</span>
              <span className="font-bold uppercase">{venda.metodo || "Dinheiro"}</span>
            </div>
          </div>

          <div className="text-center mt-8 pt-4 border-t border-slate-300">
            <p className="text-xs font-bold">Obrigado pela preferência!</p>
            <p className="text-[10px] text-slate-400 mt-2">Sistema DD Cosméticos</p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cupom-content, #cupom-content * { visibility: visible; }
          #cupom-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
    </div>
  );
}