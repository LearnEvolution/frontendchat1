//const API = 'http://localhost:3000'
//const API = 'http://192.168.1.90:3000'
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

async function fazerCadastro() {
  const nome = document.getElementById('cad-nome').value
  const email = document.getElementById('cad-email').value
  const senha = document.getElementById('cad-senha').value
  const erro = document.getElementById('cad-erro')
  const sucesso = document.getElementById('cad-sucesso')

  erro.textContent = ''
  sucesso.textContent = ''

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    })

    const dados = await res.json()

    if (!res.ok) {
      erro.textContent = dados.erro
      return
    }

    sucesso.textContent = 'Cadastrado! Agora faça login.'
    trocarAba('login')

  } catch {
    erro.textContent = 'Erro ao conectar ao servidor!'
  }
}
