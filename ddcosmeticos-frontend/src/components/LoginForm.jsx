// src/components/LoginForm.jsx
import React from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

// O box é o container flexível
const LoginForm = () => {
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
          borderRadius: '8px'
        }}
      >
        <Typography component="h1" variant="h5" sx={{ color: '#F22998' }}>
          Entrar no PDV
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuário (CPF ou Matrícula)"
            name="username"
            autoFocus
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: '#F22998', '&:hover': { backgroundColor: '#c81e7d' } }}
          >
            Acessar Sistema
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
