import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/services/db";

export default function NovoProduto() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL se for edição

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    precoCusto: "",
    estoque: ""
  });

  // Se tiver ID, carrega os dados do produto para editar
  useEffect(() => {
    if (id) {
      const produto = db.getProdutoPorId(id);
      if (produto) {
        setFormData({
          nome: produto.nome,
          codigo: produto.codigo,
          preco: produto.preco,
          precoCusto: produto.precoCusto || 0,
          estoque: produto.estoque
        });
      }
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.nome || !formData.preco) {
      alert("Nome e Preço são obrigatórios!");
      return;
    }

    const produtoParaSalvar = {
      ...formData,
      preco: Number(formData.preco),
      precoCusto: Number(formData.precoCusto),
      estoque: Number(formData.estoque)
    };

    if (id) {
      // Modo Edição
      db.atualizarProduto({ id: Number(id), ...produtoParaSalvar });
      alert("Produto atualizado com sucesso!");
    } else {
      // Modo Criação
      db.salvarProduto(produtoParaSalvar);
      alert("Produto cadastrado com sucesso!");
    }

    navigate("/produtos"); // Volta para a lista
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/produtos")}>
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Package className="h-8 w-8" /> {id ? "Editar Produto" : "Novo Produto"}
            </h1>
            <p className="text-muted-foreground">
                {id ? "Altere os dados do produto abaixo." : "Preencha os dados para cadastrar um novo item."}
            </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Shampoo Hidratante"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="codigo">Código (Barras/Interno)</Label>
                    <Input
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        placeholder="Ex: 789..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="estoque">Estoque Inicial</Label>
                    <Input
                        id="estoque"
                        name="estoque"
                        type="number"
                        value={formData.estoque}
                        onChange={handleChange}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                    <Label htmlFor="precoCusto" className="text-slate-500">Preço de Custo (R$)</Label>
                    <Input
                        id="precoCusto"
                        name="precoCusto"
                        type="number"
                        step="0.01"
                        value={formData.precoCusto}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="bg-slate-50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="preco" className="text-emerald-700 font-bold">Preço de Venda (R$)</Label>
                    <Input
                        id="preco"
                        name="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="border-emerald-500 focus-visible:ring-emerald-500 font-bold text-lg"
                        required
                    />
                </div>
            </div>

            <div className="pt-6 flex gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/produtos")}>
                    Cancelar
                </Button>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Save className="mr-2 h-4 w-4" />
                    {id ? "Salvar Alterações" : "Cadastrar Produto"}
                </Button>
            </div>

        </form>
      </div>
    </div>
  );
}