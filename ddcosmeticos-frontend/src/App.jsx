import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/login";

// Módulos
import Dashboard from "@/pages/Dashboard";
import Produtos from "@/pages/Produtos";
import ProdutoFormulario from "@/pages/Produtos/Formulario";
import Clientes from "@/pages/Clientes";
import ClienteFormulario from "@/pages/Clientes/Formulario";
import Vendas from "@/pages/Vendas";
import PDV from "@/pages/Vendas/PDV";
import Financeiro from "@/pages/Financeiro";
import Relatorios from "@/pages/Relatorios"; // <--- ESTE IMPORT É ESSENCIAL
import Importacao from "@/pages/Configuracoes/Importacao";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Login) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Sistema) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Produtos */}
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/novo" element={<ProdutoFormulario />} />
          <Route path="/produtos/editar/:id" element={<ProdutoFormulario />} />

          {/* Clientes */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/novo" element={<ClienteFormulario />} />
          <Route path="/clientes/editar/:id" element={<ClienteFormulario />} />

          {/* Vendas & PDV */}
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/vendas/pdv" element={<PDV />} />

          {/* Financeiro */}
          <Route path="/financeiro" element={<Financeiro />} />

          {/* Relatórios (A rota que estava faltando) */}
          <Route path="/relatorios" element={<Relatorios />} />

          {/* Configurações */}
          <Route path="/configuracoes/importacao" element={<Importacao />} />
        </Route>

        {/* Qualquer outra rota desconhecida joga para o Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;