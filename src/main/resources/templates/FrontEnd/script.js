/* ══════════════════════════════════════
   CONFIGURAÇÃO DA API
   ↓ Ajuste a URL base conforme necessário
══════════════════════════════════════ */
const API = 'http://localhost:8080';

// Token JWT armazenado após login
let authToken = localStorage.getItem('orderflow_token') || null;

// Estado local (cache dos dados da API)
let state = {
  currentUser: null,
  clientes: [],
  produtos: [],
  pedidos: [],
  cart: [],
  pedidoFilter: 'TODOS'
};

// ID do produto sendo editado (null = modo "novo")
let editingProdutoId = null;

// Tipo de documento selecionado no modal de Novo Cliente ('CPF' | 'CNPJ')
let tipoClienteAtual = 'CPF';

// Controle da busca paginada de produtos (nome/sku) no backend
let produtoBuscaAtiva = false;
let produtoSearchTermoAtual = '';
let produtoSearchDebounceTimer = null;

/* ══════════════════════════════════════
   PAGINAÇÃO
   Um controle de página por entidade
══════════════════════════════════════ */
const paginacao = {
  clientes: { pagina: 0, tamanho: 10, totalPaginas: 0, totalElementos: 0 },
  produtos: { pagina: 0, tamanho: 10, totalPaginas: 0, totalElementos: 0 },
  pedidos:  { pagina: 0, tamanho: 10, totalPaginas: 0, totalElementos: 0 }
};

const ENDPOINTS_LISTAR = {
  clientes: '/api/clientes/listar',
  produtos: '/api/produtos/listar',
  pedidos:  '/api/pedidos/listar'
};

/* ══════════════════════════════════════
   HELPER: fetch com autenticação
══════════════════════════════════════ */
async function apiFetch(path, options = {}) {
  // 1. Busca o token mais recente do localStorage
  const token = localStorage.getItem('orderflow_token') || authToken;

  // 2. Prepara os cabeçalhos
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // 3. Se houver token, adiciona no formato Bearer
  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }

  // 4. Dispara a requisição
  const res = await fetch(`${API}${path}`, { ...options, headers });

  // 5. Se o Spring Security barrar (401 ou 403), desloga o usuário
  if (res.status === 401 || res.status === 403) {
    doLogout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  // 6. Extrai o JSON (mantido para não quebrar o resto do seu código)
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    const msg = data?.message || data?.erro || `Erro ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* ══════════════════════════════════════
   AUTH
══════════════════════════════════════ */
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}
function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function limparCPF(valor) {
  return (valor || '').replace(/\D/g, ''); // remove tudo que não é número
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.innerHTML = '';

  if (!email || !senha) {
    errEl.innerHTML = '<div class="alert alert-error">Preencha todos os campos.</div>';
    return;
  }

  try {
    const user = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    loginSuccess(user);
  } catch (err) {
    errEl.innerHTML = `<div class="alert alert-error">${err.message || 'E-mail ou senha incorretos.'}</div>`;
  }
}

async function doRegister() {
  const nome    = document.getElementById('regNome').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const cpf = limparCPF(document.getElementById('regCpf').value);
  const senha   = document.getElementById('regSenha').value;
  const confirm = document.getElementById('regConfirm').value;
  const errEl   = document.getElementById('registerError');
  errEl.innerHTML = '';

  if (!nome || !email || !cpf || !senha) {
    errEl.innerHTML = '<div class="alert alert-error">Preencha todos os campos.</div>';
    return;
  }
  if (senha !== confirm) {
    errEl.innerHTML = '<div class="alert alert-error">As senhas não conferem.</div>';
    return;
  }
  if (senha.length < 6) {
    errEl.innerHTML = '<div class="alert alert-error">Senha deve ter no mínimo 6 caracteres.</div>';
    return;
  }

  try {
    const user = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, cpf, senha })
    });

    loginSuccess(user);
  } catch (err) {
    errEl.innerHTML = `<div class="alert alert-error">${err.message || 'Erro ao criar conta.'}</div>`;
  }
}

function loginSuccess(user) {
  authToken = user.token || user.jwt || authToken;
  if (authToken) {
    localStorage.setItem('orderflow_token', authToken);
  }

  state.currentUser = user;
  localStorage.setItem('orderflow_user', JSON.stringify(user));
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');

  const nome = user.nome || user.name || 'Usuário';
  const initials = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('avatarInit').textContent = initials;
  document.getElementById('userNameDisplay').textContent = nome;

  loadAll();
  showToast('success', `Bem-vindo, ${nome.split(' ')[0]}! 👋`);
}

function doLogout() {
  authToken = null;
  state.currentUser = null;
  state.clientes = [];
  state.produtos = [];
  state.pedidos = [];
  paginacao.clientes.pagina = 0;
  paginacao.produtos.pagina = 0;
  paginacao.pedidos.pagina = 0;
  produtoBuscaAtiva = false;
  produtoSearchTermoAtual = '';
  localStorage.removeItem('orderflow_token');
  localStorage.removeItem('orderflow_user');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  showLogin();
}

/* ══════════════════════════════════════
   CARREGAMENTO PAGINADO (API)
══════════════════════════════════════ */

// Busca uma página específica de uma entidade ('clientes' | 'produtos' | 'pedidos')
async function carregarPagina(entidade) {
  const p = paginacao[entidade];
  const endpoint = ENDPOINTS_LISTAR[entidade];

  try {
    const dados = await apiFetch(`${endpoint}?page=${p.pagina}&size=${p.tamanho}`);

    // Compatível tanto com Page<T> do Spring quanto com array puro
    const conteudo = Array.isArray(dados) ? dados : (dados.content || dados.data || []);
    state[entidade] = conteudo;

    if (!Array.isArray(dados)) {
      // Resposta paginada do Spring (Page<T>)
      p.totalPaginas = dados.totalPages ?? 0;
      atualizarControlesPaginacao(entidade, dados);
    } else {
      // Fallback: backend não pagina, esconde os controles
      p.totalPaginas = 1;
      atualizarControlesPaginacao(entidade, { number: 0, totalPages: 1, first: true, last: true });
    }
  } catch (err) {
    state[entidade] = [];
    showToast('error', `Erro ao carregar ${entidade}`);
  }
}

/* ── Busca paginada de produtos por nome/sku (backend) ──
   Endpoint: GET /api/produtos/buscar?nome=&sku=&page=&size=
   Retorna qualquer produto cujo nome OU sku bata com o termo digitado. */
async function carregarBuscaProdutos() {
  const p = paginacao.produtos;
  try {
    const qs = new URLSearchParams({
      nome: produtoSearchTermoAtual,
      sku: produtoSearchTermoAtual,
      page: p.pagina,
      size: p.tamanho
    });

    const dados = await apiFetch(`/api/produtos/buscar?${qs.toString()}`);
    const conteudo = Array.isArray(dados) ? dados : (dados.content || dados.data || []);
    state.produtos = conteudo;

    if (!Array.isArray(dados)) {
      p.totalPaginas = dados.totalPages ?? 0;
      atualizarControlesPaginacao('produtos', dados);
    } else {
      p.totalPaginas = 1;
      atualizarControlesPaginacao('produtos', { number: 0, totalPages: 1, first: true, last: true });
    }

    const semResultado = document.getElementById('semResultadoProdutos');
    if (semResultado) semResultado.classList.toggle('hidden', conteudo.length > 0);
  } catch (err) {
    state.produtos = [];
    showToast('error', 'Erro ao buscar produtos');
  }
}

function atualizarControlesPaginacao(entidade, dados) {
  paginacao[entidade].totalElementos = dados.totalElements ?? state[entidade].length;
  renderPaginacao(entidade);
}

/* ── Componente de paginação (renderizado dinamicamente) ──
   Requer apenas uma div no HTML: <div id="paginacao-clientes"></div>
   (troque "clientes" por "produtos" / "pedidos" em cada seção)          */
function renderPaginacao(entidade) {
  const container = document.getElementById(`paginacao-${entidade}`);
  if (!container) return; // div ainda não existe no HTML dessa seção

  const p = paginacao[entidade];
  const paginaAtual  = p.pagina;       // 0-indexed
  const totalPaginas = p.totalPaginas || 1;

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  // Calcula o range de itens sendo exibidos (ex: "Mostrando 11–20 de 47")
  const inicio = paginaAtual * p.tamanho + 1;
  const fim    = Math.min(inicio + p.tamanho - 1, p.totalElementos);

  // Gera a lista de números de página a exibir, com "..." quando há muitas
  const paginas = gerarRangePaginas(paginaAtual, totalPaginas);

  const botoesNumeros = paginas.map(pg => {
    if (pg === '...') {
      return `<span class="pg-ellipsis">···</span>`;
    }
    const ativo = pg === paginaAtual;
    return `<button class="pg-num ${ativo ? 'active' : ''}" ${ativo ? 'disabled' : ''} onclick="irParaPagina('${entidade}', ${pg})">${pg + 1}</button>`;
  }).join('');

  container.innerHTML = `
    <div class="paginacao-bar">
      <span class="pg-info">${p.totalElementos ? `Mostrando ${inicio}–${fim} de ${p.totalElementos}` : ''}</span>
      <div class="pg-controles">
        <button class="pg-nav" ${paginaAtual === 0 ? 'disabled' : ''} onclick="mudarPagina('${entidade}', -1)" title="Página anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="pg-numeros">${botoesNumeros}</div>
        <button class="pg-nav" ${paginaAtual >= totalPaginas - 1 ? 'disabled' : ''} onclick="mudarPagina('${entidade}', 1)" title="Próxima página">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  `;
}

// Decide quais números mostrar: sempre 1ª, última, atual ±1, com "..." no meio
function gerarRangePaginas(atual, total) {
  const janela = 1; // quantas páginas mostrar de cada lado da atual
  const paginas = [];

  for (let i = 0; i < total; i++) {
    const ehExtremidade = i === 0 || i === total - 1;
    const ehVizinha = Math.abs(i - atual) <= janela;

    if (ehExtremidade || ehVizinha) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== '...') {
      paginas.push('...');
    }
  }
  return paginas;
}

// Clique direto em um número de página
async function irParaPagina(entidade, numeroPagina) {
  const p = paginacao[entidade];
  if (numeroPagina === p.pagina || numeroPagina < 0 || numeroPagina >= p.totalPaginas) return;

  p.pagina = numeroPagina;
  if (entidade === 'produtos' && produtoBuscaAtiva) {
    await carregarBuscaProdutos();
  } else {
    await carregarPagina(entidade);
  }
  rerenderTabela(entidade);
}

// Chamado pelos botões "Anterior" / "Próximo" de cada tabela
async function mudarPagina(entidade, direcao) {
  const p = paginacao[entidade];
  const novaPagina = p.pagina + direcao;

  if (novaPagina < 0 || novaPagina >= p.totalPaginas) return;

  p.pagina = novaPagina;
  if (entidade === 'produtos' && produtoBuscaAtiva) {
    await carregarBuscaProdutos();
  } else {
    await carregarPagina(entidade);
  }
  rerenderTabela(entidade);
}

function rerenderTabela(entidade) {
  if (entidade === 'clientes') renderClientes();
  if (entidade === 'produtos') renderProdutos();
  if (entidade === 'pedidos')  renderPedidos();

  // Dashboard depende de pedidos/produtos/clientes, então atualiza também
  renderDashboard();
}

async function loadAll() {
  await Promise.all([
    carregarPagina('clientes'),
    carregarPagina('produtos'),
    carregarPagina('pedidos')
  ]);

  renderAll();
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function goPage(page, el) {
  document.querySelectorAll('[data-page]').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  const titles = { dashboard:'Dashboard', pedidos:'Pedidos', produtos:'Produtos', clientes:'Clientes' };
  document.getElementById('pageTitle').textContent = titles[page] || page;
}

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
function openModal(id) {
  if (id === 'modalNovoPedido') populatePedidoSelects();
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'modalNovoPedido') { state.cart = []; renderCart(); }
  if (id === 'modalNovoProduto') { resetProdutoForm(); }
  if (id === 'modalNovoCliente') { resetClienteForm(); }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    // O modal de confirmação tem sua própria lógica de cancelamento
    // (precisa disparar o callback de "cancelar" antes de fechar)
    if (e.target.id === 'modalConfirmacao') {
      cancelarConfirmacao();
      return;
    }
    // Enquanto o pedido está sendo enviado (aguardando resposta/e-mail),
    // não deixa fechar clicando fora do modal
    if (e.target.id === 'modalNovoPedido' && criandoPedido) {
      return;
    }
    e.target.classList.remove('open');
    state.cart = [];
    renderCart();
  }
});

/* ══════════════════════════════════════
   MODAL DE CONFIRMAÇÃO (genérico)
   Usado para: exclusão de registros e
   alteração de status de pedido.
══════════════════════════════════════ */
let confirmacaoCallbackOk = null;
let confirmacaoCallbackCancel = null;

/**
 * Abre o modal de confirmação genérico.
 * titulo        -> título exibido no modal
 * mensagem      -> texto explicando a ação
 * onConfirmar   -> função chamada se o usuário confirmar
 * variante      -> 'danger' (vermelho, para exclusões) ou 'primary' (para outras ações)
 * onCancelar    -> (opcional) função chamada se o usuário cancelar/fechar o modal
 */
function abrirConfirmacao(titulo, mensagem, onConfirmar, variante = 'danger', onCancelar = null) {
  document.getElementById('confirmTitulo').textContent = titulo;
  document.getElementById('confirmMensagem').textContent = mensagem;

  const btnOk = document.getElementById('confirmBotaoOk');
  btnOk.className = variante === 'primary' ? 'btn btn-primary' : 'btn btn-danger';

  confirmacaoCallbackOk = onConfirmar;
  confirmacaoCallbackCancel = onCancelar;

  openModal('modalConfirmacao');
}

function cancelarConfirmacao() {
  const cb = confirmacaoCallbackCancel;
  confirmacaoCallbackOk = null;
  confirmacaoCallbackCancel = null;
  document.getElementById('modalConfirmacao').classList.remove('open');
  if (cb) cb();
}

function confirmarAcao() {
  const cb = confirmacaoCallbackOk;
  confirmacaoCallbackOk = null;
  confirmacaoCallbackCancel = null;
  document.getElementById('modalConfirmacao').classList.remove('open');
  if (cb) cb();
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(type, msg) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  t.innerHTML = `<span style="color:${type==='success'?'var(--green)':'var(--red)'}">${icon}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ══════════════════════════════════════
   MASKS — CPF / CNPJ / CEP
══════════════════════════════════════ */
function maskCPF(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  el.value = v;
}

function maskCNPJ(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 14) v = v.slice(0, 14);
  v = v.replace(/(\d{2})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1/$2');
  v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  el.value = v;
}

function maskCEP(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  el.value = v;

  // Assim que o CEP tiver os 8 dígitos, busca o endereço automaticamente
  if (v.replace(/\D/g, '').length === 8) {
    buscarCEP(el);
  }
}

/* ══════════════════════════════════════
   BUSCA DE ENDEREÇO POR CEP (ViaCEP)
   Endpoint: https://viacep.com.br/ws/{cep}/json/
══════════════════════════════════════ */
async function buscarCEP(el) {
  const cepLimpo = el.value.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return; // só busca quando tiver os 8 dígitos

  // feedback visual simples enquanto busca
  el.disabled = true;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await res.json();

    if (dados.erro) {
      showToast('error', 'CEP não encontrado');
      return;
    }

    preencherEnderecoCliente(dados);
    showToast('success', 'Endereço preenchido automaticamente!');
  } catch (err) {
    showToast('error', 'Erro ao buscar CEP');
  } finally {
    el.disabled = false;
  }
}

// Mapeia o retorno do ViaCEP para os campos do formulário de cliente
function preencherEnderecoCliente(dados) {
  const campos = {
    cliLogradouro: dados.logradouro,
    cliComplemento: dados.complemento,
    cliBairro: dados.bairro,
    cliLocalidade: dados.localidade, // campo "Cidade" no formulário
    cliUf: dados.uf,
    cliEstado: dados.estado,
    cliRegiao: dados.regiao
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.value = valor || '';
  });

  // Foca no campo de número/complemento para o usuário continuar o preenchimento
  const logradouroEl = document.getElementById('cliLogradouro');
  if (logradouroEl) logradouroEl.focus();
}

// Aplica a máscara certa no campo de documento do modal de cliente,
// conforme o tipo (CPF/CNPJ) selecionado no momento
function maskDocumento(el) {
  if (tipoClienteAtual === 'CNPJ') maskCNPJ(el);
  else maskCPF(el);
}

/* ══════════════════════════════════════
   CLIENTES
══════════════════════════════════════ */

// Alterna entre Pessoa Física (CPF) e Pessoa Jurídica (CNPJ) no modal de Novo Cliente
function toggleTipoCliente(tipo, el) {
  tipoClienteAtual = tipo;

  document.querySelectorAll('#tipoClienteTabs .tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  const nomeLabel = document.getElementById('cliNomeLabel');
  const nomeInput = document.getElementById('cliNome');
  const docLabel  = document.getElementById('cliDocLabel');
  const docInput  = document.getElementById('cliDocumento');

  docInput.value = ''; // evita enviar documento com formato/tamanho do tipo anterior

  if (tipo === 'CNPJ') {
    nomeLabel.textContent = 'Nome da empresa/Fantasia';
    nomeInput.placeholder = 'Empresa Exemplo Ltda';
    docLabel.textContent = 'CNPJ';
    docInput.placeholder = '00.000.000/0000-00';
    docInput.maxLength = 18;
  } else {
    nomeLabel.textContent = 'Nome completo';
    nomeInput.placeholder = 'João da Silva';
    docLabel.textContent = 'CPF';
    docInput.placeholder = '000.000.000-00';
    docInput.maxLength = 14;
  }
}

function resetClienteForm() {
  [
    'cliNome', 'cliEmail', 'cliDocumento',
    'cliCep', 'cliLogradouro', 'cliComplemento', 'cliBairro',
    'cliLocalidade', 'cliUf', 'cliEstado', 'cliRegiao'
  ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

  const tabCpf = document.querySelector('#tipoClienteTabs .tab[data-tipo="CPF"]');
  toggleTipoCliente('CPF', tabCpf);
}

async function criarCliente() {
  const nome      = document.getElementById('cliNome').value.trim();
  const email     = document.getElementById('cliEmail').value.trim();
  const documento = limparCPF(document.getElementById('cliDocumento').value); // remove pontuação, serve para CPF ou CNPJ

  const endereco = {
    cep: document.getElementById('cliCep').value.trim(),
    logradouro: document.getElementById('cliLogradouro').value.trim(),
    complemento: document.getElementById('cliComplemento').value.trim(),
    bairro: document.getElementById('cliBairro').value.trim(),
    localidade: document.getElementById('cliLocalidade').value.trim(),
    uf: document.getElementById('cliUf').value.trim(),
    estado: document.getElementById('cliEstado').value.trim(),
    regiao: document.getElementById('cliRegiao').value.trim()
  };

  if (!nome || !email || !documento) {
    showToast('error', 'Preencha todos os campos obrigatórios');
    return;
  }

  // Validação da quantidade de dígitos conforme o tipo selecionado
  const tamanhoEsperado = tipoClienteAtual === 'CNPJ' ? 14 : 11;
  if (documento.length !== tamanhoEsperado) {
    showToast('error', `${tipoClienteAtual} inválido: informe ${tamanhoEsperado} dígitos.`);
    return;
  }

  // Endpoint único — envia cpf ou cnpj no mesmo DTO, conforme o tipo selecionado
  // tipoPessoa é obrigatório para o backend decidir qual campo persistir
  const payload = tipoClienteAtual === 'CNPJ'
    ? { nome, email, tipoPessoa: 'PESSOA_JURIDICA', cpf: null, cnpj: documento, endereco }
    : { nome, email, tipoPessoa: 'PESSOA_FISICA', cpf: documento, cnpj: null, endereco };

  try {
    await apiFetch('/api/clientes/cadastrar/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Volta para a primeira página e recarrega para refletir o novo registro
    paginacao.clientes.pagina = 0;
    await carregarPagina('clientes');

    closeModal('modalNovoCliente');
    renderAll();
    resetClienteForm();
    showToast('success', 'Cliente cadastrado com sucesso!');
  } catch (err) {
    showToast('error', err.message || 'Erro ao cadastrar cliente');
  }
}

function renderClientes() {
  const tbody = document.getElementById('tabelaClientes');
  if (!state.clientes.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px">Nenhum cliente cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = state.clientes.map(c => {
    const id       = c.id;
    const nome     = c.nome || c.name || '';
    const email    = c.email || '';
    const doc      = c.cpf || c.cnpj || '';
    const cadastro = c.dataCadastro || c.createdAt || '';
    return `
    <tr>
      <td><span class="primary">${nome}</span></td>
      <td>${email}</td>
      <td>${doc}</td>
      <td>${cadastro ? cadastro.split('T')[0] : ''}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editarCliente(${id})">Alterar</button>
          <button class="btn btn-danger btn-sm" onclick="removeCliente(${id})">Remover</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function editarCliente(id) {
  const cli = state.clientes.find(c => String(c.id) === String(id));
  if (!cli) return;

  document.getElementById('editCliId').value    = cli.id;
  document.getElementById('editCliNome').value  = cli.nome || cli.name || '';
  document.getElementById('editCliCpf').value   = cli.cpf || cli.cnpj || '';
  document.getElementById('editCliEmail').value = cli.email || '';

  openModal('modalEditarCliente');
}

async function salvarEmailCliente() {
  const id    = document.getElementById('editCliId').value;
  const email = document.getElementById('editCliEmail').value.trim();

  if (!email) { showToast('error', 'Informe um e-mail válido'); return; }

  try {
    await apiFetch(`/api/clientes/editar/email/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ id: parseInt(id), email })
    });

    // Recarrega a página atual para refletir a alteração
    await carregarPagina('clientes');

    closeModal('modalEditarCliente');
    renderAll();
    showToast('success', 'E-mail atualizado com sucesso!');
  } catch (err) {
    showToast('error', err.message || 'Erro ao atualizar e-mail');
  }
}

// Abre a confirmação antes de remover o cliente
function removeCliente(id) {
  const cli = state.clientes.find(c => String(c.id) === String(id));
  const nome = cli ? (cli.nome || cli.name) : '';

  abrirConfirmacao(
    'Remover cliente',
    `Tem certeza que deseja remover${nome ? ` "${nome}"` : ' este cliente'}? Essa ação não pode ser desfeita.`,
    () => executarRemoverCliente(id),
    'danger'
  );
}

// Só executa a exclusão de fato depois que o usuário confirma no modal
async function executarRemoverCliente(id) {
  try {
    await apiFetch(`/api/clientes/${id}`, { method: 'DELETE' });

    // Se era o último item da página e não é a primeira, volta uma página
    if (state.clientes.length === 1 && paginacao.clientes.pagina > 0) {
      paginacao.clientes.pagina -= 1;
    }
    await carregarPagina('clientes');

    renderAll();
    showToast('success', 'Cliente removido.');
  } catch (err) {
    showToast('error', err.message || 'Erro ao remover cliente');
  }
}

/* ══════════════════════════════════════
   PRODUTOS
══════════════════════════════════════ */
function resetProdutoForm() {
  editingProdutoId = null;
  document.getElementById('produtoModalTitle').textContent = 'Novo Produto';
  document.getElementById('btnSalvarProduto').textContent = 'Salvar Produto';
  ['prodNome','prodPreco','prodEstoque','prodSku','prodCategoria','prodMarca']
    .forEach(id => document.getElementById(id).value = '');
}

function editarProduto(id) {
  const prod = state.produtos.find(p => String(p.id) === String(id));
  if (!prod) return;

  editingProdutoId = id;
  document.getElementById('produtoModalTitle').textContent = 'Alterar Produto';
  document.getElementById('btnSalvarProduto').textContent = 'Salvar Alterações';

  document.getElementById('prodNome').value      = getProdutoNome(prod);
  document.getElementById('prodSku').value        = prod.sku || '';
  document.getElementById('prodPreco').value      = getProdutoPreco(prod);
  document.getElementById('prodEstoque').value    = getProdutoEstoque(prod);
  document.getElementById('prodCategoria').value  = prod.categoria || '';
  document.getElementById('prodMarca').value      = prod.marca || '';

  openModal('modalNovoProduto');
}

async function criarProduto() {
  const nome = document.getElementById('prodNome').value.trim();
  const sku  = document.getElementById('prodSku').value.trim();
  const preco = parseFloat(document.getElementById('prodPreco').value);
  const marca = document.getElementById('prodMarca').value.trim();
  const quantidadeEstoque = parseInt(document.getElementById('prodEstoque').value);
  const categoria = document.getElementById('prodCategoria').value.trim();

  if (!nome || isNaN(preco) || isNaN(quantidadeEstoque)) {
    showToast('error', 'Preencha todos os campos corretamente');
    return;
  }
  if (preco <= 0) { showToast('error', 'Preço deve ser maior que zero'); return; }

  const payload = { nome, sku, preco, marca, quantidadeEstoque, categoria };

  try {
    if (editingProdutoId) {
      await apiFetch(`/api/produtos/editar/${editingProdutoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      // Recarrega a página/busca atual para refletir a alteração
      if (produtoBuscaAtiva) {
        await carregarBuscaProdutos();
      } else {
        await carregarPagina('produtos');
      }

      closeModal('modalNovoProduto');
      renderAll();
      showToast('success', 'Produto atualizado!');
    } else {
      await apiFetch('/api/produtos/cadastrar', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Volta para a primeira página e recarrega para refletir o novo registro
      paginacao.produtos.pagina = 0;
      if (produtoBuscaAtiva) {
        await carregarBuscaProdutos();
      } else {
        await carregarPagina('produtos');
      }

      closeModal('modalNovoProduto');
      renderAll();
      showToast('success', 'Produto cadastrado!');
    }

    resetProdutoForm();
  } catch (err) {
    showToast('error', err.message || 'Erro ao salvar produto');
  }
}

function renderProdutos() {
  const tbody = document.getElementById('tabelaProdutos');
  if (!state.produtos.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:40px">Nenhum produto cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = state.produtos.map(p => {
    const nome      = p.nome || p.name || '';
    const sku       = p.sku || '—';
    const categoria = p.categoria || '—';
    const marca     = p.marca || '—';
    const preco     = p.preco || p.price || 0;
    const estoque   = p.quantidadeEstoque ?? p.qtdEstoque ?? p.estoque ?? p.quantity ?? 0;
    return `
    <tr>
      <td><span class="primary">${nome}</span></td>
      <td>${sku}</td>
      <td>R$ ${Number(preco).toFixed(2)}</td>
      <td>${marca}</td>
      <td>${estoque}</td>
      <td>${categoria}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editarProduto('${p.id}')">Alterar</button>
          <button class="btn btn-danger btn-sm" onclick="removeProduto('${p.id}')">Remover</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// Abre a confirmação antes de remover o produto
function removeProduto(id) {
  const prod = state.produtos.find(p => String(p.id) === String(id));
  const nome = prod ? getProdutoNome(prod) : '';

  abrirConfirmacao(
    'Remover produto',
    `Tem certeza que deseja remover${nome ? ` "${nome}"` : ' este produto'}? Essa ação não pode ser desfeita.`,
    () => executarRemoverProduto(id),
    'danger'
  );
}

// Só executa a exclusão de fato depois que o usuário confirma no modal
async function executarRemoverProduto(id) {
  try {
    await apiFetch(`/api/produtos/${id}`, { method: 'DELETE' });

    if (state.produtos.length === 1 && paginacao.produtos.pagina > 0) {
      paginacao.produtos.pagina -= 1;
    }
    if (produtoBuscaAtiva) {
      await carregarBuscaProdutos();
    } else {
      await carregarPagina('produtos');
    }

    renderAll();
    showToast('success', 'Produto removido.');
  } catch (err) {
    showToast('error', err.message || 'Erro ao remover produto');
  }
}

/* ── Busca de produtos por nome/sku (backend, paginada, com debounce) ──
   Endpoint: GET /api/produtos/buscar?nome=&sku=&page=&size=
   Ao limpar o campo, volta para a listagem paginada normal.          */
function onProdutoSearchInput(termo) {
  clearTimeout(produtoSearchDebounceTimer);
  produtoSearchDebounceTimer = setTimeout(() => executarBuscaProduto(termo), 300);
}

async function executarBuscaProduto(termoBruto) {
  const termo = (termoBruto || '').trim();

  // Campo limpo -> volta pra listagem paginada normal
  if (!termo) {
    produtoBuscaAtiva = false;
    produtoSearchTermoAtual = '';
    paginacao.produtos.pagina = 0;
    await carregarPagina('produtos');
    rerenderTabela('produtos');
    const semResultado = document.getElementById('semResultadoProdutos');
    if (semResultado) semResultado.classList.add('hidden');
    return;
  }

  produtoBuscaAtiva = true;
  produtoSearchTermoAtual = termo;
  paginacao.produtos.pagina = 0; // toda nova busca reinicia na página 0
  await carregarBuscaProdutos();
  rerenderTabela('produtos');
}

/* ══════════════════════════════════════
   PEDIDOS
══════════════════════════════════════ */
function getProdutoEstoque(p) {
  return p.quantidadeEstoque ?? p.qtdEstoque ?? p.estoque ?? p.quantity ?? 0;
}
function getProdutoPreco(p) {
  return p.preco || p.price || 0;
}
function getProdutoNome(p) {
  return p.nome || p.name || '';
}

function populatePedidoSelects() {
  // Limpa a busca de cliente e produto ao abrir o modal
  const clienteBusca = document.getElementById('pedidoClienteBusca');
  const produtoBusca = document.getElementById('pedidoProdutoBusca');
  if (clienteBusca) clienteBusca.value = '';
  document.getElementById('pedidoClienteId').value = '';
  if (produtoBusca) produtoBusca.value = '';
  document.getElementById('pedidoProdutoId').value = '';
  fecharListaAutocomplete('pedidoClienteLista');
  fecharListaAutocomplete('pedidoProdutoLista');

  state.cart = [];
  renderCart();
}

/* ── Autocomplete: Cliente (modal Novo Pedido) ──
   Filtra pelo nome (e também por CPF/CNPJ, ignorando pontuação)
   dentro dos clientes já carregados em state.clientes.               */
function buscarClientePedido(termo) {
  const lista = document.getElementById('pedidoClienteLista');
  const termoLimpo = normalizarTexto(termo);

  // Se o texto não bate mais com o cliente selecionado, invalida a seleção
  const idAtual = document.getElementById('pedidoClienteId').value;
  if (idAtual) {
    const selecionado = state.clientes.find(c => String(c.id) === String(idAtual));
    if (!selecionado || normalizarTexto(selecionado.nome || selecionado.name || '') !== normalizarTexto(termo)) {
      document.getElementById('pedidoClienteId').value = '';
    }
  }

  const resultados = state.clientes.filter(c => {
    const nome = normalizarTexto(c.nome || c.name || '');
    const doc  = normalizarTexto(c.cpf || c.cnpj || '');
    return termoLimpo === '' || nome.includes(termoLimpo) || doc.includes(termoLimpo);
  }).slice(0, 8);

  if (!resultados.length) {
    lista.innerHTML = `<div class="autocomplete-vazio">Nenhum cliente encontrado</div>`;
  } else {
    lista.innerHTML = resultados.map(c => `
      <div class="autocomplete-item" onclick="selecionarClientePedido(${c.id})">
        <span class="ac-titulo">${c.nome || c.name || ''}</span>
        <span class="ac-sub">${c.cpf || c.cnpj || c.email || ''}</span>
      </div>
    `).join('');
  }
  lista.classList.remove('hidden');
}

function selecionarClientePedido(id) {
  const cli = state.clientes.find(c => String(c.id) === String(id));
  if (!cli) return;
  document.getElementById('pedidoClienteBusca').value = cli.nome || cli.name || '';
  document.getElementById('pedidoClienteId').value = cli.id;
  fecharListaAutocomplete('pedidoClienteLista');
}

/* ── Autocomplete: Produto (modal Novo Pedido) ──
   Só sugere produtos com estoque disponível.                          */
function buscarProdutoPedido(termo) {
  const lista = document.getElementById('pedidoProdutoLista');
  const termoLimpo = normalizarTexto(termo);

  const idAtual = document.getElementById('pedidoProdutoId').value;
  if (idAtual) {
    const selecionado = state.produtos.find(p => String(p.id) === String(idAtual));
    if (!selecionado || normalizarTexto(getProdutoNome(selecionado)) !== normalizarTexto(termo)) {
      document.getElementById('pedidoProdutoId').value = '';
    }
  }

  const disponiveis = state.produtos.filter(p => getProdutoEstoque(p) > 0);
  const resultados = disponiveis.filter(p => {
    const nome = normalizarTexto(getProdutoNome(p));
    const sku  = normalizarTexto(p.sku || '');
    return termoLimpo === '' || nome.includes(termoLimpo) || sku.includes(termoLimpo);
  }).slice(0, 8);

  if (!disponiveis.length) {
    lista.innerHTML = `<div class="autocomplete-vazio">Nenhum produto com estoque</div>`;
  } else if (!resultados.length) {
    lista.innerHTML = `<div class="autocomplete-vazio">Nenhum produto encontrado</div>`;
  } else {
    lista.innerHTML = resultados.map(p => `
      <div class="autocomplete-item" onclick="selecionarProdutoPedido(${p.id})">
        <span class="ac-titulo">${getProdutoNome(p)}</span>
        <span class="ac-sub">R$ ${Number(getProdutoPreco(p)).toFixed(2)} · estoque: ${getProdutoEstoque(p)}</span>
      </div>
    `).join('');
  }
  lista.classList.remove('hidden');
}

function selecionarProdutoPedido(id) {
  const prod = state.produtos.find(p => String(p.id) === String(id));
  if (!prod) return;
  document.getElementById('pedidoProdutoBusca').value = getProdutoNome(prod);
  document.getElementById('pedidoProdutoId').value = prod.id;
  fecharListaAutocomplete('pedidoProdutoLista');
}

function fecharListaAutocomplete(listaId) {
  const lista = document.getElementById(listaId);
  if (lista) lista.classList.add('hidden');
}

// Fecha as listas de autocomplete ao clicar fora delas
document.addEventListener('click', e => {
  if (!e.target.closest('#pedidoClienteBusca') && !e.target.closest('#pedidoClienteLista')) {
    fecharListaAutocomplete('pedidoClienteLista');
  }
  if (!e.target.closest('#pedidoProdutoBusca') && !e.target.closest('#pedidoProdutoLista')) {
    fecharListaAutocomplete('pedidoProdutoLista');
  }
});

function addCartItem() {
  const pId = parseInt(document.getElementById('pedidoProdutoId').value);
  const qtd = parseInt(document.getElementById('pedidoQtd').value);
  if (!pId) { showToast('error', 'Selecione um produto na lista de sugestões'); return; }
  if (!qtd || qtd < 1) { showToast('error', 'Informe uma quantidade válida'); return; }
  const prod = state.produtos.find(p => p.id === pId);
  if (!prod) return;
  const existing = state.cart.find(i => i.produtoId === pId);
  const totalQtd = (existing ? existing.quantidade : 0) + qtd;
  if (totalQtd > getProdutoEstoque(prod)) {
    showToast('error', `Estoque insuficiente! Disponível: ${getProdutoEstoque(prod)}`);
    return;
  }
  if (existing) existing.quantidade = totalQtd;
  else state.cart.push({
    produtoId: pId,
    nomeProduto: getProdutoNome(prod),
    quantidade: qtd,
    precoVenda: getProdutoPreco(prod)
  });
  renderCart();

  // limpa a busca de produto para o usuário adicionar o próximo item
  document.getElementById('pedidoProdutoBusca').value = '';
  document.getElementById('pedidoProdutoId').value = '';
  document.getElementById('pedidoQtd').value = 1;
}

function renderCart() {
  const el = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!state.cart.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:16px;font-size:13px">Nenhum item adicionado</div>';
    totalEl.textContent = 'R$ 0,00';
    return;
  }
  el.innerHTML = state.cart.map((item, i) => `
    <div class="cart-item">
      <div>
        <div style="font-size:13px;font-weight:500">${item.nomeProduto}</div>
        <div style="font-size:11px;color:var(--text3)">R$ ${Number(item.precoVenda).toFixed(2)} × ${item.quantidade}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:13px;font-weight:500">R$ ${(item.precoVenda * item.quantidade).toFixed(2)}</span>
        <button class="btn btn-danger btn-sm" onclick="removeCartItem(${i})">✕</button>
      </div>
    </div>
  `).join('');
  const total = state.cart.reduce((s, i) => s + i.precoVenda * i.quantidade, 0);
  totalEl.textContent = 'R$ ' + total.toFixed(2);
}

function removeCartItem(i) { state.cart.splice(i, 1); renderCart(); }

// Controla se um pedido está sendo enviado no momento
// (usado para travar o modal e impedir fechamento no meio do envio)
let criandoPedido = false;

async function criarPedido() {
  if (criandoPedido) return; // evita duplo clique enquanto já está enviando

  const clienteId = parseInt(document.getElementById('pedidoClienteId').value);
  if (!clienteId) { showToast('error', 'Selecione um cliente na lista de sugestões'); return; }
  if (!state.cart.length) { showToast('error', 'Adicione pelo menos um item'); return; }

  const cliente = state.clientes.find(c => c.id === clienteId);

  const payload = {
    clienteId,
    itens: state.cart.map(i => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade
    }))
  };

  const btnCriar    = document.getElementById('btnCriarPedido');
  const btnCancelar = document.getElementById('btnCancelarPedido');
  const btnFechar   = document.getElementById('btnFecharPedido');
  const textoOriginalBtn = btnCriar.innerHTML;

  // ── liga o estado de "enviando" (spinner + botões travados) ──
  criandoPedido = true;
  btnCriar.disabled = true;
  btnCriar.innerHTML = '<span class="spinner"></span> Enviando pedido...';
  if (btnCancelar) btnCancelar.disabled = true;
  if (btnFechar) btnFechar.disabled = true;

  try {
    await apiFetch('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // busca as páginas atuais atualizadas direto do backend
    paginacao.pedidos.pagina = 0;
    await Promise.all([
      carregarPagina('pedidos'),
      (produtoBuscaAtiva ? carregarBuscaProdutos() : carregarPagina('produtos'))
    ]);

    state.cart = [];
    criandoPedido = false; // libera antes de fechar, pois closeModal reseta o carrinho
    closeModal('modalNovoPedido');
    renderAll();
    const emailCliente = cliente?.email || '';
    showToast('success', `Pedido criado! E-mail enviado para ${emailCliente} ✉️`);
  } catch (err) {
    showToast('error', err.message || 'Erro ao criar pedido');
  } finally {
    // ── desliga o estado de "enviando", restaurando os botões ──
    criandoPedido = false;
    btnCriar.disabled = false;
    btnCriar.innerHTML = textoOriginalBtn;
    if (btnCancelar) btnCancelar.disabled = false;
    if (btnFechar) btnFechar.disabled = false;
  }
}

function filterPedidos(status, el) {
  state.pedidoFilter = status;
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderPedidos();
}

// Rótulos usados nas mensagens de confirmação
const LABEL_STATUS = { AGUARDANDO: 'Aguardando', PAGO: 'Pago', CANCELADO: 'Cancelado' };

/**
 * Disparado pelo onchange do <select> de status.
 * Abre a confirmação; se o usuário cancelar, o select volta
 * para o valor anterior (não perde o estado visualmente).
 */
function confirmarStatusPedido(pedidoId, novoStatus, selectEl) {
  const statusAnterior = selectEl.getAttribute('data-status-anterior') || novoStatus;

  abrirConfirmacao(
    'Alterar status do pedido',
    `Deseja realmente alterar o status do pedido #${String(pedidoId).slice(-4)} para "${LABEL_STATUS[novoStatus] || novoStatus}"? Depois de confirmado, o status não poderá ser alterado novamente.`,
    () => executarAtualizarStatus(pedidoId, novoStatus, selectEl),
    'primary',
    () => { selectEl.value = statusAnterior; } // cancelou: reverte a seleção
  );
}

// Só chama a API depois que o usuário confirma no modal
async function executarAtualizarStatus(pedidoId, statusPedido, selectEl) {
  try {
    await apiFetch(`/api/pedidos/${pedidoId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statusPedido })
    });

    const p = state.pedidos.find(p => p.id === pedidoId);
    if (p) p.status = statusPedido;

    // renderAll() recria o <select> já travado (disabled),
    // pois o status deixou de ser 'AGUARDANDO'
    renderAll();
    showToast('success', 'Status atualizado! Este pedido não poderá mais ter o status alterado.');
  } catch (err) {
    showToast('error', err.message || 'Erro ao atualizar status');
    if (selectEl) selectEl.value = selectEl.getAttribute('data-status-anterior');
    renderPedidos();
  }
}

/* ══════════════════════════════════════
   VER ITENS DO PEDIDO
   Endpoint esperado: GET /api/pedidos/{id}/itens
   Retorno esperado: [{ nomeProduto, quantidade, precoVenda }]
══════════════════════════════════════ */
async function verItensPedido(pedidoId) {
  document.getElementById('itensPedidoNumero').textContent = `#${String(pedidoId).slice(-4)}`;
  document.getElementById('tabelaItensPedido').innerHTML =
    '<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:24px">Carregando...</td></tr>';

  openModal('modalItensPedido');

  try {
    const itens = await apiFetch(`/api/pedidos/${pedidoId}/itens`);
    const tbody = document.getElementById('tabelaItensPedido');

    if (!itens || !itens.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:24px">Nenhum item encontrado</td></tr>';
      return;
    }

    const totalGeral = itens.reduce((s, i) => s + (i.precoVenda * i.quantidade), 0);

    tbody.innerHTML = itens.map(item => `
      <tr>
        <td><span class="primary">${item.nomeProduto || '—'}</span></td>
        <td style="text-align:center">${item.quantidade}</td>
        <td>R$ ${Number(item.precoVenda).toFixed(2)}</td>
        <td><span class="primary">R$ ${(item.precoVenda * item.quantidade).toFixed(2)}</span></td>
      </tr>
    `).join('') + `
      <tr style="border-top:2px solid var(--border)">
        <td colspan="3" style="text-align:right;font-weight:600;padding-top:12px">Total</td>
        <td style="padding-top:12px"><span class="primary" style="font-weight:600">R$ ${totalGeral.toFixed(2)}</span></td>
      </tr>
    `;
  } catch (err) {
    document.getElementById('tabelaItensPedido').innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:var(--red,#f44);padding:24px">Erro ao carregar itens: ${err.message}</td></tr>`;
  }
}

function renderPedidos() {
  const tbody = document.getElementById('tabelaPedidos');
  let pedidos = state.pedidos;
  if (state.pedidoFilter !== 'TODOS') pedidos = pedidos.filter(p => p.status === state.pedidoFilter);
  if (!pedidos.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:40px">Nenhum pedido encontrado</td></tr>';
    return;
  }
  const badgeMap = { AGUARDANDO:'badge-amber', PAGO:'badge-green', CANCELADO:'badge-red' };
  const labelMap = { AGUARDANDO:'Aguardando', PAGO:'Pago', CANCELADO:'Cancelado' };
  tbody.innerHTML = pedidos.map(p => {
    const id          = p.id;
    const nomeCliente = p.nomeCliente || p.cliente?.nome || p.cliente?.name || '—';
    const dataStr     = p.dataPedido || p.createdAt || p.data || '';
    const data        = dataStr ? new Date(dataStr).toLocaleString('pt-BR') : '—';
    const itens       = p.itens || p.items || [];
    const total       = p.valorTotal || p.total || 0;
    const status      = p.status || p.statusPedido || 'AGUARDANDO';
    // Uma vez que o pedido saiu de "Aguardando", o status fica travado
    // (definido ou pelo backend, ou por uma confirmação anterior do usuário)
    const statusTravado = status !== 'AGUARDANDO';
    return `
    <tr>
      <td><span class="primary">#${String(id).slice(-4)}</span></td>
      <td>${nomeCliente}</td>
      <td style="font-size:12px">${data}</td>
      <td>${itens.length} item(s)</td>
      <td><span class="primary">R$ ${Number(total).toFixed(2)}</span></td>
      <td><span class="badge ${badgeMap[status] || 'badge-amber'}">${labelMap[status] || status}</span></td>
      <td>
        <div style="display:flex;gap:6px;align-items:center">
          <button
            class="btn btn-ghost btn-sm"
            onclick="verItensPedido(${id})"
            title="Ver itens do pedido"
            style="padding:5px 7px"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <select
            data-status-anterior="${status}"
            ${statusTravado ? 'disabled' : ''}
            title="${statusTravado ? 'Status já confirmado — não pode ser alterado' : 'Alterar status do pedido'}"
            style="padding:5px 8px;font-size:12px;width:auto${statusTravado ? ';opacity:0.6;cursor:not-allowed' : ''}"
            onchange="confirmarStatusPedido(${id}, this.value, this)"
          >
            <option ${status==='AGUARDANDO'?'selected':''} value="AGUARDANDO">Aguardando</option>
            <option ${status==='PAGO'?'selected':''} value="PAGO">Pago</option>
            <option ${status==='CANCELADO'?'selected':''} value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */
function renderDashboard() {
  document.getElementById('statPedidos').textContent  = state.pedidos.length;
  const receita = state.pedidos
    .filter(p => p.status === 'PAGO')
    .reduce((s, p) => s + (p.valorTotal || p.total || 0), 0);
  document.getElementById('statReceita').textContent  = 'R$ ' + receita.toFixed(2);
  document.getElementById('statProdutos').textContent = state.produtos.length;
  document.getElementById('statClientes').textContent = state.clientes.length;

  const recent = state.pedidos.slice(0, 5);
  const badgeMap2 = { AGUARDANDO:'badge-amber', PAGO:'badge-green', CANCELADO:'badge-red' };
  const lbl2 = { AGUARDANDO:'Aguardando', PAGO:'Pago', CANCELADO:'Cancelado' };
  const dashTbody = document.getElementById('dashRecentOrders');
  if (!recent.length) {
    dashTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:24px">Nenhum pedido ainda</td></tr>';
  } else {
    dashTbody.innerHTML = recent.map(p => {
      const nome   = p.nomeCliente || p.cliente?.nome || '—';
      const status = p.status || p.statusPedido || 'AGUARDANDO';
      const total  = p.valorTotal || p.total || 0;
      return `
      <tr>
        <td><span class="primary">${nome}</span></td>
        <td><span class="badge ${badgeMap2[status] || ''}">${lbl2[status] || status}</span></td>
        <td>R$ ${Number(total).toFixed(2)}</td>
      </tr>`;
    }).join('');
  }

  const vendas = {};
  state.pedidos.forEach(p => {
    const itens = p.itens || p.items || [];
    itens.forEach(i => {
      const nome = i.nomeProduto || i.produto?.nome || i.produto?.name || `Produto ${i.produtoId}`;
      vendas[nome] = (vendas[nome] || 0) + (i.quantidade || i.quantity || 0);
    });
  });
  const top  = Object.entries(vendas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxV = top[0]?.[1] || 1;
  const topEl = document.getElementById('topProdutos');
  if (!top.length) {
    topEl.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:24px">Nenhum dado ainda</div>';
  } else {
    topEl.innerHTML = top.map(([nome, qtd]) => `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="color:var(--text)">${nome}</span>
          <span style="color:var(--text3)">${qtd} un.</span>
        </div>
        <div style="background:var(--bg3);border-radius:3px;height:6px;overflow:hidden">
          <div style="width:${(qtd/maxV*100).toFixed(0)}%;height:100%;background:var(--accent);border-radius:3px;transition:width 0.5s"></div>
        </div>
      </div>
    `).join('');
  }
}

function renderAll() {
  renderDashboard();
  renderPedidos();
  renderProdutos();
  renderClientes();
}

/* ══════════════════════════════════════
   INIT — verifica se já está logado
══════════════════════════════════════ */
(async () => {
  const savedUser = localStorage.getItem('orderflow_user');
  const savedToken = localStorage.getItem('orderflow_token');

  if (savedToken && savedUser) {
    try {
      authToken = savedToken;
      const user = JSON.parse(savedUser);
      loginSuccess(user);
    } catch (e) {
      doLogout();
    }
  }
})();
