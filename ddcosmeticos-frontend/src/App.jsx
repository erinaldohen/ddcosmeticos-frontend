import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// IMPORTAÇÕES CORRETAS
// O "@" aponta para "src", e o import da pasta "login" busca automaticamente o "index.jsx"
import Login from "@/pages/login";
import Produtos from "@/pages/Produtos"; // Certifique-se que existe src/pages/Produtos/index.jsx

// Componentes simples para as telas que ainda não criamos
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-primary mb-4">Dashboard</h1>
    <p className="text-muted-foreground">Bem-vindo ao painel de controle.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública: Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas do Sistema (Protegidas pelo Layout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/vendas" element={<div className="p-6">Gestão de Vendas</div>} />
          <Route path="/clientes" element={<div className="p-6">Gestão de Clientes</div>} />
        </Route>

        {/* Redireciona qualquer rota desconhecida para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;