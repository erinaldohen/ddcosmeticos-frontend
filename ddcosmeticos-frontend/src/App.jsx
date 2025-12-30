import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa as páginas
import Login from './pages/Login';

// Componente temporário só para testarmos se o login funcionou
const Dashboard = () => (
  <div style={{ padding: 20 }}>
    <h1>Painel Principal</h1>
    <p>Bem-vindo ao Sistema DD Cosméticos!</p>
    <button onClick={() => {
      localStorage.clear();
      window.location.href = '/';
    }}>Sair</button>
  </div>
);

// Função que protege a rota (só deixa entrar se tiver token)
const RotaPrivada = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Container para as mensagens de aviso (Toasts) aparecerem */}
      <ToastContainer autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RotaPrivada>
              <Dashboard />
            </RotaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;