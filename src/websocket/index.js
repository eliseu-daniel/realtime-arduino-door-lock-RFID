const { WebSocketServer } = require('ws');
const { verifyToken } = require('../utils/jwt');

let wss = null;
const clients = new Map();

function createWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    console.log('[WS] Novo cliente conectado');

    let authenticated = false;

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.event === 'AUTHENTICATE') {
          try {
            const decoded = verifyToken(data.token);
            ws.user = decoded;
            authenticated = true;
            clients.set(decoded.id, ws);
            console.log(`[WS] Usuário ${decoded.email} autenticado`);
            sendTo(ws, { event: 'USUARIO_CONECTADO', message: 'Autenticado com sucesso' });
          } catch (err) {
            sendTo(ws, { event: 'ERRO_AUTH', message: 'Token inválido' });
          }
          return;
        }

        if (!authenticated) {
          sendTo(ws, { event: 'ERRO_AUTH', message: 'Autenticação necessária' });
          return;
        }

        handleMessage(ws, data);
      } catch (err) {
        console.error('[WS] Erro ao processar mensagem:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('[WS] Cliente desconectado');
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Erro na conexão:', err.message);
    });
  });

  console.log('[WS] Servidor WebSocket inicializado');
  return wss;
}

function handleMessage(ws, data) {
  switch (data.event) {
    case 'OPEN_GATE':
      broadcast({ event: 'OPEN_GATE', user: ws.user });
      break;
    default:
      sendTo(ws, { event: 'ERRO', message: `Evento desconhecido: ${data.event}` });
  }
}

function broadcast(data) {
  if (!wss) return;
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function sendTo(ws, data) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

function getWss() {
  return wss;
}

module.exports = { createWebSocketServer, broadcast, sendTo, getWss };
