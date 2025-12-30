import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FileEdit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    // Carrega produtos e garante que a lista não seja nula
    const lista = db.getProdutos() || [];
    setProdutos(lista);
  }, []);

  const handleDelete = (id) => {
    // window.confirm é mais seguro que apenas confirm
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      const novaLista = db.deletarProduto(id);
      setProdutos(novaLista);
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    (p.nome && p.nome.toLowerCase().includes(busca.toLowerCase())) ||
    (p.codigo && p.codigo.includes(busca))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Package className="h-8 w-8" /> Produtos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo completo.</p>
        </div>
        <Button onClick={() => navigate("/produtos/novo")} className="shadow-md font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por nome ou código..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="h-12 px-4 font-medium text-muted-foreground">Produto</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Código</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Preço</th>
                <th className="h-12 px-4 font-medium text-muted-foreground">Estoque</th>
                <th className="h-12 px-4 font-medium text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {produtosFiltrados.map((prod) => (
                <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{prod.nome || "Produto sem nome"}</td>
                  <td className="p-4 text-muted-foreground">{prod.codigo || "-"}</td>
                  <td className="p-4">
                    {/* PROTEÇÃO AQUI: (prod.preco || 0) evita o erro de null */}
                    {(prod.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4">
                     <span className={(prod.estoque || 0) < 5 ? "text-red-600 font-bold" : ""}>
                        {prod.estoque || 0} un
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-blue-600"
                         onClick={() => navigate(`/produtos/editar/${prod.id}`)}
                       >
                         <FileEdit className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-red-500 hover:bg-red-50"
                         onClick={() => handleDelete(prod.id)}
                       >
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