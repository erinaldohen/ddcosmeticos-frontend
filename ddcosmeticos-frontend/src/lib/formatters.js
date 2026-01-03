// src/lib/formatters.js

export const formatarMoeda = (valor) => {
  if (valor === undefined || valor === null) return "R$ 0,00";
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatarData = (dataString) => {
  if (!dataString) return "--/--";
  return new Date(dataString).toLocaleDateString("pt-BR");
};

export const formatarDataCurta = (dataString) => {
  if (!dataString) return "";
  return new Date(dataString).toLocaleDateString("pt-BR", { weekday: 'short' });
};