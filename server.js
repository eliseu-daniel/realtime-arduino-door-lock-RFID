require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { createWebSocketServer, onOpenGate } = require('./src/websocket');
const { connectSerial, sendCommand } = require('./src/serial');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

createWebSocketServer(server);

connectSerial();

onOpenGate(() => sendCommand('OPEN_GATE'));

server.listen(PORT, () => {
  console.log(`[SERVER] Rodando em http://localhost:${PORT}`);
  console.log(`[SERVER] WebSocket em ws://localhost:${PORT}`);
});
