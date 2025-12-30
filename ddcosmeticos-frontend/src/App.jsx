import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/login";

// Módulos
import Produtos from "@/pages/Produtos";
import ProdutoFormulario from "@/pages/Produtos/Formulario";
import Clientes from "@/pages/Clientes";
import ClienteFormulario from "@/pages/Clientes/Formulario";
import Vendas from "@/pages/Vendas";
import PDV from "@/pages/Vendas/PDV";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Produtos */}
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/novo" element={<ProdutoFormulario />} />
          <Route path="/produtos/editar/:id" element={<ProdutoFormulario />} /> {/* Nova Rota */}

          {/* Clientes */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/novo" element={<ClienteFormulario />} />
          <Route path="/clientes/editar/:id" element={<ClienteFormulario />} /> {/* Nova Rota */}

          {/* Vendas */}
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/vendas/pdv" element={<PDV />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;