import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F22998', // A sua cor Rosa Choque
      contrastText: '#ffffff', // Texto branco dentro do botão rosa (Legibilidade)
    },
    secondary: {
      main: '#333333', // Um cinza escuro para botões secundários/cancelar
    },
    background: {
      default: '#F2F2F2', // O fundo cinza claro que você pediu
      paper: '#ffffff',   // Os cartões ficam brancos para destacar do fundo
    },
    text: {
      primary: '#333333', // Texto principal (quase preto, melhor que preto puro)
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Botões com texto normal (não tudo maiúsculo) fica mais elegante
      fontWeight: 600,
    },
  },
  components: {
    // Customizações globais de componentes
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Botões levemente arredondados (Moderno)
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#F22998', // A barra superior será Rosa
        },
      },
    },
  },
});

export default theme;