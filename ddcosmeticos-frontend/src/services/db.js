/**
 * erinaldohen/ddcosmeticos-frontend/src/services/db.js
 * Sincronizado com as lógicas de Lote, Validade (FEFO) e NCM do Backend.
 */

export const db = {
  // --- PRODUTOS ---
  getProdutos: () => {
    const data = localStorage.getItem("dd-produtos");
    return data ? JSON.parse(data) : [];
  },

  getProdutoById: (id) => {
    const produtos = db.getProdutos();
    return produtos.find(p => p.id === Number(id));
  },

  addProduto: (produto) => {
    const produtos = db.getProdutos();
    const novo = {
      ...produto,
      id: Date.now(),
      dataCriacao: new Date().toISOString(),
      // Sincronização com Produto.java e EstoqueService.java
      quantidadeEmEstoque: produto.quantidadeEmEstoque || 0,
      precoMedioPonderado: produto.precoCusto || 0,
      ativo: true,
      ncm: produto.ncm || "", // Fiscal
      lote: produto.lote || "S/L", // Rastreabilidade
      validade: produto.validade || null, // FEFO (First Expired, First Out)
      estoqueMinimo: produto.estoqueMinimo || 0
    };
    localStorage.setItem("dd-produtos", JSON.stringify([...produtos, novo]));
    return novo;
  },

  updateProduto: (id, dados) => {
    const produtos = db.getProdutos();
    const index = produtos.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      produtos[index] = { ...produtos[index], ...dados };
      localStorage.setItem("dd-produtos", JSON.stringify(produtos));
    }
  },

  // --- VENDAS (Sincronizado com VendaController.java) ---
  getVendas: () => {
    const data = localStorage.getItem("dd-vendas");
    return data ? JSON.parse(data) : [];
  },

  addVenda: (venda) => {
    const vendas = db.getVendas();
    const novaVenda = {
      ...venda,
      id: Date.now(),
      data: new Date().toISOString(),
      statusFiscal: venda.ehOrcamento ? "ORCAMENTO" : "PENDENTE" // Lógica de VendaController.java
    };
    localStorage.setItem("dd-vendas", JSON.stringify([...vendas, novaVenda]));
    return novaVenda;
  },

  // --- CONFIGURAÇÕES DE HARDWARE ---
  getImpressoraTipo: () => {
    return localStorage.getItem("dd-tipo-papel") || "58mm";
  },

  setImpressoraTipo: (tipo) => {
    localStorage.setItem("dd-tipo-papel", tipo);
  }
};