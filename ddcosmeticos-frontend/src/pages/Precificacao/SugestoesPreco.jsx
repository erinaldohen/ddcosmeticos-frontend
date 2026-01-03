import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, DollarSign, ArrowUpRight } from "lucide-react";
import api from "@/services/api"; // Certifique-se de que esta é a importação correta da sua API
import { Button } from "@/components/ui/button"; // Componente de botão do seu projeto
import { Input } from "@/components/ui/input";   // Componente de input do seu projeto
import { SugestaoPrecoDTO } from "@/types/SugestaoPrecoDTO"; // Importe o DTO que você criou

export default function SugestoesPreco() {
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [processandoId, setProcessandoId] = useState(null);

  const carregarSugestoes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await api.get("/api/v1/precificacao/sugestoes-pendentes");
      setSugestoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar sugestões de preço:", error);
      setErro("Não foi possível carregar as sugestões. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSugestoes();
  }, []);

  const handleAprovar = async (sugestaoId) => {
    setProcessandoId(sugestaoId);
    setErro(null);
    try {
      await api.post(`/api/v1/precificacao/aprovar/${sugestaoId}`);
      carregarSugestoes(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao aprovar sugestão:", error);
      setErro("Falha ao aprovar sugestão.");
    } finally {
      setProcessandoId(null);
    }
  };

  const handleRejeitar = async (sugestaoId) => {
    if (!motivoRejeicao.trim()) {
      alert("Por favor, insira um motivo para a rejeição.");
      return;
    }
    setProcessandoId(sugestaoId);
    setErro(null);
    try {
      await api.post(`/api/v1/precificacao/rejeitar/${sugestaoId}`, { motivo: motivoRejeicao });
      setMotivoRejeicao(""); // Limpa o campo
      carregarSugestoes(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao rejeitar sugestão:", error);
      setErro("Falha ao rejeitar sugestão.");
    } finally {
      setProcessandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-[#34BFBF]" />
        <p className="mt-4 text-lg text-slate-600">Carregando sugestões de preço...</p>
      </div>