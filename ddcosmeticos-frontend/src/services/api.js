// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Endereço do seu Backend Spring Boot
});

// Interceptor para adicionar o token automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dd-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;