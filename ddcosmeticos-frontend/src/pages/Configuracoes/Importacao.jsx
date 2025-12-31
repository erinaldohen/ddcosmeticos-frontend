import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { db } from "@/services/db";

export default function Importacao() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const processarCSV = (texto) => {
    const linhas = texto.split("\n");
    const novoLog = [];
    let sucessos = 0;
    let erros = 0;

    // Remove cabeçalho e linhas vazias
    const linhasDados = linhas.slice(1).filter(l => l.trim() !== "");

    linhasDados.forEach((linha, index) => {
      try {
        // Assume CSV separado por ponto e vírgula (padrão Excel BR) ou vírgula
        const colunas = linha.split(";").length > 1 ? linha.split(";") : linha.split(",");

        // Mapeamento: 0=Nome, 1=Codigo, 2=Preco, 3=Estoque
        if (colunas.length < 3) throw new Error("Colunas insuficientes");

        const nome = colunas[0].trim();
        const codigo = colunas[1].trim();

        // Tratamento de preço (R$ 1.200,50 -> 1200.50)
        let precoString = colunas[2].trim();
        if(precoString.includes("R$")) precoString = precoString.replace("R$", "").trim();
        // Se tiver ponto como milhar e virgula como decimal (padrão BR)
        if(precoString.includes(",") && precoString.includes(".")) {
             precoString = precoString.replace(".", "").replace(",", ".");
        } else if (precoString.includes(",")) {
             precoString = precoString.replace(",", ".");
        }

        const preco = parseFloat(precoString);
        const estoque = parseInt(colunas[3].trim());

        if (!nome || isNaN(preco)) throw new Error("Dados inválidos (Preço ou Nome)");

        const produto = {
          nome,
          codigo,
          preco,
          precoCusto: 0,
          precoVenda: preco,
          estoque,
          descricao: nome,
          origem: "0"
        };

        db.salvarProduto(produto);
        sucessos++;
        novoLog.push({ tipo: "sucesso", msg: `Linha ${index + 2}: ${nome} importado.` });
      } catch (error) {
        erros++;
        novoLog.push({ tipo: "erro", msg: `Linha ${index + 2}: Erro - ${error.message}` });
      }
    });

    setLog(novoLog);
    alert(`Importação concluída!\nSucessos: ${sucessos}\nErros: ${erros}`);
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const texto = evt.target.result;
      processarCSV(texto);
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8" /> Importar Estoque
        </h1>
        <p className="text-muted-foreground">
          Carregue uma lista de produtos via CSV para popular o sistema rapidamente.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LADO ESQUERDO: Upload e Instruções */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">1. Formato do Arquivo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie uma planilha no Excel com as seguintes colunas (sem acentos no cabeçalho) e salve como <strong>CSV (Separado por vírgulas ou ponto-e-vírgula)</strong>:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-xs mb-4 overflow-x-auto">
              Nome;Codigo;Preco;Estoque<br/>
              Shampoo Liso;789123;45,90;10<br/>
              Condicionador;789124;39,90;15
            </div>

            <div className="relative group">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-muted/10 hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para enviar</span> ou arraste
                    </p>
                    <p className="text-xs text-muted-foreground">CSV (MAX. 5MB)</p>
                </div>
                <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
              </label>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Log de Processamento */}
        <div className="bg-card border rounded-xl shadow-sm flex flex-col h-[400px]">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-semibold">Log de Importação</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm font-mono">
            {log.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <FileSpreadsheet className="h-10 w-10 mb-2" />
                <p>Aguardando arquivo...</p>
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} className={`flex items-start gap-2 ${entry.tipo === 'erro' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {entry.tipo === 'erro' ? <AlertCircle className="h-4 w-4 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 mt-0.5" />}
                  <span>{entry.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}