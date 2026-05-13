const API = 'https://backendchat1.onrender.com'

function trocarAba(aba) {
  document.querySelectorAll('.aba').forEach(b => b.classList.remove('ativa'))
  document.querySelectorAll('.form-box').forEach(f => f.classList.add('escondido'))

  if (aba === 'login') {
    document.querySelectorAll('.aba')[0].classList.add('ativa')
    document.getElementById('form-login').classList.remove('escondido')
  } else {
    document.querySelectorAll('.aba')[1].classList.add('ativa')
    document.getElementById('form-cadastro').classList.remove('escondido')
  }
}

function voltarCadastro() {
  document.getElementById('form-verificacao').classList.add('escondido')
  document.getElementById('form-cadastro').classList.remove('escondido')
}

async function fazerLogin() {
  const email = document.getElementById('login-email').value
  const senha = document.getElementById('login-senha').value
  const erro = document.getElementById('login-erro')

  erro.textContent = ''

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })

    const dados = await res.json()

    if (!res.ok) {
      erro.textContent = dados.erro
      return
    }

    localStorage.setItem('token', dados.token)
    localStorage.setItem('usuario', JSON.stringify(dados.usuario))
    window.location.href = 'chat.html'

  } catch {
    erro.textContent = 'Erro ao conectar ao servidor!'
  }
}

async function enviarCodigo() {
  const nome = document.getElementById('cad-nome').value
  const email = document.getElementById('cad-email').value
  const senha = document.getElementById('cad-senha').value
  const erro = document.getElementById('cad-erro')
  const sucesso = document.getElementById('cad-sucesso')

  erro.textContent = ''
  sucesso.textContent = ''

  if (!nome || !email || !senha) {
    erro.textContent = 'Preencha todos os campos!'
    return
  }

  sucesso.textContent = 'Enviando código...'

  try {
    const res = await fetch(`${API}/auth/enviar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const dados = await res.json()

    if (!res.ok) {
      erro.textContent = dados.erro
      sucesso.textContent = ''
      return
    }

    // Guarda os dados temporariamente
    localStorage.setItem('cad_temp', JSON.stringify({ nome, email, senha }))

    // Vai pro passo 2
    document.getElementById('form-cadastro').classList.add('escondido')
    document.getElementById('form-verificacao').classList.remove('escondido')

  } catch {
    erro.textContent = 'Erro ao conectar ao servidor!'
    sucesso.textContent = ''
  }
}

async function verificarECadastrar() {
  const codigo = document.getElementById('cad-codigo').value
  const erro = document.getElementById('ver-erro')

  erro.textContent = ''

  if (!codigo || codigo.length < 4) {
    erro.textContent = 'Digite o código de 4 dígitos!'
    return
  }

  const temp = JSON.parse(localStorage.getItem('cad_temp') || '{}')

  if (!temp.email) {
    erro.textContent = 'Sessão expirada! Volte e tente novamente.'
    return
  }

  try {
    // Verifica o código
    const resVer = await fetch(`${API}/auth/verificar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: temp.email, codigo })
    })

    const dadosVer = await resVer.json()

    if (!resVer.ok) {
      erro.textContent = dadosVer.erro
      return
    }

    // Código correto — cadastra o usuário
    const resCad = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: temp.nome, email: temp.email, senha: temp.senha })
    })

    const dadosCad = await resCad.json()

    if (!resCad.ok) {
      erro.textContent = dadosCad.erro
      return
    }

    localStorage.removeItem('cad_temp')

    // Vai pro login com mensagem de sucesso
    document.querySelectorAll('.form-box').forEach(f => f.classList.add('escondido'))
    document.getElementById('form-login').classList.remove('escondido')
    document.querySelectorAll('.aba')[0].classList.add('ativa')
    document.querySelectorAll('.aba')[1].classList.remove('ativa')
    document.getElementById('login-erro').textContent = ''

    alert('✅ Cadastro realizado! Faça login agora.')

  } catch {
    erro.textContent = 'Erro ao conectar ao servidor!'
  }
}
