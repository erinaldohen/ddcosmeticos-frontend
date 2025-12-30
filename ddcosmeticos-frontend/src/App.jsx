import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// --- SEUS COMPONENTES ---
// Se você já tem os arquivos reais, importe-os aqui:
// import Login from "./pages/Login";
// import Produtos from "./pages/Produtos";

// --- PLACEHOLDERS (Caso você precise copiar o código dos seus antigos arquivos) ---
const Login = () => (
  <div className="flex h-screen items-center justify-center bg-muted/20">
    <div className="w-full max-w-sm space-y-4 p-8 bg-white border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-center">Login DD Cosméticos</h1>
      <input className="w-full p-2 border rounded" placeholder="Email" />
      <input className="w-full p-2 border rounded" type="password" placeholder="Senha" />
      {/* Simulação de Login: Vai para /dashboard */}
      <a href="/dashboard" className="block w-full bg-black text-white text-center p-2 rounded hover:bg-gray-800">
        Entrar
      </a>
    </div>
  </div>
);

const Dashboard = () => <div className="p-4"><h1 className="text-2xl font-bold">Dashboard Geral</h1><p>Visão geral da DD Cosméticos.</p></div>;
const Produtos = () => <div className="p-4"><h1 className="text-2xl font-bold">Gerenciar Produtos</h1><p>Lista de cosméticos aqui.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rota Pública: LOGIN (Sem Header, Sem Menu) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* 2. Rotas Privadas (Protegidas pelo AppLayout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/vendas" element={<div>Tela de Vendas</div>} />
          <Route path="/clientes" element={<div>Tela de Clientes</div>} />
        </Route>

        {/* Rota Coringa (Redireciona para login se não achar nada) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;