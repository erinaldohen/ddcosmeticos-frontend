// src/components/LoginForm.jsx
import React, { useState } from 'react';
// Importamos o useNavigate para redirecionar o usuário após o login
import { useNavigate } from 'react-router-dom';
// Importamos o hook personalizado
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho conforme sua estrutura
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';

const LoginForm = () => {
  // 1. Estados para controlar os inputs e feedback visual
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Pegamos a função de login do Contexto
  const { login } = useAuth();

  // Hook de navegação
  const navigate = useNavigate();

  // 3. Função que lida com o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chama a função do AuthContext
      await login(loginInput, password);

      // Se der certo, redireciona para a página inicial ou dashboard
      navigate('/');
    } catch (err) {
      // Se der erro, exibe a mensagem retornada pelo contexto
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: 3 // Adicionei uma sombra leve para destaque
        }}
      >
        <Typography component="h1" variant="h5" sx={{ color: '#F22998', fontWeight: 'bold' }}>
          Entrar no PDV
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>

          {/* Exibe erro se houver */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuário (E-mail, CPF ou Matrícula)"
            name="username"
            autoFocus
            // Controle do input
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            disabled={loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            // Controle do input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading} // Desabilita botão enquanto carrega
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#F22998',
              height: '48px', // Altura fixa para não "pular" com o spinner
              '&:hover': { backgroundColor: '#c81e7d' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Acessar Sistema'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;