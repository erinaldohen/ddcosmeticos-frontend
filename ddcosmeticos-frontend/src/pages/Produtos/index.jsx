import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Produtos() {
  const navigate = useNavigate();
  const theme = useTheme();
  // Esta variável será TRUE se a tela for pequena (celular)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar a lista de produtos.');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  // --- COMPONENTE VISUAL: VERSÃO DESKTOP (TABELA) ---
  const DesktopView = () => (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Foto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cód. Barras</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Preço</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estoque</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id} hover>
                <TableCell>
                  <Avatar
                    src={produto.urlImagem ? `http://192.168.0.9:8080${produto.urlImagem}` : null} // Atenção ao IP
                    variant="rounded"
                    sx={{ width: 50, height: 50, bgcolor: 'primary.light' }}
                  >
                    {produto.descricao?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {produto.descricao}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    NCM: {produto.ncm}
                  </Typography>
                </TableCell>
                <TableCell>{produto.codigoBarras || '-'}</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {formatarMoeda(produto.precoVenda)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={produto.quantidadeEmEstoque}
                    color={produto.quantidadeEmEstoque <= 5 ? 'error' : 'success'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={produto.ativo ? 'Ativo' : 'Inativo'}
                    color={produto.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // --- COMPONENTE VISUAL: VERSÃO MOBILE (CARDS) ---
  const MobileView = () => (
    <Box>
      {produtos.map((produto) => (
        <Card key={produto.id} sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'flex-start', pb: 1 }}>
            {/* Foto à Esquerda */}
            <Avatar
              src={produto.urlImagem ? `http://192.168.0.9:8080${produto.urlImagem}` : null} // Use o IP aqui também
              variant="rounded"
              sx={{ width: 70, height: 70, mr: 2, bgcolor: 'primary.light' }}
            >
              {produto.descricao?.charAt(0)}
            </Avatar>

            {/* Dados à Direita */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}>
                {produto.descricao}
              </Typography>

              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatarMoeda(produto.precoVenda)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={`Estoque: ${produto.quantidadeEmEstoque}`}
                  size="small"
                  color={produto.quantidadeEmEstoque <= 5 ? 'error' : 'default'}
                />
                <Chip
                    label={produto.codigoBarras || 'Sem EAN'}
                    size="small"
                    variant="outlined"
                />
              </Box>
            </Box>
          </CardContent>

          <Divider />

          {/* Botões de Ação Embaixo */}
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', bgcolor: '#fafafa' }}>
             <Button startIcon={<EditIcon />} size="small">Editar</Button>
             <Button startIcon={<DeleteIcon />} size="small" color="error">Excluir</Button>
          </Box>
        </Card>
      ))}

      {produtos.length === 0 && (
         <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
           Nenhum produto encontrado.
         </Typography>
      )}
    </Box>
  );

  return (
    <Box>
      {/* Cabeçalho Responsivo */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', // No celular fica um embaixo do outro
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Produtos
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size="large"
          fullWidth={isMobile} // No celular o botão ocupa a largura toda
          sx={{ borderRadius: 2, fontWeight: 'bold', py: isMobile ? 1.5 : 1 }}
          onClick={() => navigate('/produtos/novo')}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Decide qual tela mostrar baseado no tamanho */}
      {isMobile ? <MobileView /> : <DesktopView />}

    </Box>
  );
}