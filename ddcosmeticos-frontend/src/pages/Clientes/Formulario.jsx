import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClienteFormulario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado único para todos os campos
  const [form, setForm] = useState({
    nome: "", cpf: "", email: "", telefone: "", nascimento: "",
    cep: "", logradouro: "", numero: "", bairro: "", cidade: "", uf: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBuscaCep = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP");
        }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de salvamento
    setTimeout(() => {
      setLoading(false);
      navigate("/clientes");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Novo Cliente</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo para cadastrar.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* SEÇÃO 1: DADOS PESSOAIS */}
        <div className="bg-card border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Linha 1 */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <input
                required
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <input
                required
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">Nascimento</label>
              <input
                type="date"
                name="nascimento"
                value={form.nascimento}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Linha 2 */}
            <div className="md:col-span-6 space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-sm font-medium">WhatsApp / Telefone</label>
              <input
                required
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: ENDEREÇO */}
        <div className="bg-card border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Endereço</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Linha 1 */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">CEP</label>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                onBlur={handleBuscaCep}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="00000-000"
              />
            </div>
            <div className="md:col-span-7 space-y-2">
              <label className="text-sm font-medium">Logradouro (Rua, Av.)</label>
              <input
                name="logradouro"
                value={form.logradouro}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Número</label>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Linha 2 */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-sm font-medium">Bairro</label>
              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">UF</label>
              <input
                name="uf"
                maxLength={2}
                value={form.uf}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/clientes")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="px-8 font-bold">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Cliente
          </Button>
        </div>
      </form>
    </div>
  );
}