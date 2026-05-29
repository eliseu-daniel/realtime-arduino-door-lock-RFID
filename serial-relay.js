/**
 * Relay Serial → WebSocket para ambiente cloud.
 *
 * Rode este script na máquina LOCAL que tem o Arduino conectado via USB.
 * Ele abre a porta serial, conecta no WebSocket do servidor na nuvem,
 * e faz a ponte de comunicação bidirecional.
 *
 * Uso (futuro, quando migrar para nuvem):
 *   1. Configure as variáveis RELAY_* no .env
 *   2. Comente `connectSerial()` em server.js
 *   3. Rode: node serial-relay.js
 *
 * Enquanto usa USB local, este arquivo não é necessário.
 */

require('dotenv').config();

const SERVER_URL  = process.env.RELAY_SERVER_URL  || 'ws://localhost:3000';
const AUTH_TOKEN  = process.env.RELAY_AUTH_TOKEN  || '';
const SERIAL_PORT = process.env.SERIAL_PORT       || '/dev/ttyUSB0';
const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD_RATE, 10) || 9600;
const RECONNECT_MS = 3000;

let ws = null;
let serialPort = null;
let wsReconnectTimer = null;

function log(msg) {
  console.log(`[RELAY] ${msg}`);
}

function logError(msg) {
  console.error(`[RELAY] ${msg}`);
}

// ─── Serial ────────────────────────────────────────────────────────────

function openSerial() {
  try {
    const { SerialPort } = require('serialport');
    const { ReadlineParser } = require('@serialport/parser-readline');

    serialPort = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD, autoOpen: false });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.open((err) => {
      if (err) {
        logError(`Erro ao abrir serial ${SERIAL_PORT}: ${err.message}`);
        return;
      }
      log(`Serial conectada em ${SERIAL_PORT} (${SERIAL_BAUD} baud)`);
    });

    parser.on('data', (line) => {
      log(`Serial → WS: ${line}`);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ event: 'SERIAL_DATA', payload: line.trim() }));
      }
    });

    serialPort.on('error', (err) => logError(`Serial erro: ${err.message}`));
    serialPort.on('close', () => log('Serial fechada'));
  } catch (err) {
    logError(`Falha ao iniciar serial: ${err.message}`);
  }
}

function sendToSerial(command) {
  if (!serialPort || !serialPort.isOpen) {
    logError('Serial não disponível para enviar comando');
    return;
  }
  const payload = JSON.stringify({ command }) + '\n';
  serialPort.write(payload, (err) => {
    if (err) logError(`Erro ao escrever na serial: ${err.message}`);
    else log(`Comando enviado p/ serial: ${command}`);
  });
}

// ─── WebSocket ─────────────────────────────────────────────────────────

function connectWS() {
  if (ws) {
    ws.removeAllListeners();
    ws.close();
    ws = null;
  }

  const { WebSocket } = require('ws');
  ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    log(`Conectado ao servidor ${SERVER_URL}`);
    // Autentica como gateway
    ws.send(JSON.stringify({ event: 'AUTHENTICATE', token: AUTH_TOKEN }));
  });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      log(`WS → Serial: event=${data.event}`);

      switch (data.event) {
        case 'OPEN_GATE':
          sendToSerial('OPEN_GATE');
          break;
        case 'LOCK_GATE':
          sendToSerial('LOCK_GATE');
          break;
        default:
          log(`Evento WS ignorado: ${data.event}`);
      }
    } catch (err) {
      logError(`Erro ao processar mensagem WS: ${err.message}`);
    }
  });

  ws.on('close', () => {
    log('Conexão WebSocket fechada, reconectando...');
    ws = null;
    scheduleReconnect();
  });

  ws.on('error', (err) => {
    logError(`WebSocket erro: ${err.message}`);
    ws = null;
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
  wsReconnectTimer = setTimeout(connectWS, RECONNECT_MS);
}

// ─── Inicialização ─────────────────────────────────────────────────────

log('========================================');
log('  RELAY SERIAL → WEBSOCKET');
log('  Servidor: ' + SERVER_URL);
log('  Porta serial: ' + SERIAL_PORT);
log('========================================');

openSerial();
connectWS();

// Graceful shutdown
process.on('SIGINT', () => {
  log('Encerrando...');
  if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
  if (ws) ws.close();
  if (serialPort && serialPort.isOpen) serialPort.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Encerrando...');
  if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
  if (ws) ws.close();
  if (serialPort && serialPort.isOpen) serialPort.close();
  process.exit(0);
});
