(function () {
  let resetToken = null;

  const FORMS = ['loginForm', 'registerForm', 'forgotForm', 'resetForm'];

  function mostrar(id) {
    FORMS.forEach(f => {
      const el = document.getElementById(f);
      if (el) el.style.display = (f === id) ? 'block' : 'none';
    });
  }

  function msg(elId, tipo, texto) {
    document.getElementById(elId).innerHTML =
      texto ? `<div class="alert alert-${tipo}">${texto}</div>` : '';
  }

  function loading(btnId, ativo, textoNormal, textoLoading) {
    const btn = document.getElementById(btnId);
    btn.disabled = ativo;
    btn.innerHTML = ativo ? `<span class="spinner"></span> ${textoLoading}` : textoNormal;
  }

  // Estende showLogin/showRegister do script.js para esconder também os novos formulários
  const _showLogin = window.showLogin;
  const _showRegister = window.showRegister;

  window.showLogin = function () {
    msg('forgotMsg', 'error', '');
    msg('resetMsg', 'error', '');
    mostrar('loginForm');
    if (_showLogin) _showLogin();
  };
  window.showRegister = function () {
    mostrar('registerForm');
    if (_showRegister) _showRegister();
  };

  window.showForgot = function () {
    msg('forgotMsg', 'error', '');
    document.getElementById('forgotEmail').value =
      document.getElementById('loginEmail').value || '';
    mostrar('forgotForm');
  };

  // 1) Solicitar o link
  window.enviarLinkReset = async function () {
    const email = document.getElementById('forgotEmail').value.trim();
    msg('forgotMsg', 'error', '');

    if (!email) {
      msg('forgotMsg', 'error', 'Informe seu e-mail.');
      return;
    }

    loading('btnForgot', true, 'Enviar link', 'Enviando...');
    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      // Resposta genérica de propósito: não revela se o e-mail existe
      msg('forgotMsg', 'success',
        'Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha em instantes. O link vale por 30 minutos.');
    } catch (err) {
      msg('forgotMsg', 'error', err.message || 'Erro ao solicitar a redefinição.');
    } finally {
      loading('btnForgot', false, 'Enviar link', '');
    }
  };

  // 2) Definir a nova senha
  window.redefinirSenha = async function () {
    const senha = document.getElementById('resetSenha').value;
    const confirm = document.getElementById('resetConfirm').value;
    msg('resetMsg', 'error', '');

    if (!senha || !confirm) {
      msg('resetMsg', 'error', 'Preencha todos os campos.');
      return;
    }
    if (senha.length < 6) {
      msg('resetMsg', 'error', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirm) {
      msg('resetMsg', 'error', 'As senhas não conferem.');
      return;
    }

    loading('btnReset', true, 'Redefinir senha', 'Salvando...');
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, novaSenha: senha })
      });

      resetToken = null;
      document.getElementById('resetSenha').value = '';
      document.getElementById('resetConfirm').value = '';
      window.showLogin();
      showToast('success', 'Senha redefinida! Faça login com a nova senha.');
    } catch (err) {
      msg('resetMsg', 'error', err.message || 'Link inválido ou expirado. Solicite um novo.');
    } finally {
      loading('btnReset', false, 'Redefinir senha', '');
    }
  };

  // Enter para enviar
  document.getElementById('forgotEmail').addEventListener('keydown', e => {
    if (e.key === 'Enter') enviarLinkReset();
  });
  document.getElementById('resetConfirm').addEventListener('keydown', e => {
    if (e.key === 'Enter') redefinirSenha();
  });

  // Ao abrir a página com ?token=... (link do e-mail)
  const params = new URLSearchParams(window.location.search);
  const tokenUrl = params.get('token');
  if (tokenUrl) {
    resetToken = tokenUrl;
    window.history.replaceState({}, '', window.location.pathname);
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    mostrar('resetForm');
  }
})();
