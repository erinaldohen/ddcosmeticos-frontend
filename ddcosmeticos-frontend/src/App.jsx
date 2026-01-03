import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast"; // 1. ADICIONE ESTE IMPORT

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Páginas
import Dashboard from "@/pages/Dashboard";
import Vendas from "@/pages/Vendas";
import PDV from "@/pages/Vendas/PDV";
import Produtos from "@/pages/Produtos";
import NovoProduto from "@/pages/Produtos/NovoProduto";
import Clientes from "@/pages/Clientes";
import Financeiro from "@/pages/Financeiro";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Importacao from "@/pages/Configuracoes/Importacao";
import Login from "@/pages/Login";

// --- COMPONENTE DE ROTA PROTEGIDA ---
function PrivateRoute({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* O Toaster fica aqui para ser ouvido por todas as páginas */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* 2. REMOVI a tag <AppRoutes /> pois suas rotas já estão logo abaixo */}
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendas" element={<Vendas />} />
            <Route path="vendas/pdv" element={<PDV />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="produtos/novo" element={<NovoProduto />} />
            <Route path="produtos/editar/:id" element={<NovoProduto />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="configuracoes/importacao" element={<Importacao />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}