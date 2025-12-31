import { useState, useEffect } from "react";
import {
  Save, Upload, Download, Building, ShieldCheck,
  Database, FileSpreadsheet, AlertTriangle, FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/db";

export default function Configuracoes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("loja");
  const [dadosLoja, setDadosLoja] = useState({
    nome: "DD Cosméticos",
    cnpj: "",
    endereco: "",
    telefone: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("dd-config-loja");
    if (saved) setDadosLoja(JSON.parse(saved));
  }, []);

  const handleSaveLoja = () => {
    localStorage.setItem("dd-config-loja", JSON.stringify(dadosLoja));
    alert("Dados da loja atualizados com sucesso!");
  };

  // --- FUNÇÃO DE BACKUP COMPLETO (JSON) ---
  const handleBackup = () => {
    const backup = {
      produtos: db.getProdutos(),
      clientes: db.getClientes(),
      vendas: db.getVendas(),
      financeiro: db.getFinanceiro(),
      config: dadosLoja,
      dataBackup: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_ddcosmeticos_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- FUNÇÃO DE RESTAURAÇÃO (JSON) ---
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if(!json.produtos || !json.vendas) throw new Error("Arquivo inválido");

        if(confirm("ATENÇÃO: Isso irá substituir todos os dados atuais pelos do backup. Deseja continuar?")) {
            localStorage.setItem("dd-produtos", JSON.stringify(json.produtos));
            localStorage.setItem("dd-clientes", JSON.stringify(json.clientes));
            localStorage.setItem("dd-vendas", JSON.stringify(json.vendas));
            localStorage.setItem("dd-financeiro", JSON.stringify(json.financeiro));
            if(json.config) localStorage.setItem("dd-config-loja", JSON.stringify(json.config));

            alert("Sistema restaurado com sucesso! A página será recarregada.");
            window.location.reload();
        }
      } catch (err) {
        alert("Erro ao restaurar backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // --- NOVO: BAIXAR ESTOQUE EM CSV/EXCEL (MODELO) ---
  const handleDownloadModel = () => {
    const produtos = db.getProdutos();

    // Cabeçalho compatível com a importação (Ordem Importante!)
    // Adicionei Custo no final para não quebrar importações simples, mas ter o dado
    let csvContent = "Nome;Codigo;Preco;Estoque;Custo\n";

    produtos.forEach(prod => {
        const nome = prod.nome ? prod.nome.replace(/;/g, " ") : ""; // Remove ; do nome para não quebrar
        const codigo = prod.codigo || "";
        // Formata para padrão BR (vírgula decimal) para o Excel entender como número
        const preco = (prod.preco || 0).toString().replace('.', ',');
        const estoque = prod.estoque || 0;
        const custo = (prod.precoCusto || 0).toString().replace('.', ',');

        csvContent += `${nome};${codigo};${preco};${estoque};${custo}\n`;
    });

    // Adiciona BOM para o Excel reconhecer acentos (UTF-8)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `estoque_ddcosmeticos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Building className="h-8 w-8" /> Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os dados da empresa e segurança do sistema.
        </p>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex gap-2 border-b overflow-x-auto pb-1">
        <button
            onClick={() => setActiveTab("loja")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === "loja" ? "bg-card border border-b-0 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
        >
            <Building className="h-4 w-4"/> Dados da Loja
        </button>
        <button
            onClick={() => setActiveTab("dados")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === "dados" ? "bg-card border border-b-0 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
        >
            <Database className="h-4 w-4"/> Backup & Dados
        </button>
      </div>

      {/* CONTEÚDO DAS TABS */}
      <div className="bg-card border rounded-b-xl rounded-tr-xl p-6 shadow-sm min-h-[400px]">

        {/* ABA 1: DADOS DA LOJA */}
        {activeTab === "loja" && (
            <div className="max-w-xl space-y-4 animate-in fade-in">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold">Identidade Visual</p>
                        <p>Essas informações aparecerão no cabeçalho dos relatórios e impressões do sistema.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input
                        value={dadosLoja.nome}
                        onChange={e => setDadosLoja({...dadosLoja, nome: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>CNPJ / CPF</Label>
                    <Input
                        value={dadosLoja.cnpj}
                        onChange={e => setDadosLoja({...dadosLoja, cnpj: e.target.value})}
                        placeholder="00.000.000/0001-00"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Endereço Completo</Label>
                    <Input
                        value={dadosLoja.endereco}
                        onChange={e => setDadosLoja({...dadosLoja, endereco: e.target.value})}
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input
                        value={dadosLoja.telefone}
                        onChange={e => setDadosLoja({...dadosLoja, telefone: e.target.value})}
                        placeholder="(00) 00000-0000"
                    />
                </div>

                <div className="pt-4">
                    <Button onClick={handleSaveLoja} className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </Button>
                </div>
            </div>
        )}

        {/* ABA 2: BACKUP E DADOS */}
        {activeTab === "dados" && (
            <div className="space-y-8 animate-in fade-in">

                {/* Cartão de Backup */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-xl p-6 bg-slate-50 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <Download className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Backup Completo (JSON)</h3>
                                <p className="text-xs text-muted-foreground">Para segurança e migração de PC.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600">
                            Salva tudo: produtos, vendas, clientes e financeiro.
                        </p>
                        <Button onClick={handleBackup} variant="outline" className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                            Baixar Backup Sistema
                        </Button>
                    </div>

                    <div className="border rounded-xl p-6 bg-slate-50 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Restaurar Dados</h3>
                                <p className="text-xs text-muted-foreground">Recuperar sistema de um arquivo JSON.</p>
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 pointer-events-none">
                                Selecionar Arquivo JSON
                            </Button>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" /> Gestão de Estoque (Excel/CSV)
                    </h3>

                    <div className="grid gap-4">
                        {/* 1. Baixar Modelo */}
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="space-y-1">
                                <p className="font-medium flex items-center gap-2">
                                    <FileDown className="h-4 w-4 text-emerald-600" />
                                    Baixar Estoque Atual (Modelo)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Gera um arquivo CSV compatível com Excel. Use para conferência ou como modelo para importar novos itens.
                                </p>
                            </div>
                            <Button variant="outline" onClick={handleDownloadModel}>
                                Baixar Arquivo
                            </Button>
                        </div>

                        {/* 2. Importar */}
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="space-y-1">
                                <p className="font-medium flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    Importar Estoque
                                </p>
                                <p className="text-xs text-muted-foreground">Adicione produtos em massa via arquivo CSV (mesmo formato do modelo).</p>
                            </div>
                            <Button onClick={() => navigate("/configuracoes/importacao")}>
                                Acessar Importador
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h3 className="font-bold text-lg text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Zona de Perigo
                    </h3>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-red-800">Resetar Sistema</p>
                            <p className="text-xs text-red-600">Apaga todos os dados e volta ao estado inicial.</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if(confirm("Tem certeza ABSOLUTA? Isso apagará TUDO e não pode ser desfeito.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                        >
                            Resetar Tudo
                        </Button>
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
}