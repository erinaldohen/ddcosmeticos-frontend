import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes de Páginas e Layout
import Login from './pages/Login';
import Layout from './components/Layout';

// Páginas do Sistema
import Produtos from './pages/Produtos';
import ProdutoFormulario from './pages/Produtos/Formulario';

// --- Componentes Temporários (Placeholders) ---
// Estes serão substituídos pelos arquivos reais no futuro
const Dashboard = () => (
  <div style={{ padding: 20 }}>
    <h1>📊 Dashboard Gerencial</h1>
    <p>Gráficos de vendas e indicadores aparecerão aqui.</p>
  </div>
);

const Pdv = () => (
  <div style={{ padding: 20 }}>
    <h1>🛒 Frente de Caixa (PDV)</h1>
    <p>Tela de vendas rápida.</p>
  </div>
);

// --- Proteção de Rotas ---
const RotaPrivada = () => {
  const token = localStorage.getItem('token');

  // Se não tiver token, manda para o Login.
  // Se tiver, carrega o Layout (Menu Lateral) que por sua vez carrega o conteúdo (Outlet)
  return token ? <Layout /> : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Container de notificações (Toasts) global */}
      <ToastContainer autoClose={3000} position="top-right" />

      <Routes>
        {/* Rota Pública: Login */}
        <Route path="/" element={<Login />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route element={<RotaPrivada />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pdv" element={<Pdv />} />

          {/* Rotas de Produtos */}
          <Route path="/produtos" element={<Produtos />} />       {/* Lista */}
          <Route path="/produtos/novo" element={<ProdutoFormulario />} /> {/* Cadastro */}

          {/* Adicione outras rotas do sistema aqui (ex: Financeiro, Clientes) */}
          <Route path="/financeiro" element={<h1>💰 Financeiro (Em breve)</h1>} />

        </Route>

        {/* Rota para capturar endereços errados */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;