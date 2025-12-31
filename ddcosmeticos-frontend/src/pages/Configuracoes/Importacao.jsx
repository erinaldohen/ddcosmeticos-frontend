import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, FileDown, ArrowLeft } from "lucide-react";
import { db } from "@/services/db";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Importacao() {
  const navigate = useNavigate();
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FUNÇÃO PARA BAIXAR O MODELO (CSV) ---
  const handleDownloadModel = () => {
    const produtos = db.getProdutos();

    // Cabeçalho compatível
    let csvContent = "Nome;Codigo;Preco;Estoque;Custo\n";

    // Preenche com produtos existentes (para servir de exemplo/backup)
    produtos.forEach(prod => {
        const nome = prod.nome ? prod.nome.replace(/;/g, " ") : "";
        const codigo = prod.codigo || "";
        const preco = (prod.preco || 0).toString().replace('.', ',');
        const estoque = prod.estoque || 0;
        const custo = (prod.precoCusto || 0).toString().replace('.', ',');

        csvContent += `${nome};${codigo};${preco};${estoque};${custo}\n`;
    });

    // Se não tiver produtos, adiciona uma linha de exemplo fictícia
    if (produtos.length === 0) {
        csvContent += "Exemplo Shampoo;123456;45,90;10;20,00\n";
    }

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `modelo_importacao_ddcosmeticos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processarCSV = (texto) => {
    const linhas = texto.split("\n");
    const novoLog = [];
    let sucessos = 0;
    let erros = 0;

    const linhasDados = linhas.slice(1).filter(l => l.trim() !== "");

    linhasDados.forEach((linha, index) => {
      try {
        const colunas = linha.split(";").length > 1 ? linha.split(";") : linha.split(",");

        // Mapeamento: 0=Nome, 1=Codigo, 2=Preco, 3=Estoque, 4=Custo(Opcional)
        if (colunas.length < 3) throw new Error("Colunas insuficientes");

        const nome = colunas[0].trim();
        const codigo = colunas[1].trim();

        // Tratamento de preço
        let precoString = colunas[2].trim();
        if(precoString.includes("R$")) precoString = precoString.replace("R$", "").trim();
        if(precoString.includes(",") && precoString.includes(".")) precoString = precoString.replace(".", "").replace(",", ".");
        else if (precoString.includes(",")) precoString = precoString.replace(",", ".");

        // Tratamento de custo (se existir)
        let custo = 0;
        if(colunas[4]) {
            let custoString = colunas[4].trim();
            if(custoString.includes("R$")) custoString = custoString.replace("R$", "").trim();
            if(custoString.includes(",") && custoString.includes(".")) custoString = custoString.replace(".", "").replace(",", ".");
            else if (custoString.includes(",")) custoString = custoString.replace(",", ".");
            custo = parseFloat(custoString);
        }

        const preco = parseFloat(precoString);
        const estoque = parseInt(colunas[3].trim());

        if (!nome || isNaN(preco)) throw new Error("Dados inválidos");

        const produto = {
          nome,
          codigo,
          preco,
          precoCusto: isNaN(custo) ? 0 : custo,
          estoque,
          origem: "importacao"
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
      processarCSV(evt.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/configuracoes")}>
            <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8" /> Importar Estoque
            </h1>
            <p className="text-muted-foreground">
            Carregue produtos em massa via Excel/CSV.
            </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LADO ESQUERDO: Instruções e Upload */}
        <div className="space-y-6">

          {/* BOTÃO DE DOWNLOAD DO MODELO (NOVO) */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
             <div className="space-y-1">
                <h3 className="font-bold text-emerald-800 text-sm">Passo 1: Baixe o Modelo</h3>
                <p className="text-xs text-emerald-600">Use este arquivo como base para preencher.</p>
             </div>
             <Button onClick={handleDownloadModel} variant="outline" className="border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-100">
                <FileDown className="mr-2 h-4 w-4" /> Baixar Planilha
             </Button>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Passo 2: Formato do Arquivo</h3>
            <p className="text-sm text-slate-600 mb-4">
              O arquivo deve ser <strong>CSV (separado por ponto-e-vírgula)</strong> com as colunas na ordem abaixo:
            </p>
            <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-xs mb-4 overflow-x-auto shadow-inner">
              Nome;Codigo;Preco;Estoque;Custo<br/>
              Shampoo Liso;789123;45,90;10;22,50<br/>
              Condicionador;789124;39,90;15;18,00
            </div>

            <div className="relative group">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-muted/10 hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-12 h-12 mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-primary">Clique para enviar</span> seu CSV preenchido
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">ou arraste o arquivo aqui</p>
                </div>
                <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={loading} />
              </label>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Log */}
        <div className="bg-card border rounded-xl shadow-sm flex flex-col h-[500px]">
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold">Resultado da Importação</h3>
            {log.length > 0 && <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{log.length} registros</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm font-mono bg-slate-50/50">
            {log.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                <FileSpreadsheet className="h-12 w-12 mb-2" />
                <p>Aguardando arquivo...</p>
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded border ${entry.tipo === 'erro' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  {entry.tipo === 'erro' ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
                  <span className="break-all">{entry.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}