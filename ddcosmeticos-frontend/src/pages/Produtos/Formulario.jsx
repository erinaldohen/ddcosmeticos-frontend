import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, UploadCloud, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/services/db";

export default function ProdutoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);

  const [form, setForm] = useState({
    descricao: "", codigoBarras: "", precoCusto: "", precoVenda: "",
    estoque: "", ncm: "", cest: "", origem: "0"
  });

  useEffect(() => {
    if (id) {
      const produtoSalvo = db.getProdutoPorId(id);
      if (produtoSalvo) {
        setForm({
          descricao: produtoSalvo.nome || "",
          codigoBarras: produtoSalvo.codigo || "",
          precoCusto: produtoSalvo.precoCusto || "",
          // Converte para string de forma segura
          precoVenda: (produtoSalvo.preco || 0).toString().replace('.', ','),
          estoque: (produtoSalvo.estoque || 0).toString(),
          ncm: produtoSalvo.ncm || "",
          cest: produtoSalvo.cest || "",
          origem: produtoSalvo.origem || "0"
        });
      }
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Garante que é string antes de replace
      const precoString = form.precoVenda ? form.precoVenda.toString() : "0";
      const precoNumerico = Number(precoString.replace(',', '.'));

      const produtoFinal = {
        nome: form.descricao,
        codigo: form.codigoBarras,
        preco: isNaN(precoNumerico) ? 0 : precoNumerico, // Envia o número limpo
        ...form
      };

      if (id) {
        db.atualizarProduto({ ...produtoFinal, id: Number(id) });
      } else {
        db.salvarProduto(produtoFinal);
      }

      setLoading(false);
      navigate("/produtos");
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/produtos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {id ? "Editar Produto" : "Cadastrar Produto"}
          </h1>
          <p className="text-muted-foreground">
            {id ? "Altere os dados do produto abaixo." : "Adicione os detalhes do novo item ao catálogo."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* FOTO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold mb-4 self-start">Imagem do Produto</h2>
            <div className="w-full aspect-square bg-muted/30 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative hover:bg-muted/50 transition-colors">
              {imagemPreview ? (
                <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="space-y-2 text-muted-foreground">
                  <UploadCloud className="h-10 w-10 mx-auto" />
                  <span className="text-sm">Clique para upload</span>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
            </div>
            <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG. Máx: 5MB.</p>
          </div>
        </div>

        {/* DADOS */}
        <div className="lg:col-span-8 space-y-6">

          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Informações Gerais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Descrição Completa</label>
                <input required name="descricao" value={form.descricao} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Código de Barras (EAN)</label>
                <input name="codigoBarras" value={form.codigoBarras} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estoque Atual</label>
                <input type="number" name="estoque" value={form.estoque} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço de Custo (R$)</label>
                <input name="precoCusto" value={form.precoCusto} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary font-bold">Preço de Venda (R$)</label>
                <input name="precoVenda" value={form.precoVenda} onChange={handleChange} className="flex h-10 w-full rounded-md border-2 border-primary/20 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none font-semibold" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Dados Fiscais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">NCM</label>
                <input name="ncm" value={form.ncm} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CEST</label>
                <input name="cest" value={form.cest} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Origem</label>
                <select name="origem" value={form.origem} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="0">0 - Nacional</option>
                  <option value="1">1 - Importada</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/produtos")}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="px-8 font-bold">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {id ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}