import axios from 'axios';

// Cria a conexão apontando para o seu Backend na porta 8080
const api = axios.create({
  baseURL: 'http://192.168.0.6:8080/api/v1',
});

// "Interceptador": Antes de cada pedido, verifica se tem um token salvo
// Se tiver, anexa o token no cabeçalho para o Java deixar entrar
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;