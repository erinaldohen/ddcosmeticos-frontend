import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  MenuItem
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function ProdutoFormulario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado para a Imagem (Preview e Arquivo)
  const [imagemPreview, setImagemPreview] = useState(null);
  const [arquivoImagem, setArquivoImagem] = useState(null);

  // Estado do Formulário
  const [form, setForm] = useState({
    descricao: '',
    codigoBarras: '',
    precoCusto: '',
    precoVenda: '',
    quantidadeEmEstoque: '',
    ncm: '',
    cest: '',
    cfop: '5102', // Padrão de Venda
    origem: '0'   // 0 - Nacional
  });

  // Atualiza os campos ao digitar
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Trata a seleção da imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivoImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  // Salvar tudo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Converter valores monetários (ex: "10,00" -> 10.00) se necessário
      // O Java espera BigDecimal, então enviamos string numérica ou number
      const payload = {
        ...form,
        precoCusto: Number(form.precoCusto.toString().replace(',', '.')),
        precoVenda: Number(form.precoVenda.toString().replace(',', '.')),
        quantidadeEmEstoque: Number(form.quantidadeEmEstoque),
        ativo: true
      };

      // 2. Salva os dados do produto
      const response = await api.post('/produtos', payload);
      const novoProdutoId = response.data.id;

      // 3. Se tiver imagem, faz o upload agora usando o ID gerado
      if (arquivoImagem) {
        const formData = new FormData();
        formData.append('file', arquivoImagem);
        await api.post(`/produtos/${novoProdutoId}/imagem`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Produto cadastrado com sucesso!');
      navigate('/produtos'); // Volta para a lista

    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar produto. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Cabeçalho com Botão Voltar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtos')}
          sx={{ mr: 2, color: 'text.secondary' }}
        >
          Voltar
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Novo Produto
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>

            {/* --- SEÇÃO 1: FOTO --- */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  backgroundImage: `url(${imagemPreview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!imagemPreview && <Typography color="text.secondary">Sem Foto</Typography>}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Escolher Foto
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Grid>

            {/* --- SEÇÃO 2: DADOS GERAIS --- */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Descrição do Produto"
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    placeholder="Ex: Batom Matte Vermelho"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Código de Barras (EAN)"
                    name="codigoBarras"
                    value={form.codigoBarras}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Quantidade em Estoque"
                    name="quantidadeEmEstoque"
                    type="number"
                    value={form.quantidadeEmEstoque}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Preço de Custo (R$)"
                    name="precoCusto"
                    value={form.precoCusto}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Preço de Venda (R$)"
                    name="precoVenda"
                    value={form.precoVenda}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* --- SEÇÃO 3: DADOS FISCAIS --- */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 1, color: '#666' }}>
                Dados Fiscais (Obrigatório para Nota)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    label="NCM"
                    name="ncm"
                    value={form.ncm}
                    onChange={handleChange}
                    helperText="Ex: 33041000"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CEST (Opcional)"
                    name="cest"
                    value={form.cest}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Origem da Mercadoria"
                    name="origem"
                    value={form.origem}
                    onChange={handleChange}
                  >
                    <MenuItem value="0">0 - Nacional</MenuItem>
                    <MenuItem value="1">1 - Importação Direta</MenuItem>
                    <MenuItem value="2">2 - Estrangeira (Adq. no mercado interno)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/produtos')}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}