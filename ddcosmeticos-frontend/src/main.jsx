import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <--- Importar
import App from './App.jsx'
import './globals.css'

// Cria uma instância do cliente (Cache Global)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recarregar ao mudar de aba (opcional)
      staleTime: 1000 * 60 * 5, // Dados considerados "frescos" por 5 minutos
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolver a App com o Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)