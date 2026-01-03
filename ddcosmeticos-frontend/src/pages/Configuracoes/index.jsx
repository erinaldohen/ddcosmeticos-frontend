import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Save, Building2, Calculator, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function Configuracoes() {
  const queryClient = useQueryClient();

  // Estado local do formulário
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    cnpj: "",
    margemLucroPadrao: "",
    impostoPadrao: ""
  });

  // Busca configurações atuais
  const { data: configAtual, isLoading } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => api.get('/api/v1/configuracoes/loja').then(res => res.data),
  });

  // Atualiza form quando dados chegam
  useEffect(() => {
    if (configAtual) {
      setFormData({
        nomeFantasia: configAtual.nomeFantasia || "",
        cnpj: configAtual.cnpj || "",
        margemLucroPadrao: configAtual.margemLucroPadrao || 0,
        impostoPadrao: configAtual.percImpostosVenda || 0
      });
    }
  }, [configAtual]);

  // Mutação para salvar
  const mutation = useMutation({
    mutationFn: (dados) => api.put('/api/v1/configuracoes/loja', dados),
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries(['configuracoes']); // Recarrega dados
    },
    onError: () => toast.error("Erro ao salvar configurações.")
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configurações da Loja</h1>
          <p className="text-slate-500 text-sm">Dados da empresa e regras de negócio globais.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="bg-[#F22998] hover:bg-[#d91e85] text-white"
        >
          {mutation.isPending ? <span className="animate-spin mr-2">⏳</span> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6">
        {/* DADOS DA EMPRESA */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-slate-700 mb-4 pb-2 border-b border-slate-50">
            <Building2 className="h-5 w-5 text-[#34BFBF]" /> Identificação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input name="cnpj" value={formData.cnpj} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* PARÂMETROS FISCAIS/PREÇO */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-slate-700 mb-4 pb-2 border-b border-slate-50">
            <Calculator className="h-5 w-5 text-[#F22998]" /> Parâmetros de Venda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margem de Lucro Alvo (%)</Label>
              <Input
                type="number"
                name="margemLucroPadrao"
                value={formData.margemLucroPadrao}
                onChange={handleChange}
              />
              <p className="text-[10px] text-slate-400">Usado para sugestão de preço de venda.</p>
            </div>
            <div className="space-y-2">
              <Label>Carga Tributária Estimada (%)</Label>
              <Input
                type="number"
                name="impostoPadrao"
                value={formData.impostoPadrao}
                onChange={handleChange}
              />
              <p className="text-[10px] text-slate-400">Para cálculo de precificação rápida.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}