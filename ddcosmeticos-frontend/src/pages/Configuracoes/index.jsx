import { useState, useEffect } from "react";
import { Save, Upload, Download, Building, ShieldCheck, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Configuracoes() {
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
    alert("Dados da loja salvos!");
  };

  const handleExportBackup = () => {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("dd-")) backup[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_ddcosmeticos_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if(confirm("Isso apagará os dados atuais e restaurará o backup. Continuar?")) {
            Object.keys(json).forEach(k => localStorage.setItem(k, json[k]));
            window.location.reload();
        }
      } catch (err) { alert("Arquivo inválido."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#34BFBF] flex items-center gap-2">
        <Building className="h-8 w-8" /> Configurações
      </h1>

      <div className="flex gap-1 border-b">
        <button onClick={() => setActiveTab("loja")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "loja" ? "border-[#34BFBF] text-[#34BFBF]" : "text-slate-400 border-transparent"}`}>LOJA</button>
        <button onClick={() => setActiveTab("dados")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "dados" ? "border-[#34BFBF] text-[#34BFBF]" : "text-slate-400 border-transparent"}`}>SEGURANÇA (BACKUP)</button>
      </div>

      <div className="bg-white border p-8 rounded-b-xl shadow-sm min-h-[400px]">
        {activeTab === "loja" && (
            <div className="max-w-xl space-y-4">
                <div className="space-y-2"><Label>Nome Fantasia</Label><Input value={dadosLoja.nome} onChange={e => setDadosLoja({...dadosLoja, nome: e.target.value})} /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input value={dadosLoja.cnpj} onChange={e => setDadosLoja({...dadosLoja, cnpj: e.target.value})} /></div>
                <div className="space-y-2"><Label>Endereço</Label><Input value={dadosLoja.endereco} onChange={e => setDadosLoja({...dadosLoja, endereco: e.target.value})} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={dadosLoja.telefone} onChange={e => setDadosLoja({...dadosLoja, telefone: e.target.value})} /></div>
                <Button onClick={handleSaveLoja} className="bg-[#F22998] font-bold mt-4 shadow-lg shadow-[#F22998]/20"><Save className="mr-2 h-4 w-4" /> SALVAR DADOS</Button>
            </div>
        )}

        {activeTab === "dados" && (
            <div className="grid md:grid-cols-2 gap-6">
                <div className="border p-6 rounded-xl bg-slate-50 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800"><Download className="h-5 w-5 text-[#34BFBF]" /> Exportar Dados</div>
                    <p className="text-xs text-slate-500">Gere um arquivo .json com todos os seus dados atuais.</p>
                    <Button onClick={handleExportBackup} variant="outline" className="w-full border-[#34BFBF] text-[#34BFBF] font-bold">BAIXAR BACKUP</Button>
                </div>
                <div className="border p-6 rounded-xl bg-slate-50 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800"><Upload className="h-5 w-5 text-[#F22998]" /> Importar Dados</div>
                    <p className="text-xs text-slate-500">Restaure o sistema a partir de um arquivo salvo.</p>
                    <div className="relative"><Button className="w-full">SELECIONAR ARQUIVO</Button><input type="file" accept=".json" onChange={handleImportBackup} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
                </div>
                <div className="md:col-span-2 bg-red-50 p-6 rounded-xl border border-red-100 flex justify-between items-center">
                    <div className="text-red-700 text-sm font-bold">ZONA DE PERIGO: Limpar o sistema apagará tudo.</div>
                    <Button variant="destructive" onClick={() => confirm("Apagar TUDO?") && localStorage.clear() + window.location.reload()}>RESETAR FÁBRICA</Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}