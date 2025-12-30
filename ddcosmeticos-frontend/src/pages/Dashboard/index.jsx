import { useEffect, useState } from "react";
import { db } from "@/services/db";

export default function Dashboard() {
  const [resumo, setResumo] = useState({ totalHoje: 0, pedidosHoje: 0, clientesNovos: 0 });

  useEffect(() => {
    // Carrega os dados reais do banco
    setResumo(db.getResumo());
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Visão Geral</h1>
        <div className="text-sm text-muted-foreground">
            Dados em tempo real
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* CARD 1: Faturamento */}
          <div className="p-6 bg-card rounded-xl border shadow-sm hover:border-primary/50 transition-all">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Faturamento (Hoje)
              </div>
              <div className="text-4xl font-bold mt-2 text-primary">
                  {resumo.totalHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-2">
                  Caixa aberto
              </p>
          </div>

          {/* CARD 2: Vendas */}
          <div className="p-6 bg-card rounded-xl border shadow-sm hover:border-primary/50 transition-all">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Pedidos Realizados
              </div>
              <div className="text-4xl font-bold mt-2 text-primary">
                  {resumo.pedidosHoje}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                  Transações finalizadas hoje
              </p>
          </div>

          {/* CARD 3: Produtos */}
          <div className="p-6 bg-card rounded-xl border shadow-sm hover:border-primary/50 transition-all">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Produtos em Estoque
              </div>
              <div className="text-4xl font-bold mt-2 text-primary">
                  {db.getProdutos().length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                  Itens cadastrados
              </p>
          </div>
      </div>
    </div>
  );
}