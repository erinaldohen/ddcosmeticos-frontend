import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // <--- Importamos o Contexto

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
import Login from "@/pages/Login"; // <--- Nova Página

// --- COMPONENTE DE ROTA PROTEGIDA ---
// Se não estiver logado, redireciona para /login
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
        <Routes>

          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Dentro do Layout) */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>

            {/* Redireciona a raiz para o dashboard */}
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