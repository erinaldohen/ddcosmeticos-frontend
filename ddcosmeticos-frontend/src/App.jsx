import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// --- IMPORTAÇÃO DAS PÁGINAS ---
import Login from "@/pages/login";

// Módulo de Produtos
import Produtos from "@/pages/Produtos";
import ProdutoFormulario from "@/pages/Produtos/Formulario";

// Módulo de Clientes (Adicionado agora)
import Clientes from "@/pages/Clientes";
import ClienteFormulario from "@/pages/Clientes/Formulario";

// Dashboard (Simples por enquanto)
const Dashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-700">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Visão Geral</h1>
      <div className="text-sm text-muted-foreground">Última atualização: Hoje, 14:30</div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground uppercase">Vendas Hoje</div>
            <div className="text-3xl font-bold mt-2 text-primary">R$ 1.250,00</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground uppercase">Pedidos</div>
            <div className="text-3xl font-bold mt-2 text-primary">8</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground uppercase">Clientes</div>
            <div className="text-3xl font-bold mt-2 text-primary">14</div>
        </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rota Pública (Login) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* 2. Rotas Protegidas (Sistema) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rotas de Produtos */}
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/novo" element={<ProdutoFormulario />} />

          {/* Rotas de Clientes (CORRIGIDO AQUI) */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/novo" element={<ClienteFormulario />} />

          {/* Outros Módulos */}
          <Route path="/vendas" element={<div className="p-8">Módulo de Vendas (Em breve)</div>} />
        </Route>

        {/* 3. Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;