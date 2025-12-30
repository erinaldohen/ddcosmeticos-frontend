import { useState, useEffect } from "react";

export function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer); // Limpa ao sair da tela
  }, []);

  // Formatação Data: "30 de dez. de 2025"
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);

  // Formatação Hora: "15:30:45"
  const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit' // Descomente se quiser segundos
  }).format(date);

  return (
    <div className="flex flex-col items-end text-xs md:text-sm leading-tight text-muted-foreground border-r pr-4 mr-4 border-border h-8 justify-center">
      <span className="font-semibold text-foreground">{horaFormatada}</span>
      <span className="hidden md:inline-block">{dataFormatada}</span>
    </div>
  );
}