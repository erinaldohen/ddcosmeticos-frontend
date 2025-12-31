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

  const handleDownloadModel = () => {
    const produtos = db.getProdutos();
    let csvContent = "Nome;Codigo;Preco;Estoque;Custo\n";

    produtos.forEach(prod => {
        const nome = prod.nome ? prod.nome.replace(/;/g, " ") : "";
        const codigo = prod.codigo || "";
        const preco = (prod.preco || 0).toString().replace('.', ',');
        const estoque = prod.estoque || 0;
        const custo = (prod.precoCusto || 0).toString().replace('.', ',');

        csvContent += `${nome};${codigo};${preco};${estoque};${custo}\n`;
    });

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

      {/* CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#34BFBF] flex items-center gap-2">
          <Building className="h-8 w-8" /> Configurações
        </h1>
        <p className="text-slate-500 mt-1">
          Gerencie os dados da empresa e segurança do sistema.
        </p>
      </div>

      {/* TABS DE NAVEGAÇÃO CUSTOMIZADAS */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
            onClick={() => setActiveTab("loja")}
            className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
                activeTab === "loja"
                ? "bg-white border-[#34BFBF] text-[#34BFBF] shadow-sm"
                : "text-slate-400 border-transparent hover:text-[#34BFBF] hover:bg-white/50"
            }`}
        >
            <div className="flex items-center gap-2"><Building className="h-4 w-4"/> Dados da Loja</div>
        </button>
        <button
            onClick={() => setActiveTab("dados")}
            className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
                activeTab === "dados"
                ? "bg-white border-[#34BFBF] text-[#34BFBF] shadow-sm"
                : "text-slate-400 border-transparent hover:text-[#34BFBF] hover:bg-white/50"
            }`}
        >
             <div className="flex items-center gap-2"><Database className="h-4 w-4"/> Backup & Dados</div>
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white border border-slate-100 rounded-b-xl rounded-tr-xl p-8 shadow-sm min-h-[400px]">

        {/* ABA 1: DADOS DA LOJA */}
        {activeTab === "loja" && (
            <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-left-4">
                <div className="bg-[#34BFBF]/10 p-4 rounded-xl border border-[#34BFBF]/20 flex gap-3 items-start">
                    <ShieldCheck className="h-5 w-5 text-[#34BFBF] mt-0.5 shrink-0" />
                    <div className="text-sm text-slate-600">
                        <p className="font-bold text-[#34BFBF]">Identidade Visual</p>
                        <p>Essas informações aparecerão no cabeçalho dos relatórios e cupom fiscal.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Nome Fantasia</Label>
                        <Input
                            value={dadosLoja.nome}
                            onChange={e => setDadosLoja({...dadosLoja, nome: e.target.value})}
                            className="focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">CNPJ / CPF</Label>
                        <Input
                            value={dadosLoja.cnpj}
                            onChange={e => setDadosLoja({...dadosLoja, cnpj: e.target.value})}
                            placeholder="00.000.000/0001-00"
                            className="focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Endereço Completo</Label>
                        <Input
                            value={dadosLoja.endereco}
                            onChange={e => setDadosLoja({...dadosLoja, endereco: e.target.value})}
                            placeholder="Rua, Número, Bairro, Cidade - UF"
                            className="focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold">Telefone / WhatsApp</Label>
                        <Input
                            value={dadosLoja.telefone}
                            onChange={e => setDadosLoja({...dadosLoja, telefone: e.target.value})}
                            placeholder="(00) 00000-0000"
                            className="focus:border-[#34BFBF] focus:ring-[#34BFBF]"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <Button onClick={handleSaveLoja} className="w-full sm:w-auto bg-[#F22998] hover:bg-[#d91e85] text-white font-bold shadow-lg shadow-[#F22998]/20">
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </Button>
                </div>
            </div>
        )}

        {/* ABA 2: BACKUP E DADOS */}
        {activeTab === "dados" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">

                {/* 1. Backup do Sistema */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#34BFBF]/20 rounded-full flex items-center justify-center text-[#34BFBF]">
                                <Download className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Backup Completo</h3>
                                <p className="text-xs text-slate-400">Segurança total dos dados.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500">
                            Salva todos os produtos, vendas e clientes em um arquivo seguro.
                        </p>
                        <Button onClick={handleBackup} variant="outline" className="w-full text-[#34BFBF] border-[#34BFBF]/30 hover:bg-[#34BFBF] hover:text-white">
                            Baixar Backup (JSON)
                        </Button>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#F26BB5]/20 rounded-full flex items-center justify-center text-[#F26BB5]">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Restaurar Dados</h3>
                                <p className="text-xs text-slate-400">Recuperar de um arquivo.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500">
                            Carregue um arquivo de backup para restaurar o sistema.
                        </p>
                        <div className="relative">
                            <Button className="w-full bg-white text-slate-600 border border-slate-200 pointer-events-none">
                                Selecionar Arquivo
                            </Button>
                            <input type="file" accept=".json" onChange={handleRestore} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* 2. Gestão de Estoque */}
                <div className="border-t border-slate-100 pt-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <FileSpreadsheet className="h-5 w-5 text-[#34BFBF]" /> Gestão de Estoque (Excel)
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col justify-between p-6 border border-slate-100 rounded-xl hover:shadow-md transition-all bg-white">
                            <div className="space-y-2 mb-4">
                                <p className="font-bold flex items-center gap-2 text-slate-700">
                                    <FileDown className="h-4 w-4 text-[#34BFBF]" />
                                    Baixar Estoque Atual
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Gera uma planilha CSV compatível com Excel para conferência ou edição em massa.
                                </p>
                            </div>
                            <Button variant="outline" onClick={handleDownloadModel} className="w-full border-slate-200 hover:text-[#34BFBF] hover:border-[#34BFBF]">
                                Baixar Arquivo
                            </Button>
                        </div>

                        <div className="flex flex-col justify-between p-6 border border-slate-100 rounded-xl hover:shadow-md transition-all bg-white">
                            <div className="space-y-2 mb-4">
                                <p className="font-bold flex items-center gap-2 text-slate-700">
                                    <Upload className="h-4 w-4 text-[#F22998]" />
                                    Importar Estoque
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Carregue produtos em massa usando a planilha modelo.
                                </p>
                            </div>
                            <Button onClick={() => navigate("/configuracoes/importacao")} className="w-full bg-[#F22998] hover:bg-[#d91e85] text-white">
                                Ir para Importação
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. Zona de Perigo */}
                <div className="border-t border-slate-100 pt-8">
                    <h3 className="font-bold text-lg text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Zona de Perigo
                    </h3>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-red-800">Resetar Sistema (Fábrica)</p>
                            <p className="text-xs text-red-600 mt-1">
                                Apaga todos os produtos, clientes, vendas e configurações. <br/>
                                <strong>Esta ação não pode ser desfeita.</strong>
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={() => {
                                if(confirm("Tem certeza ABSOLUTA? Isso apagará TUDO e não pode ser desfeito.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                        >
                            Apagar Tudo e Resetar
                        </Button>
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
}