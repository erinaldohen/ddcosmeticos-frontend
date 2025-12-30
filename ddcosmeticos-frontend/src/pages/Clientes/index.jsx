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
  Divider,
  InputBase
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Clientes() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      // Caso a API ainda não tenha clientes, usamos dados falsos para teste visual
      // toast.error('Erro ao carregar clientes.');
      setClientes([
        { id: 1, nome: 'Maria Silva', cpf: '123.456.789-00', email: 'maria@email.com', telefone: '81999998888', cidade: 'Recife' },
        { id: 2, nome: 'João Souza', cpf: '987.654.321-99', email: 'joao@email.com', telefone: '81988887777', cidade: 'Olinda' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtro de busca local
  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca)
  );

  // --- VISÃO DESKTOP ---
  const DesktopView = () => (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CPF</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contato</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Localização</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados.map((cliente) => (
              <TableRow key={cliente.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{cliente.nome.charAt(0)}</Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {cliente.nome}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{cliente.cpf}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                     {cliente.telefone && (
                       <Chip icon={<WhatsAppIcon />} label={cliente.telefone} size="small" color="success" variant="outlined" />
                     )}
                     {cliente.email && (
                       <Chip icon={<EmailIcon />} label="Email" size="small" onClick={() => {}} />
                     )}
                  </Box>
                </TableCell>
                <TableCell>{cliente.cidade || '-'}</TableCell>
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

  // --- VISÃO MOBILE ---
  const MobileView = () => (
    <Box>
      {clientesFiltrados.map((cliente) => (
        <Card key={cliente.id} sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: theme.palette.primary.main }}>
                {cliente.nome.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{cliente.nome}</Typography>
                <Typography variant="body2" color="text.secondary">CPF: {cliente.cpf}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip icon={<WhatsAppIcon />} label={cliente.telefone} size="small" color="success" />
              <Chip label={cliente.cidade} size="small" />
            </Box>
          </CardContent>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', bgcolor: '#fafafa' }}>
             <Button startIcon={<EditIcon />} size="small">Editar</Button>
             <Button startIcon={<DeleteIcon />} size="small" color="error">Excluir</Button>
          </Box>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Cabeçalho e Busca */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Clientes
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Barra de Busca */}
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 300, borderRadius: 2 }}
            elevation={0}
            variant="outlined"
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Buscar por nome ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px' }}>
              <SearchIcon />
            </IconButton>
          </Paper>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
            onClick={() => navigate('/clientes/novo')}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
}