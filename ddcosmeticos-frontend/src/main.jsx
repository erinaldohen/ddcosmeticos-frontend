import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles'; // Importação nova
import CssBaseline from '@mui/material/CssBaseline'; // Importação nova
import './index.css';
import App from './App.jsx';
import theme from './theme'; // Importamos o arquivo que criamos acima

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* O ThemeProvider injeta as cores em todo o sistema */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline limpa o CSS padrão e aplica a cor de fundo #F2F2F2 */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);