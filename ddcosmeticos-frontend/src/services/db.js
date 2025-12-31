const DB_KEYS = {
  PRODUTOS: "dd-produtos",
  CLIENTES: "dd-clientes",
  VENDAS: "dd-vendas",
  FINANCEIRO: "dd-financeiro",
};

// --- DADOS INICIAIS (SEEDS) ---
const SEED_PRODUTOS = [
  { id: 1, nome: "Shampoo Hidratante 300ml", codigo: "SH300", preco: 45.90, estoque: 10, precoCusto: 20.00 },
  { id: 2, nome: "Condicionador Reparador", codigo: "CN300", preco: 39.90, estoque: 15, precoCusto: 18.00 },
  { id: 3, nome: "Kit Cronograma Capilar", codigo: "KIT01", preco: 159.90, estoque: 5, precoCusto: 80.00 },
  { id: 4, nome: "Máscara de Ouro 500g", codigo: "MSC500", preco: 89.90, estoque: 2, precoCusto: 45.00 },
  { id: 5, nome: "Óleo Finalizador", codigo: "OL100", preco: 29.90, estoque: 0, precoCusto: 12.00 },
];

const SEED_CLIENTES = [
  { id: 1, nome: "Maria Silva", cpf: "123.456.789-00", telefone: "(81) 99999-8888", cidade: "Recife" },
  { id: 2, nome: "João Souza", cpf: "987.654.321-99", telefone: "(81) 98888-7777", cidade: "Olinda" },
];

const SEED_FINANCEIRO = [
  { id: 1, tipo: 'DESPESA', descricao: 'Conta de Energia', valor: 350.00, vencimento: '2023-12-30', status: 'PENDENTE', categoria: 'Fixa' },
  { id: 2, tipo: 'DESPESA', descricao: 'Fornecedor Natura', valor: 1200.00, vencimento: '2024-01-05', status: 'PENDENTE', categoria: 'Fornecedores' },
  { id: 3, tipo: 'RECEITA', descricao: 'Venda Balcão #1024', valor: 159.90, vencimento: '2023-12-30', status: 'PAGO', categoria: 'Vendas' },
];

export const db = {

  // ==========================================
  // MÓDULO DE PRODUTOS
  // ==========================================
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
    const precoFinal = Number(novoProduto.preco);
    const custoFinal = Number(novoProduto.precoCusto) || 0;

    const produtoComId = {
      ...novoProduto,
      id,
      estoque: Number(novoProduto.estoque),
      preco: isNaN(precoFinal) ? 0 : precoFinal,
      precoCusto: isNaN(custoFinal) ? 0 : custoFinal
    };

    const novaLista = [produtoComId, ...produtos];
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaLista));
    return produtoComId;
  },

  atualizarProduto: (produtoAtualizado) => {
    const produtos = db.getProdutos();
    const precoFinal = Number(produtoAtualizado.preco);
    const custoFinal = Number(produtoAtualizado.precoCusto) || 0;

    const novaLista = produtos.map(p => {
      if (p.id === Number(produtoAtualizado.id)) {
        return {
           ...p,
           ...produtoAtualizado,
           estoque: Number(produtoAtualizado.estoque),
           preco: isNaN(precoFinal) ? 0 : precoFinal,
           precoCusto: isNaN(custoFinal) ? 0 : custoFinal
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

  // ==========================================
  // MÓDULO DE CLIENTES
  // ==========================================
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

  // ==========================================
  // MÓDULO DE VENDAS
  // ==========================================
  getVendas: () => {
    const data = localStorage.getItem(DB_KEYS.VENDAS);
    return data ? JSON.parse(data) : [];
  },

  salvarVenda: (venda) => {
    const vendas = db.getVendas();
    const novaVenda = { ...venda, id: Date.now(), data: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.VENDAS, JSON.stringify([novaVenda, ...vendas]));

    // Baixa de Stock
    const produtos = db.getProdutos();
    const novaListaProdutos = produtos.map(prod => {
      const itemVendido = venda.itens.find(i => i.id === prod.id);
      if (itemVendido) {
        return { ...prod, estoque: prod.estoque - itemVendido.qtd };
      }
      return prod;
    });
    localStorage.setItem(DB_KEYS.PRODUTOS, JSON.stringify(novaListaProdutos));

    // Lançamento Financeiro
    db.salvarLancamento({
        tipo: 'RECEITA',
        descricao: `Venda #${novaVenda.id} - ${venda.cliente}`,
        valor: novaVenda.total,
        vencimento: new Date().toISOString().split('T')[0],
        status: 'PAGO',
        categoria: 'Vendas'
    });

    return novaVenda;
  },

  // ==========================================
  // MÓDULO FINANCEIRO
  // ==========================================
  getFinanceiro: () => {
    const data = localStorage.getItem(DB_KEYS.FINANCEIRO);
    if (!data) {
      localStorage.setItem(DB_KEYS.FINANCEIRO, JSON.stringify(SEED_FINANCEIRO));
      return SEED_FINANCEIRO;
    }
    return JSON.parse(data);
  },

  salvarLancamento: (lancamento) => {
    const lista = db.getFinanceiro();
    const novo = { ...lancamento, id: Date.now(), status: lancamento.status || 'PENDENTE' };
    const novaLista = [novo, ...lista];
    localStorage.setItem(DB_KEYS.FINANCEIRO, JSON.stringify(novaLista));
    return novo;
  },

  atualizarStatusFinanceiro: (id) => {
    const lista = db.getFinanceiro();
    const novaLista = lista.map(item => {
        if (item.id === id) {
            return { ...item, status: item.status === 'PENDENTE' ? 'PAGO' : 'PENDENTE' };
        }
        return item;
    });
    localStorage.setItem(DB_KEYS.FINANCEIRO, JSON.stringify(novaLista));
    return novaLista;
  },

  removerLancamento: (id) => {
    const lista = db.getFinanceiro();
    const novaLista = lista.filter(item => item.id !== id);
    localStorage.setItem(DB_KEYS.FINANCEIRO, JSON.stringify(novaLista));
    return novaLista;
  },

  // ==========================================
  // DASHBOARD HOME
  // ==========================================
  getDashboardCompleto: () => {
    const vendas = db.getVendas();
    const produtos = db.getProdutos();
    const financeiro = db.getFinanceiro();

    const hoje = new Date().toLocaleDateString('pt-BR');
    const dataHojeIso = new Date().toISOString().split('T')[0];

    const vendasHojeList = vendas.filter(v => new Date(v.data).toLocaleDateString('pt-BR') === hoje);
    const faturamentoHoje = vendasHojeList.reduce((acc, v) => acc + v.total, 0);
    const qtdPedidosHoje = vendasHojeList.length;

    const contasPagar = financeiro.filter(f => f.tipo === 'DESPESA' && f.status === 'PENDENTE');
    const contasReceber = financeiro.filter(f => f.tipo === 'RECEITA' && f.status === 'PENDENTE');

    const aPagarHoje = contasPagar.filter(c => c.vencimento <= dataHojeIso).reduce((acc, c) => acc + c.valor, 0);
    const aReceberHoje = contasReceber.filter(c => c.vencimento <= dataHojeIso).reduce((acc, c) => acc + c.valor, 0);

    const baixoEstoque = produtos.filter(p => (p.estoque || 0) < 5);
    const totalCustoEstoque = produtos.reduce((acc, p) => acc + ((p.precoCusto || 0) * (p.estoque || 0)), 0);
    const totalVendaEstoque = produtos.reduce((acc, p) => acc + ((p.preco || 0) * (p.estoque || 0)), 0);
    const lucroPotencial = totalVendaEstoque - totalCustoEstoque;

    return {
      faturamentoHoje,
      qtdPedidosHoje,
      aPagarHoje,
      aReceberHoje,
      baixoEstoque: baixoEstoque.slice(0, 5),
      patrimonio: {
        custo: totalCustoEstoque,
        venda: totalVendaEstoque,
        lucroPrevisto: lucroPotencial
      }
    };
  },

  // ==========================================
  // RELATÓRIOS AVANÇADOS (BI & INTELLIGENCE)
  // ==========================================
  getDadosRelatorios: () => {
    const vendas = db.getVendas();
    const financeiro = db.getFinanceiro();
    const produtos = db.getProdutos();
    const clientes = db.getClientes();

    const ultimos7Dias = [];
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ultimos7Dias.push(d.toLocaleDateString('pt-BR').slice(0, 5));
    }

    const metricasPorDia = {};
    ultimos7Dias.forEach(dia => metricasPorDia[dia] = { total: 0, qtd: 0, custo: 0 });

    const performanceProdutos = {}; // { id: { nome, qtd, receita, custo } }
    const clientesCompradores = new Set();
    const pagamentosMap = {};

    vendas.forEach(v => {
        const dataVenda = new Date(v.data).toLocaleDateString('pt-BR').slice(0, 5);
        if (metricasPorDia[dataVenda]) {
            metricasPorDia[dataVenda].total += v.total;
            metricasPorDia[dataVenda].qtd += 1;
        }
        if(v.cliente && v.cliente !== "Consumidor Final") {
            clientesCompradores.add(v.cliente);
        }

        // Pagamentos (Quantidade e Valor)
        const metodo = v.metodo || "Outros";
        if (!pagamentosMap[metodo]) {
            pagamentosMap[metodo] = { qtd: 0, total: 0 };
        }
        pagamentosMap[metodo].qtd += 1;
        pagamentosMap[metodo].total += v.total;

        // Produtos
        v.itens.forEach(item => {
            if (!performanceProdutos[item.id]) {
                const prodCadastro = produtos.find(p => p.id === item.id);
                performanceProdutos[item.id] = {
                    name: item.nome,
                    qtd: 0,
                    receita: 0,
                    custoUnitario: prodCadastro ? (prodCadastro.precoCusto || 0) : 0
                };
            }
            performanceProdutos[item.id].qtd += item.qtd;
            performanceProdutos[item.id].receita += (item.preco * item.qtd);

            if (metricasPorDia[dataVenda]) {
                metricasPorDia[dataVenda].custo += (performanceProdutos[item.id].custoUnitario * item.qtd);
            }
        });
    });

    const fluxoCaixa = {};
    ultimos7Dias.forEach(dia => fluxoCaixa[dia] = { receitas: 0, despesas: 0 });
    financeiro.forEach(item => {
        if (item.vencimento) {
            const dataItem = new Date(item.vencimento + 'T12:00:00').toLocaleDateString('pt-BR').slice(0, 5);
            if (fluxoCaixa[dataItem]) {
                if (item.tipo === 'RECEITA') fluxoCaixa[dataItem].receitas += item.valor;
                else fluxoCaixa[dataItem].despesas += item.valor;
            }
        }
    });

    // Consolidar Arrays
    const historico = Object.keys(metricasPorDia).map(dia => {
        const m = metricasPorDia[dia];
        const f = fluxoCaixa[dia];
        return {
            name: dia,
            vendas: m.total,
            custo: m.custo,
            lucroBruto: m.total - m.custo,
            ticketMedio: m.qtd > 0 ? m.total / m.qtd : 0,
            receitas: f.receitas,
            despesas: f.despesas,
            resultado: f.receitas - f.despesas
        };
    });

    const matrizBCG = Object.values(performanceProdutos).map(p => {
        const custoTotal = p.custoUnitario * p.qtd;
        const lucro = p.receita - custoTotal;
        const margemPercentual = p.receita > 0 ? (lucro / p.receita) * 100 : 0;
        return {
            name: p.name,
            x: p.qtd,
            y: parseFloat(margemPercentual.toFixed(1)),
            z: p.receita
        };
    });

    const topProdutos = Object.values(performanceProdutos)
        .map(p => ({ name: p.name, value: p.qtd }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // KPIs Gerais
    const totalReceitas = historico.reduce((acc, d) => acc + d.receitas, 0);
    const totalDespesas = historico.reduce((acc, d) => acc + d.despesas, 0);
    const totalVendas = historico.reduce((acc, d) => acc + d.vendas, 0);
    const totalCustoVendas = historico.reduce((acc, d) => acc + d.custo, 0);
    const totalQtdVendas = historico.reduce((acc, d) => acc + metricasPorDia[d.name].qtd, 0);

    const taxaAtividade = clientes.length > 0 ? (clientesCompradores.size / clientes.length) * 100 : 0;

    const pagamentos = Object.keys(pagamentosMap).map(k => ({
        name: k,
        value: pagamentosMap[k].qtd,
        total: pagamentosMap[k].total
    }));

    const vendasPorHora = Array(24).fill(0);
    vendas.forEach(v => { if (v.data) vendasPorHora[new Date(v.data).getHours()] += 1; });

    // --- NOVO: INTELIGÊNCIA DE STOCK ---
    const estoqueAnalise = {
        valorStockParado: 0,
        qtdStockParado: 0,
        produtosCriticos: []
    };

    produtos.forEach(p => {
        // Se não vendeu nada no período analisado (performanceProdutos não tem o ID)
        if (!performanceProdutos[p.id] && p.estoque > 0) {
            estoqueAnalise.qtdStockParado += 1;
            estoqueAnalise.valorStockParado += (p.estoque * (p.precoCusto || 0));
        }

        // Cobertura de stock (se vende, quantos dias dura?)
        if (performanceProdutos[p.id]) {
            const mediaVendaDiaria = performanceProdutos[p.id].qtd / 7;
            const diasCobertura = mediaVendaDiaria > 0 ? p.estoque / mediaVendaDiaria : 999;

            if (diasCobertura < 3 && p.estoque > 0) { // Menos de 3 dias de stock
                estoqueAnalise.produtosCriticos.push({
                    nome: p.nome,
                    estoque: p.estoque,
                    dias: Math.floor(diasCobertura)
                });
            }
        }
    });

    return {
        historico,
        matrizBCG,
        topProdutos,
        kpis: {
            faturamento: totalReceitas,
            qtdVendas: totalQtdVendas,
            lucroLiquido: totalReceitas - totalDespesas,
            margemBruta: totalVendas > 0 ? ((totalVendas - totalCustoVendas) / totalVendas) * 100 : 0,
            ticketMedio: historico.reduce((acc, d) => acc + d.ticketMedio, 0) / 7,
            clientesAtivos: clientesCompradores.size,
            taxaAtividade: taxaAtividade
        },
        pagamentos,
        vendasPorHora: vendasPorHora.map((q, h) => ({ hora: `${h}h`, qtd: q })).filter((_, i) => i >= 6 && i <= 22),
        estoqueAnalise,
        raw: { vendas, produtos, financeiro }
    };
  }
};