import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FileEdit,
  Trash2,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Dados Falsos para Visualização (Substitua pela API depois)
const produtosExemplo = [
  { id: 1, nome: "Shampoo Hidratante 300ml", codigo: "78910001", preco: 45.90, estoque: 120, status: "Ativo" },
  { id: 2, nome: "Condicionador Reparador", codigo: "78910002", preco: 39.90, estoque: 85, status: "Ativo" },
  { id: 3, nome: "Máscara Capilar Ouro", codigo: "78910003", preco: 89.90, estoque: 5, status: "Baixo" },
  { id: 4, nome: "Óleo Finalizador", codigo: "78910004", preco: 29.90, estoque: 0, status: "Esgotado" },
];

export default function Produtos() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  return (
    <div className="space-y-6">

      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Package className="h-8 w-8" /> Produtos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu catálogo completo de cosméticos.
          </p>
        </div>
        <Button onClick={() => navigate("/produtos/novo")} className="shadow-md font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Barra de Ferramentas */}
      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por nome, código ou categoria..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filtros
        </Button>
      </div>

      {/* Tabela Clean (Tailwind) */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="h-12 px-4 font-medium text-muted-foreground">Produto</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Código</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Preço</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Estoque</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 font-medium text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {produtosExemplo.map((prod) => (
                <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{prod.nome}</td>
                  <td className="p-4 text-muted-foreground">{prod.codigo}</td>
                  <td className="p-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.preco)}
                  </td>
                  <td className="p-4">
                     <span className={prod.estoque < 10 ? "text-red-600 font-bold" : "text-foreground"}>
                        {prod.estoque} un
                     </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${prod.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        prod.status === 'Esgotado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                         <FileEdit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}