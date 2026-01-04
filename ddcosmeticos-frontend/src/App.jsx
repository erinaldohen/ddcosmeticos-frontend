import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout Unificado (Já contém a Sidebar e o Header)
import { AppLayout } from "@/components/layout/AppLayout";

// Páginas
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PDV from "@/pages/Vendas/PDV";
import Financeiro from "@/pages/Financeiro";
import Produtos from "@/pages/Produtos";
import NovoProduto from "@/pages/Produtos/NovoProduto";
import Clientes from "@/pages/Clientes";
import Relatorios from "@/pages/Relatorios";
import Importacao from "@/pages/Configuracoes/Importacao";

// Se você já criou a página de Estoque, descomente a linha abaixo:
// import Estoque from "@/pages/Estoque";

// Componente para Proteger Rotas
const PrivateRoute = () => {
  const token = localStorage.getItem("dd-token");
  // Se tem token, renderiza o AppLayout (que tem o Menu e o Outlet). Se não, Login.
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Envolvidas pelo Layout) */}
        <Route element={<PrivateRoute />}>
            {/* Redirecionamento Inicial */}
            <Route path="/" element={<Navigate to="/vendas" replace />} />

            {/* Rotas do Menu */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendas" element={<PDV />} />
            <Route path="/financeiro" element={<Financeiro />} />

            {/* Se tiver a página de Estoque criada: */}
            {/* <Route path="/estoque" element={<Estoque />} /> */}

            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produtos/novo" element={<NovoProduto />} />
            <Route path="/produtos/:id" element={<NovoProduto />} />

            <Route path="/clientes" element={<Clientes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes/importacao" element={<Importacao />} />
        </Route>

        {/* Fallback - Qualquer rota desconhecida vai pro Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}