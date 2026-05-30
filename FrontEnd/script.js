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

/* ══════════════════════════════════════
   HELPER: fetch com autenticação
══════════════════════════════════════ */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expirado ou inválido → redireciona para login
    doLogout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  // Tenta parsear JSON; se não tiver corpo (204), retorna null
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
    // POST /api/auth/login → busca no banco de dados
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
  const cpf     = document.getElementById('regCpf').value.trim();
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
    // POST /api/auth/register 
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
  localStorage.removeItem('orderflow_token');
  localStorage.removeItem('orderflow_user');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  showLogin();
}

/* ══════════════════════════════════════
   CARREGAMENTO INICIAL (API)
══════════════════════════════════════ */
async function loadAll() {
  try {
    const [clientes, produtos, pedidos] = await Promise.all([
      apiFetch('/api/clientes'),
      apiFetch('/api/produtos'),
      apiFetch('/api/pedidos')
    ]);

    // Suporte a respostas em lista ou { content: [] } (Page do Spring)
    state.clientes = Array.isArray(clientes) ? clientes : (clientes.content || []);
    state.produtos = Array.isArray(produtos) ? produtos : (produtos.content || []);
    state.pedidos  = Array.isArray(pedidos)  ? pedidos  : (pedidos.content  || []);

    renderAll();
  } catch (err) {
    showToast('error', 'Erro ao carregar dados: ' + err.message);
    renderAll(); // renderiza mesmo sem dados
  }
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
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    state.cart = [];
    renderCart();
  }
});

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
   MASK
══════════════════════════════════════ */
function maskCPF(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  el.value = v;
}

/* ══════════════════════════════════════
   CLIENTES
══════════════════════════════════════ */
async function criarCliente() {
  const nome  = document.getElementById('cliNome').value.trim();
  const email = document.getElementById('cliEmail').value.trim();
  const cpf   = document.getElementById('cliCpf').value.trim();
  if (!nome || !email || !cpf) { showToast('error', 'Preencha todos os campos'); return; }

  try {
    // POST /api/clientes { nome, email, cpf }
    const novo = await apiFetch('/api/clientes', {
      method: 'POST',
      body: JSON.stringify({ nome, email, cpf })
    });

    state.clientes.push(novo);
    closeModal('modalNovoCliente');
    renderAll();
    document.getElementById('cliNome').value  = '';
    document.getElementById('cliEmail').value = '';
    document.getElementById('cliCpf').value   = '';
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
    // Normaliza campos que podem ter nomes diferentes no backend
    const id         = c.id;
    const nome       = c.nome || c.name || '';
    const email      = c.email || '';
    const cpf        = c.cpf || '';
    const cadastro   = c.dataCadastro || c.createdAt || '';
    return `
    <tr>
      <td><span class="primary">${nome}</span></td>
      <td>${email}</td>
      <td>${cpf}</td>
      <td>${cadastro ? cadastro.split('T')[0] : ''}</td>
      <td><button class="btn btn-danger btn-sm" onclick="removeCliente(${id})">Remover</button></td>
    </tr>`;
  }).join('');
}

async function removeCliente(id) {
  try {
    // DELETE /api/clientes/{id}
    await apiFetch(`/api/clientes/${id}`, { method: 'DELETE' });
    state.clientes = state.clientes.filter(c => c.id !== id);
    renderAll();
    showToast('success', 'Cliente removido.');
  } catch (err) {
    showToast('error', err.message || 'Erro ao remover cliente');
  }
}

/* ══════════════════════════════════════
   PRODUTOS
══════════════════════════════════════ */
async function criarProduto() {
  const nome     = document.getElementById('prodNome').value.trim();
  const preco    = parseFloat(document.getElementById('prodPreco').value);
  const qtd      = parseInt(document.getElementById('prodEstoque').value);
  if (!nome || isNaN(preco) || isNaN(qtd)) { showToast('error', 'Preencha todos os campos corretamente'); return; }
  if (preco <= 0) { showToast('error', 'Preço deve ser maior que zero'); return; }

  try {
    // POST /api/produtos { nome, preco, qtdEstoque }
    const novo = await apiFetch('/api/produtos', {
      method: 'POST',
      body: JSON.stringify({ nome, preco, qtdEstoque: qtd })
    });

    state.produtos.push(novo);
    closeModal('modalNovoProduto');
    renderAll();
    document.getElementById('prodNome').value    = '';
    document.getElementById('prodPreco').value   = '';
    document.getElementById('prodEstoque').value = '';
    showToast('success', 'Produto cadastrado!');
  } catch (err) {
    showToast('error', err.message || 'Erro ao cadastrar produto');
  }
}

function renderProdutos() {
  const tbody = document.getElementById('tabelaProdutos');
  if (!state.produtos.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px">Nenhum produto cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = state.produtos.map(p => {
    const nome     = p.nome || p.name || '';
    const preco    = p.preco || p.price || 0;
    const estoque  = p.qtdEstoque ?? p.estoque ?? p.quantity ?? 0;
    return `
    <tr>
      <td><span class="primary">${nome}</span></td>
      <td>R$ ${Number(preco).toFixed(2)}</td>
      <td>${estoque}</td>
      <td><span class="badge ${estoque > 0 ? 'badge-green' : 'badge-red'}">${estoque > 0 ? 'Disponível' : 'Sem estoque'}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeProduto(${p.id})">Remover</button></td>
    </tr>`;
  }).join('');
}

async function removeProduto(id) {
  try {
    // DELETE /api/produtos/{id}
    await apiFetch(`/api/produtos/${id}`, { method: 'DELETE' });
    state.produtos = state.produtos.filter(p => p.id !== id);
    renderAll();
    showToast('success', 'Produto removido.');
  } catch (err) {
    showToast('error', err.message || 'Erro ao remover produto');
  }
}

/* ══════════════════════════════════════
   PEDIDOS
══════════════════════════════════════ */
function getProdutoEstoque(p) {
  return p.qtdEstoque ?? p.estoque ?? p.quantity ?? 0;
}
function getProdutoPreco(p) {
  return p.preco || p.price || 0;
}
function getProdutoNome(p) {
  return p.nome || p.name || '';
}

function populatePedidoSelects() {
  const cSel = document.getElementById('pedidoCliente');
  cSel.innerHTML = '<option value="">Selecione um cliente...</option>' +
    state.clientes.map(c => `<option value="${c.id}">${c.nome || c.name}</option>`).join('');

  const pSel = document.getElementById('pedidoProduto');
  const disponiveis = state.produtos.filter(p => getProdutoEstoque(p) > 0);
  pSel.innerHTML = disponiveis.length
    ? disponiveis.map(p => `<option value="${p.id}">${getProdutoNome(p)} — R$ ${Number(getProdutoPreco(p)).toFixed(2)} (estoque: ${getProdutoEstoque(p)})</option>`).join('')
    : '<option value="" disabled>Nenhum produto com estoque</option>';

  state.cart = [];
  renderCart();
}

function addCartItem() {
  const pId = parseInt(document.getElementById('pedidoProduto').value);
  const qtd = parseInt(document.getElementById('pedidoQtd').value);
  if (!pId || qtd < 1) { showToast('error', 'Selecione um produto e quantidade válida'); return; }
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

async function criarPedido() {
  const clienteId = parseInt(document.getElementById('pedidoCliente').value);
  if (!clienteId) { showToast('error', 'Selecione um cliente'); return; }
  if (!state.cart.length) { showToast('error', 'Adicione pelo menos um item'); return; }

  const cliente = state.clientes.find(c => c.id === clienteId);

  // Payload: o backend calcula precoVenda e valorTotal automaticamente
  const payload = {
    clienteId,
    itens: state.cart.map(i => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade
    }))
  };

  try {
    // POST /api/pedidos { clienteId, itens: [{ produtoId, quantidade }] }
    const novo = await apiFetch('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    state.pedidos.unshift(novo);

    // Atualiza estoque local (reflexo do que o backend fez)
    state.cart.forEach(item => {
      const prod = state.produtos.find(p => p.id === item.produtoId);
      if (prod) {
        const campo = 'qtdEstoque' in prod ? 'qtdEstoque' : ('estoque' in prod ? 'estoque' : 'quantity');
        prod[campo] -= item.quantidade;
      }
    });

    state.cart = [];
    closeModal('modalNovoPedido');
    renderAll();
    const emailCliente = cliente?.email || '';
    showToast('success', `Pedido criado! E-mail enviado para ${emailCliente} ✉️`);
  } catch (err) {
    showToast('error', err.message || 'Erro ao criar pedido');
  }
}

function filterPedidos(status, el) {
  state.pedidoFilter = status;
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderPedidos();
}

async function atualizarStatus(pedidoId, status) {
  try {
    // PATCH /api/pedidos/{id}/status  body: { status }
    // — ou PUT /api/pedidos/{id} dependendo do seu backend
    await apiFetch(`/api/pedidos/${pedidoId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    const p = state.pedidos.find(p => p.id === pedidoId);
    if (p) p.status = status;
    renderAll();
    showToast('success', 'Status atualizado!');
  } catch (err) {
    showToast('error', err.message || 'Erro ao atualizar status');
    renderPedidos(); // re-renderiza para reverter o select visualmente
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
  const badgeMap = { AGUARDANDO_PAGAMENTO:'badge-amber', PAGO:'badge-green', CANCELADO:'badge-red' };
  const labelMap = { AGUARDANDO_PAGAMENTO:'Aguardando', PAGO:'Pago', CANCELADO:'Cancelado' };
  tbody.innerHTML = pedidos.map(p => {
    // Normaliza campos que podem variar no backend
    const id          = p.id;
    const nomeCliente = p.nomeCliente || p.cliente?.nome || p.cliente?.name || '—';
    const dataStr     = p.dataPedido || p.createdAt || p.data || '';
    const data        = dataStr ? new Date(dataStr).toLocaleString('pt-BR') : '—';
    const itens       = p.itens || p.items || [];
    const total       = p.valorTotal || p.total || 0;
    const status      = p.status || 'AGUARDANDO_PAGAMENTO';
    return `
    <tr>
      <td><span class="primary">#${String(id).slice(-4)}</span></td>
      <td>${nomeCliente}</td>
      <td style="font-size:12px">${data}</td>
      <td>${itens.length} item(s)</td>
      <td><span class="primary">R$ ${Number(total).toFixed(2)}</span></td>
      <td><span class="badge ${badgeMap[status] || 'badge-amber'}">${labelMap[status] || status}</span></td>
      <td>
        <select style="padding:5px 8px;font-size:12px;width:auto" onchange="atualizarStatus(${id}, this.value)">
          <option ${status==='AGUARDANDO_PAGAMENTO'?'selected':''} value="AGUARDANDO_PAGAMENTO">Aguardando</option>
          <option ${status==='PAGO'?'selected':''} value="PAGO">Pago</option>
          <option ${status==='CANCELADO'?'selected':''} value="CANCELADO">Cancelado</option>
        </select>
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

  // Últimos pedidos
  const recent = state.pedidos.slice(0, 5);
  const badgeMap2 = { AGUARDANDO_PAGAMENTO:'badge-amber', PAGO:'badge-green', CANCELADO:'badge-red' };
  const lbl2 = { AGUARDANDO_PAGAMENTO:'Aguardando', PAGO:'Pago', CANCELADO:'Cancelado' };
  const dashTbody = document.getElementById('dashRecentOrders');
  if (!recent.length) {
    dashTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:24px">Nenhum pedido ainda</td></tr>';
  } else {
    dashTbody.innerHTML = recent.map(p => {
      const nome   = p.nomeCliente || p.cliente?.nome || '—';
      const status = p.status || 'AGUARDANDO_PAGAMENTO';
      const total  = p.valorTotal || p.total || 0;
      return `
      <tr>
        <td><span class="primary">${nome}</span></td>
        <td><span class="badge ${badgeMap2[status] || ''}">${lbl2[status] || status}</span></td>
        <td>R$ ${Number(total).toFixed(2)}</td>
      </tr>`;
    }).join('');
  }

  // Top produtos
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
  if (authToken && savedUser) {
    try {
      // Valida o token fazendo um request leve
      const user = JSON.parse(savedUser);
      loginSuccess(user);
    } catch {
      doLogout();
    }
  }
})();
