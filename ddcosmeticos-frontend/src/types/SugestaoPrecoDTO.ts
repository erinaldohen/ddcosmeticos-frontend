// src/types/SugestaoPrecoDTO.ts
export interface SugestaoPrecoDTO {
  id: number;
  produtoId: number;
  nomeProduto: string;
  custoBase: number;
  precoVendaAtual: number;
  precoVendaSugerido: number;
  margemAtualPercentual: number;
  margemSugeridaPercentual: number;
  dataSugestao: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  observacao: string;
}