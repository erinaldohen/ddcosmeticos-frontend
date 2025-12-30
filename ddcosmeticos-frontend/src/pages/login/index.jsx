import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Importação da Logo
import logoImg from '../../assets/img/logo-dd.png';

export default function Login() {
  const navigate = useNavigate();

  // Estados para armazenar os dados do formulário
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia os dados para o Backend
      // Nota: Mantivemos o campo 'login' pois foi o que funcionou no seu último teste.
      const response = await api.post('/auth/login', {
        matricula: login,
        senha: senha
      });

      // Sucesso: Salva o token e redireciona
      const { token, nome } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', nome);

      toast.success(`Bem-vindo, ${nome}!`);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);

      if (error.response) {
         // O backend respondeu com erro (ex: Senha incorreta)
         toast.error(error.response.data || 'Login ou senha inválidos.');
      } else if (error.request) {
         // O backend não respondeu (Servidor desligado)
         toast.error('Erro de conexão. O servidor está ligado?');
      } else {
         toast.error('Erro ao tentar fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* --- ÁREA DA LOGO --- */}
        <Box sx={{ mb: 3, mt: 1 }}>
            <img
              src={logoImg}
              alt="Logo DD Cosméticos"
              style={{ maxWidth: '180px', height: 'auto' }}
            />
        </Box>
        {/* ------------------- */}

        <Typography component="h2" variant="h6" style={{ marginBottom: '1.5rem', color: '#666' }}>
          Acesso ao Sistema
        </Typography>

        <Box component="form" onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="login"
            label="Matrícula / Usuário"
            name="login"
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Senha"
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            style={{ marginTop: '1.5rem', padding: '0.8rem' }}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}