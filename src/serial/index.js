const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const accessLogService = require('../services/accessLogService');
const deviceRepository = require('../repositories/deviceRepository');
const { broadcast } = require('../websocket');

let serialPort = null;

async function connectSerial() {
  const portPath = process.env.SERIAL_PORT || '/dev/ttyUSB0';
  const baudRate = parseInt(process.env.SERIAL_BAUD_RATE, 10) || 9600;

  try {
    serialPort = new SerialPort({
      path: portPath,
      baudRate,
      autoOpen: false,
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.open((err) => {
      if (err) {
        console.error(`[SERIAL] Erro ao abrir porta ${portPath}:`, err.message);
        return;
      }
      console.log(`[SERIAL] Conectado em ${portPath} (${baudRate} baud)`);
    });

    parser.on('data', (line) => {
      console.log(`[SERIAL] Recebido: ${line}`);
      try {
        const data = JSON.parse(line.trim());
        processSerialData(data);
      } catch {
        console.warn(`[SERIAL] Mensagem ignorada (JSON inválido): ${line}`);
      }
    });

    serialPort.on('error', (err) => {
      console.error('[SERIAL] Erro:', err.message);
    });

    serialPort.on('close', () => {
      console.log('[SERIAL] Porta serial fechada');
    });
  } catch (err) {
    console.error('[SERIAL] Erro ao inicializar:', err.message);
  }
}

async function processSerialData(data) {
  const { event, uid, device_id } = data;

  let device = null;
  if (device_id) {
    device = await deviceRepository.findById(device_id);
  }

  switch (event) {
    case 'TAG_LIDA':
      try {
        await accessLogService.create({
          device_id: device?.id || null,
          uid_tag: uid || null,
          evento: 'TAG_LIDA',
          origem: 'RFID',
          observacao: `Tag RFID lida: ${uid}`,
        });
        broadcast({ event: 'TAG_LIDA', uid, device_id: device?.id });
      } catch (err) {
        console.error('[SERIAL] Erro ao criar log TAG_LIDA:', err.message);
      }
      break;

    case 'ACESSO_PERMITIDO':
      try {
        await accessLogService.create({
          device_id: device?.id || null,
          uid_tag: uid || null,
          evento: 'ACESSO_PERMITIDO',
          origem: 'RFID',
          observacao: uid ? `Acesso permitido para tag: ${uid}` : 'Acesso permitido',
        });
        broadcast({ event: 'ACESSO_PERMITIDO', uid, device_id: device?.id });
      } catch (err) {
        console.error('[SERIAL] Erro ao criar log ACESSO_PERMITIDO:', err.message);
      }
      break;

    case 'ACESSO_NEGADO':
      try {
        await accessLogService.create({
          device_id: device?.id || null,
          uid_tag: uid || null,
          evento: 'ACESSO_NEGADO',
          origem: 'RFID',
          observacao: uid ? `Acesso negado para tag: ${uid}` : 'Acesso negado',
        });
        broadcast({ event: 'ACESSO_NEGADO', uid, device_id: device?.id });
      } catch (err) {
        console.error('[SERIAL] Erro ao criar log ACESSO_NEGADO:', err.message);
      }
      break;

    case 'PORTAO_ABERTO':
      try {
        await accessLogService.create({
          device_id: device?.id || null,
          evento: 'PORTAO_ABERTO',
          origem: 'RFID',
          observacao: 'Portão aberto via RFID',
        });
        broadcast({ event: 'PORTAO_ABERTO', device_id: device?.id });
      } catch (err) {
        console.error('[SERIAL] Erro ao criar log PORTAO_ABERTO:', err.message);
      }
      break;

    case 'PORTAO_FECHADO':
      try {
        await accessLogService.create({
          device_id: device?.id || null,
          evento: 'PORTAO_FECHADO',
          origem: 'RFID',
          observacao: 'Portão fechado',
        });
        broadcast({ event: 'PORTAO_FECHADO', device_id: device?.id });
      } catch (err) {
        console.error('[SERIAL] Erro ao criar log PORTAO_FECHADO:', err.message);
      }
      break;

    default:
      console.warn(`[SERIAL] Evento desconhecido: ${event}`);
  }
}

function sendCommand(command) {
  if (!serialPort || !serialPort.isOpen) {
    console.error('[SERIAL] Porta não está aberta');
    return false;
  }
  const payload = JSON.stringify({ command }) + '\n';
  serialPort.write(payload, (err) => {
    if (err) {
      console.error('[SERIAL] Erro ao enviar comando:', err.message);
    } else {
      console.log(`[SERIAL] Comando enviado: ${command}`);
    }
  });
  return true;
}

function isConnected() {
  return serialPort && serialPort.isOpen;
}

module.exports = { connectSerial, sendCommand, isConnected };
