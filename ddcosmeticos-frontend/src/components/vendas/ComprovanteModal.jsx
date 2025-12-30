import { CheckCircle2, Printer, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComprovanteModal({ open, onClose, dadosVenda, onNovaVenda }) {
  if (!open || !dadosVenda) return null;

  const dataAtual = new Date().toLocaleString("pt-BR");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Cabeçalho de Sucesso */}
        <div className="bg-emerald-500 p-6 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Venda Realizada!</h2>
          <p className="text-emerald-100 text-sm">Transação registrada com sucesso.</p>
        </div>

        {/* O Cupom (Estilo Papel Térmico) */}
        <div className="p-6 bg-slate-50 relative">
          {/* Efeito de papel rasgado no topo (CSS Trick simples) */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[linear-gradient(135deg,transparent_50%,#f8fafc_50%),linear-gradient(45deg,transparent_50%,#f8fafc_50%)] bg-[length:20px_20px] -mt-2 rotate-180"></div>

          <div className="border-2 border-dashed border-gray-300 p-4 bg-white font-mono text-sm shadow-sm rounded-sm">
            <div className="text-center mb-4 border-b border-dashed pb-4">
              <h3 className="font-bold text-lg uppercase">DD Cosméticos</h3>
              <p className="text-xs text-muted-foreground">CNPJ: 00.000.000/0001-00</p>
              <p className="text-xs text-muted-foreground">Rua das Flores, 123 - Centro</p>
              <p className="text-xs mt-2">{dataAtual}</p>
            </div>

            <div className="space-y-2 mb-4">
              {dadosVenda.itens.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate w-40">{item.nome}</span>
                  <div className="flex gap-2">
                    <span className="text-gray-500">{item.qtd}x</span>
                    <span>{item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed pt-2 space-y-1">
              <div className="flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span>{dadosVenda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Forma de Pagamento</span>
                <span>{dadosVenda.metodo}</span>
              </div>
              {dadosVenda.cliente && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cliente</span>
                    <span>{dadosVenda.clienteNome}</span>
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Obrigado pela preferência!
              <br/>Volte sempre.
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 bg-white border-t flex flex-col gap-3">
          <Button className="w-full font-bold shadow-md" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Cupom
          </Button>

          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="w-full" onClick={() => alert("Função compartilhar em breve!")}>
                <Share2 className="mr-2 h-4 w-4" /> Enviar
             </Button>
             <Button variant="secondary" className="w-full" onClick={onNovaVenda}>
                Nova Venda
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}