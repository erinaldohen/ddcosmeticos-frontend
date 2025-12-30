import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Plus, Search, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db"; // Ler do banco

export default function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    setVendas(db.getVendas());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" /> Gestão de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de transações e abertura de caixa.
          </p>
        </div>
        <Button onClick={() => navigate("/vendas/pdv")} className="shadow-md font-bold h-11 px-6">
          <Plus className="mr-2 h-5 w-5" /> Abrir PDV
        </Button>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Transações Recentes</h3>
        </div>

        {vendas.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            Nenhuma venda registrada ainda. Abra o PDV para começar.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="h-10 px-4 font-medium text-muted-foreground">ID</th>
                <th className="h-10 px-4 font-medium text-muted-foreground">Cliente</th>
                <th className="h-10 px-4 font-medium text-muted-foreground">Data/Hora</th>
                <th className="h-10 px-4 font-medium text-muted-foreground">Forma Pagto</th>
                <th className="h-10 px-4 font-medium text-muted-foreground">Valor</th>
                <th className="h-10 px-4 font-medium text-muted-foreground text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendas.map((venda) => (
                <tr key={venda.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-xs text-muted-foreground">#{venda.id}</td>
                  <td className="p-4 font-medium">{venda.cliente || "Consumidor Final"}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(venda.data).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-4">{venda.metodo}</td>
                  <td className="p-4 font-bold text-emerald-600">
                    {venda.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}