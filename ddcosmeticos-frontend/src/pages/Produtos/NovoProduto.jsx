import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Package, Search, Barcode, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

export default function NovoProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [consultando, setConsultando] = useState(false);

  const [formData, setFormData] = useState({
    codigoBarras: "",
    descricao: "",
    marca: "",
    categoria: "",
    subcategoria: "",
    ncm: "",
    cest: "",
    precoCusto: "",
    precoVenda: "",
    estoqueMinimo: 5,
    unidade: "UN",
    urlImagem: ""
  });

  // Se for edição, busca dados do produto no Backend
  useEffect(() => {
    if (id) {
        setLoading(true);
        api.get(`/api/v1/produtos/${id}`)
           .then(resp => {
               const p = resp.data;
               setFormData({
                   codigoBarras: p.codigoBarras,
                   descricao: p.descricao,
                   marca: p.marca || "",
                   categoria: p.categoria || "",
                   subcategoria: p.subcategoria || "",
                   ncm: p.ncm || "",
                   cest: p.cest || "",
                   precoCusto: p.precoCusto,
                   precoVenda: p.precoVenda,
                   estoqueMinimo: p.estoqueMinimo,
                   unidade: p.unidade || "UN",
                   urlImagem: p.urlImagem
               });
           })
           .catch(err => console.error("Erro ao carregar produto", err))
           .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- BUSCA AUTOMÁTICA (INTEGRAÇÃO BLUESOFT/COSMOS) ---
  const consultarEan = async () => {
    if (!formData.codigoBarras || formData.codigoBarras.length < 8) return;

    setConsultando(true);
    try {
        const response = await api.get(`/api/v1/produtos/consulta-externa/${formData.codigoBarras}`);
        const dadosExternos = response.data;

        if (dadosExternos) {
            setFormData(prev => ({
                ...prev,
                descricao: prev.descricao || dadosExternos.descricao,
                ncm: dadosExternos.ncm || prev.ncm,
                cest: dadosExternos.cest || prev.cest,
                marca: dadosExternos.brand || prev.marca,
                urlImagem: dadosExternos.thumbnail || prev.urlImagem,
                precoCusto: dadosExternos.avgPrice || prev.precoCusto
            }));
            alert("✅ Produto encontrado e classificado automaticamente!");
        }
    } catch (error) {
        // Silencioso se não achar, para não atrapalhar o fluxo
        console.warn("Produto não encontrado na base externa.");
    } finally {
        setConsultando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload = {
            ...formData,
            precoCusto: Number(formData.precoCusto),
            precoVenda: Number(formData.precoVenda),
            estoqueMinimo: Number(formData.estoqueMinimo),
            ativo: true
        };

        if (id) {
            await api.put(`/api/v1/produtos/${id}`, payload);
            alert("Produto atualizado com sucesso!");
        } else {
            await api.post("/api/v1/produtos", payload);
            alert("Produto cadastrado com sucesso!");
        }
        navigate("/produtos");
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar produto: " + (error.response?.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/produtos")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-6 w-6 text-[#F22998]" />
            {id ? "Editar Produto" : "Novo Produto Inteligente"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CARD 1: IDENTIFICAÇÃO */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-700">
                <Barcode className="h-5 w-5 text-slate-400"/> Identificação
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                    <Label>Código de Barras (EAN)</Label>
                    <div className="relative">
                        <Input
                            name="codigoBarras"
                            value={formData.codigoBarras}
                            onChange={handleChange}
                            onBlur={consultarEan}
                            placeholder="Escaneie..."
                            className="pl-8 border-blue-200 focus:border-blue-500"
                            autoFocus
                        />
                        {consultando ? (
                            <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="space-y-2 md:col-span-3">
                    <Label>Descrição</Label>
                    <Input
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input name="marca" value={formData.marca} onChange={handleChange} />
                 </div>
                 <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input name="categoria" value={formData.categoria} onChange={handleChange} />
                 </div>
                 <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Input name="subcategoria" value={formData.subcategoria} onChange={handleChange} />
                 </div>
            </div>
        </div>

        {/* CARD 2: FISCAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-700">
                <Tag className="h-5 w-5 text-slate-400"/> Classificação Fiscal
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>NCM</Label>
                    <Input name="ncm" value={formData.ncm} onChange={handleChange} className="bg-slate-50"/>
                </div>
                <div className="space-y-2">
                    <Label>CEST</Label>
                    <Input name="cest" value={formData.cest} onChange={handleChange} className="bg-slate-50"/>
                </div>
                 <div className="space-y-2">
                    <Label>Unidade</Label>
                    {/* SUBSTITUIÇÃO PELO SELECT NATIVO */}
                    <select
                        name="unidade"
                        value={formData.unidade}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34BFBF]"
                    >
                        <option value="UN">UN - Unidade</option>
                        <option value="KG">KG - Quilo</option>
                        <option value="CX">CX - Caixa</option>
                        <option value="PCT">PCT - Pacote</option>
                        <option value="KIT">KIT - Kit</option>
                    </select>
                </div>
            </div>
        </div>

        {/* CARD 3: PRECIFICAÇÃO */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 border-l-4 border-l-emerald-500">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-700">
                <DollarSign className="h-5 w-5 text-emerald-600"/> Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Custo (R$)</Label>
                    <Input
                        name="precoCusto"
                        type="number" step="0.01"
                        value={formData.precoCusto}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-emerald-700 font-bold">Preço Venda (R$)</Label>
                    <Input
                        name="precoVenda"
                        type="number" step="0.01"
                        value={formData.precoVenda}
                        onChange={handleChange}
                        className="font-bold text-lg border-emerald-200 focus:ring-emerald-500"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input
                        name="estoqueMinimo"
                        type="number"
                        value={formData.estoqueMinimo}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>

        <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/produtos")}>
                Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full bg-[#F22998] hover:bg-[#d91e85]">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : (id ? "Salvar Alterações" : "Cadastrar Produto")}
            </Button>
        </div>
      </form>
    </div>
  );
}