import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, Trash2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setClientes(db.getClientes());
  }, []);

  const handleDelete = (id) => {
    if (confirm("Remover este cliente?")) {
      const novaLista = db.deletarCliente(id);
      setClientes(novaLista);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf?.includes(busca)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <User className="h-8 w-8" /> Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Base de contatos e fidelidade.</p>
        </div>
        <Button onClick={() => navigate("/clientes/novo")} className="shadow-md font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por nome ou CPF..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 font-medium text-muted-foreground">Nome</th>
              <th className="h-12 px-4 font-medium text-muted-foreground">CPF</th>
              <th className="h-12 px-4 font-medium text-muted-foreground">Telefone</th>
              <th className="h-12 px-4 font-medium text-muted-foreground">Cidade</th>
              <th className="h-12 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-muted/30">
                <td className="p-4 font-medium">{cliente.nome}</td>
                <td className="p-4 text-muted-foreground">{cliente.cpf || "-"}</td>
                <td className="p-4">{cliente.telefone || "-"}</td>
                <td className="p-4">{cliente.cidade || "-"}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                    >
                      <FileEdit className="h-4 w-4"/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}