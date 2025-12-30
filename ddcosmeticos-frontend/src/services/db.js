const DB_KEYS = {
  PRODUTOS: "dd-produtos",
  CLIENTES: "dd-clientes",
  VENDAS: "dd-vendas",
};

const SEED_PRODUTOS = [
  { id: 1, nome: "Shampoo Hidratante 300ml", codigo: "SH300", preco: 45.90, estoque: 10 },
  { id: 2, nome: "Condicionador Reparador", codigo: "CN300", preco: 39.90, estoque: 15 },
  { id: 3, nome: "Kit Cronograma Capilar", codigo: "KIT01", preco: 159.90, estoque: 5 },
  { id: 4, nome: "Máscara de Ouro 500g", codigo: "MSC500", preco: 89.90, estoque: 2 },
  { id: 5, nome: "Óleo Finalizador", codigo: "OL100", preco: 29.90, estoque: 0 },
];

const SEED_CLIENTES = [
  { id: 1, nome: "Maria Silva", cpf: "123.456.789-00", telefone: "(81) 99999-8888", cidade: "Recife" },
  { id: 2, nome: "João Souza", cpf: "987.654.321-99", telefone: "(81) 98888-7777", cidade: "Olinda" },
];

export const db = {
  // --- PRODUTOS ---
  getProdutos: () => {
    try {
      const data = localStorage.getItem(DB_KEYS.PRODUTOS);
      if (!data) {
        localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(SEED_PRODUTOS));
        return SEED_PRODUTOS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Erro ao ler produtos", e);
      return [];
    }
  },

  getProdutoPorId: (id) => {
    const produtos = db.getProdutos();
    return produtos.find(p => p.id === Number(id));
  },

  salvarProduto: (novoProduto) => {
    const produtos = db.getProdutos();
    const id = Date.now();

    // CORREÇÃO: Garante que o preço seja numérico
    const precoFinal = Number(novoProduto.preco);

    const produtoComId = {
      ...novoProduto,
      id,
      estoque: Number(novoProduto.estoque),
      preco: isNaN(precoFinal) ? 0 : precoFinal
    };

    const novaLista = [produtoComId, ...produtos];
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaLista));
    return produtoComId;
  },

  atualizarProduto: (produtoAtualizado) => {
    const produtos = db.getProdutos();

    // CORREÇÃO: Garante que o preço seja numérico
    const precoFinal = Number(produtoAtualizado.preco);

    const novaLista = produtos.map(p => {
      if (p.id === Number(produtoAtualizado.id)) {
        return {
           ...p,
           ...produtoAtualizado,
           estoque: Number(produtoAtualizado.estoque),
           preco: isNaN(precoFinal) ? 0 : precoFinal // Usa o preço já tratado
        };
      }
      return p;
    });
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaLista));
  },

  deletarProduto: (id) => {
    const produtos = db.getProdutos();
    const novaLista = produtos.filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaLista));
    return novaLista;
  },

  // --- CLIENTES ---
  getClientes: () => {
    const data = localStorage.getItem(DB_KEYS.CLIENTES);
    if (!data) {
      localStorage.setItem(DB_KEYS.CLIENTES, JSON.stringify(SEED_CLIENTES));
      return SEED_CLIENTES;
    }
    return JSON.parse(data);
  },

  getClientePorId: (id) => {
    const clientes = db.getClientes();
    return clientes.find(c => c.id === Number(id));
  },

  salvarCliente: (novoCliente) => {
    const clientes = db.getClientes();
    const id = Date.now();
    const clienteComId = { ...novoCliente, id };
    const novaLista = [clienteComId, ...clientes];
    localStorage.setItem(DB_KEYS.CLIENTES, JSON.stringify(novaLista));
    return clienteComId;
  },

  atualizarCliente: (clienteAtualizado) => {
    const clientes = db.getClientes();
    const novaLista = clientes.map(c =>
      c.id === Number(clienteAtualizado.id) ? { ...c, ...clienteAtualizado } : c
    );
    localStorage.setItem(DB_KEYS.CLIENTES, JSON.stringify(novaLista));
  },

  deletarCliente: (id) => {
    const clientes = db.getClientes();
    const novaLista = clientes.filter(c => c.id !== id);
    localStorage.setItem(DB_KEYS.CLIENTES, JSON.stringify(novaLista));
    return novaLista;
  },

  // --- VENDAS ---
  getVendas: () => {
    const data = localStorage.getItem(DB_KEYS.VENDAS);
    return data ? JSON.parse(data) : [];
  },

  salvarVenda: (venda) => {
    const vendas = db.getVendas();
    const novaVenda = { ...venda, id: Date.now(), data: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.VENDAS, JSON.stringify([novaVenda, ...vendas]));

    // Baixar estoque
    const produtos = db.getProdutos();
    const novaListaProdutos = produtos.map(prod => {
      const itemVendido = venda.itens.find(i => i.id === prod.id);
      if (itemVendido) {
        return { ...prod, estoque: prod.estoque - itemVendido.qtd };
      }
      return prod;
    });
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaListaProdutos));

    return novaVenda;
  },

  getResumo: () => {
    const vendas = db.getVendas();
    const hoje = new Date().toLocaleDateString();
    const vendasHoje = vendas.filter(v => new Date(v.data).toLocaleDateString() === hoje);

    return {
      totalHoje: vendasHoje.reduce((acc, v) => acc + v.total, 0),
      pedidosHoje: vendasHoje.length,
      clientesTotal: db.getClientes().length
    };
  }
};