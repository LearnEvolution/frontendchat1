const API = 'https://backendchat1.onrender.com'

// Pega dados do usuário logado
const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

// Se não está logado, volta pro login
if (!token || !usuario.id) {
  window.location.href = 'index.html'
}

// Conecta no WebSocket
const socket = io(API, {
  transports: ['polling', 'websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

// Destinatários selecionados
let destinatarios = []
let todosAtivo = true

// Quando conectar
socket.on('connect', () => {
  document.getElementById('header-status').textContent = '🟢 Conectado'
  socket.emit('entrar', { id: usuario.id, nome: usuario.nome })
})

// Quando desconectar
socket.on('disconnect', () => {
  document.getElementById('header-status').textContent = '🔴 Desconectado'
})

// Atualiza só o status online sem resetar seleção
socket.on('usuariosOnline', (lista) => {
  lista.forEach(u => {
    const item = document.getElementById(`usuario-${u.id}`)
    if (item) {
      const bolinha = item.querySelector('.bolinha')
      bolinha.className = `bolinha ${u.online ? 'online' : 'offline'}`
    }
  })
})

// Recebe nova mensagem
socket.on('novaMensagem', (msg) => {
  adicionarMensagem(msg)
})

// Configura perfil
document.getElementById('meu-nome').textContent = usuario.nome
document.getElementById('meu-avatar').textContent = usuario.nome[0].toUpperCase()

// Carrega histórico de mensagens
async function carregarHistorico() {
  try {
    const res = await fetch(`${API}/auth/mensagens`, {
      headers: { 'authorization': token }
    })
    const mensagens = await res.json()
    mensagens.forEach(msg => adicionarMensagem(msg))
  } catch {
    console.log('Erro ao carregar histórico')
  }
}

// Carrega usuários cadastrados
async function carregarUsuarios() {
  try {
    const res = await fetch(`${API}/auth/usuarios`, {
      headers: { 'authorization': token }
    })
    const dados = await res.json()
    renderizarUsuarios(dados)
  } catch {
    console.log('Erro ao carregar usuários')
  }
}

// Renderiza lista de usuários
function renderizarUsuarios(lista) {
  const container = document.getElementById('lista-usuarios')
  container.innerHTML = ''

  lista.forEach(u => {
    if (String(u._id) === String(usuario.id)) return

    const online = u.online || false
    const selecionado = destinatarios.includes(String(u._id))

    const item = document.createElement('div')
    item.className = `usuario-item ${selecionado ? 'selecionado' : ''}`
    item.id = `usuario-${u._id}`
    item.onclick = () => toggleUsuario(String(u._id), u.nome)
    item.innerHTML = `
      <div class="bolinha ${online ? 'online' : 'offline'}"></div>
      <div class="usuario-nome">${u.nome}</div>
      <div class="check">${selecionado ? '✅' : ''}</div>
    `
    container.appendChild(item)
  })
}

// Toggle todos
function toggleTodos() {
  todosAtivo = !todosAtivo
  destinatarios = []

  const itemTodos = document.getElementById('item-todos')
  const checkTodos = document.getElementById('check-todos')

  if (todosAtivo) {
    itemTodos.className = 'usuario-item todos-selecionado'
    checkTodos.textContent = '✅'
  } else {
    itemTodos.className = 'usuario-item'
    checkTodos.textContent = ''
  }

  atualizarInfo()
  document.querySelectorAll('#lista-usuarios .usuario-item')
    .forEach(el => {
      el.classList.remove('selecionado')
      el.querySelector('.check').textContent = ''
    })
}

// Toggle usuário individual
function toggleUsuario(id, nome) {
  if (todosAtivo) {
    todosAtivo = false
    document.getElementById('item-todos').className = 'usuario-item'
    document.getElementById('check-todos').textContent = ''
  }

  const index = destinatarios.indexOf(id)
  const item = document.getElementById(`usuario-${id}`)
  const check = item.querySelector('.check')

  if (index === -1) {
    destinatarios.push(id)
    item.classList.add('selecionado')
    check.textContent = '✅'
  } else {
    destinatarios.splice(index, 1)
    item.classList.remove('selecionado')
    check.textContent = ''
  }

  atualizarInfo()
}

// Atualiza info de destinatários
function atualizarInfo() {
  const info = document.getElementById('info-destinatarios')
  if (todosAtivo) {
    info.textContent = 'Todos'
  } else if (destinatarios.length === 0) {
    info.textContent = 'Ninguém selecionado'
  } else {
    const nomes = []
    destinatarios.forEach(id => {
      const el = document.getElementById(`usuario-${id}`)
      if (el) nomes.push(el.querySelector('.usuario-nome').textContent)
    })
    info.textContent = nomes.join(', ')
  }
}

// Enviar mensagem
function enviarMensagem() {
  const input = document.getElementById('input-mensagem')
  const texto = input.value.trim()

  if (!texto) return
  if (!socket.connected) {
    alert('Sem conexão com o servidor!')
    return
  }

  if (todosAtivo || destinatarios.length === 0) {
    socket.emit('mensagemGrupo', {
      remetente: usuario.nome,
      remetenteId: usuario.id,
      texto
    })
  } else {
    destinatarios.forEach(destId => {
      socket.emit('mensagemPrivada', {
        remetente: usuario.nome,
        remetenteId: usuario.id,
        destinatarioId: destId,
        texto
      })
    })
  }

  input.value = ''
}

// Adicionar mensagem na tela
function adicionarMensagem(msg) {
  const container = document.getElementById('mensagens')
  const ehMinha = msg.remetenteId === usuario.id ||
                  msg.remetente === usuario.nome

  const div = document.createElement('div')
  div.className = `mensagem ${ehMinha ? 'minha' : 'outra'}`
  div.innerHTML = `
    <div class="msg-remetente">${msg.remetente}</div>
    <div class="msg-balao">${msg.texto}</div>
    <div class="msg-hora">${msg.hora}</div>
    <div class="msg-tipo">${msg.tipo === 'privada' ? '🔒 privada' : '👥 grupo'}</div>
  `

  container.appendChild(div)
  container.scrollTop = container.scrollHeight
}

// Sair
function sair() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = 'index.html'
}

// Inicia
carregarUsuarios()
carregarHistorico()
