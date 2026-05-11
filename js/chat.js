//const API = 'http://localhost:3000'
//const API = 'http://192.168.1.90:3000'
const API = 'https://backendchat1.onrender.com'

// Pega dados do usuário logado
const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

// Se não está logado, volta pro login
if (!token || !usuario.id) {
  window.location.href = 'index.html'
}

// Conecta no WebSocket
const socket = io(API)

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

// Atualiza lista de usuários online
socket.on('usuariosOnline', (lista) => {
  renderizarUsuarios(lista)
})

// Recebe nova mensagem
socket.on('novaMensagem', (msg) => {
  adicionarMensagem(msg)
})

// Configura perfil
document.getElementById('meu-nome').textContent = usuario.nome
document.getElementById('meu-avatar').textContent = usuario.nome[0].toUpperCase()

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
    if (u.id === usuario.id) return

    const online = u.online !== undefined ? u.online : true
    const selecionado = destinatarios.includes(u.id)

    const item = document.createElement('div')
    item.className = `usuario-item ${selecionado ? 'selecionado' : ''}`
    item.id = `usuario-${u.id}`
    item.onclick = () => toggleUsuario(u.id, u.nome)
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
