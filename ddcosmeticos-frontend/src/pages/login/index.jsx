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

export default function Login() {
  const navigate = useNavigate();

  // 1. Definição dos Estados (As "caixinhas" da memória)
  // O Backend espera "login" e "senha", então vamos manter esses nomes
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Envio para o Backend
      // ATENÇÃO: Aqui usamos a variável 'login' que definimos lá em cima (useState)
      const response = await api.post('/auth/login', {
        matricula: login,  // Envia o valor do estado 'login' para o campo 'login' do Java
        senha: senha   // Envia o valor do estado 'senha' para o campo 'senha' do Java
      });

      // 3. Sucesso
      const { token, nome } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', nome);

      toast.success(`Bem-vindo, ${nome}!`);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      // Tratamento de erro melhorado
      if (error.response) {
         // O backend respondeu com erro (ex: 403 Forbidden)
         toast.error(error.response.data || 'Login ou senha inválidos.');
      } else if (error.request) {
         // O backend não respondeu (Backend desligado ou erro de rede)
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

        <Typography component="h1" variant="h5" color="primary" style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          DD COSMÉTICOS
        </Typography>

        <Typography component="h2" variant="h6" style={{ marginBottom: '1.5rem' }}>
          Acesso ao Sistema
        </Typography>

        <Box component="form" onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="login"
            label="Matrícula"
            name="login"
            autoFocus
            value={login} // Liga o campo visual à variável 'login'
            onChange={(e) => setLogin(e.target.value)} // Atualiza a variável ao digitar
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Senha"
            type="password"
            id="senha"
            value={senha} // Liga o campo visual à variável 'senha'
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