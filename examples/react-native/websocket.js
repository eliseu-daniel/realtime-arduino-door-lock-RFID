/**
 * Exemplo de conexão WebSocket para React Native
 *
 * Este arquivo demonstra como conectar o aplicativo React Native
 * ao backend para receber eventos em tempo real e abrir o portão.
 */

// websocket.js - Módulo de conexão WebSocket

const WS_URL = 'ws://SEU_IP:3000'; // Substitua pelo IP do servidor

class AccessControlWS {
  constructor() {
    this.ws = null;
    this.token = null;
    this.listeners = {};
    this.reconnectInterval = 5000;
    this.isConnected = false;
  }

  /**
   * Conecta ao servidor WebSocket
   * @param {string} token - JWT token obtido no login
   */
  connect(token) {
    this.token = token;

    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[WS] Conectado ao servidor');
      this.isConnected = true;

      // Autentica no WebSocket
      this.send({
        event: 'AUTHENTICATE',
        token: this.token,
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Evento recebido:', data.event);

        // Dispara listeners registrados para o evento
        const handlers = this.listeners[data.event] || [];
        handlers.forEach((handler) => handler(data));

        // Dispara listener genérico se existir
        const allHandlers = this.listeners['*'] || [];
        allHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error('[WS] Erro ao processar mensagem:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Erro na conexão:', error.message);
    };

    this.ws.onclose = () => {
      console.log('[WS] Desconectado');
      this.isConnected = false;

      // Tenta reconectar após intervalo
      setTimeout(() => {
        if (this.token) {
          console.log('[WS] Tentando reconectar...');
          this.connect(this.token);
        }
      }, this.reconnectInterval);
    };
  }

  /**
   * Envia mensagem para o servidor
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Não conectado');
    }
  }

  /**
   * Abre o portão remotamente
   */
  openGate() {
    this.send({ event: 'OPEN_GATE' });
  }

  /**
   * Registra um listener para um evento específico
   * @param {string} event - Nome do evento ou '*' para todos
   * @param {function} handler - Função callback
   */
  on(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);

    // Retorna função para remover listener
    return () => {
      this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
    };
  }

  /**
   * Desconecta do servidor
   */
  disconnect() {
    this.token = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new AccessControlWS();

// ============================================================
// EXEMPLO DE USO NO REACT NATIVE
// ============================================================

/*
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import ws from './websocket';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Conecta com o token JWT
    ws.connect('seu_token_jwt_aqui');

    // Listeners de eventos
    const unsubTag = ws.on('TAG_LIDA', (data) => {
      addLog(`Tag lida: ${data.uid}`);
    });

    const unsubPermitido = ws.on('ACESSO_PERMITIDO', (data) => {
      addLog('Acesso permitido');
    });

    const unsubNegado = ws.on('ACESSO_NEGADO', (data) => {
      addLog('Acesso negado');
    });

    const unsubAberto = ws.on('PORTAO_ABERTO', (data) => {
      addLog('Portão aberto');
    });

    const unsubFechado = ws.on('PORTAO_FECHADO', (data) => {
      addLog('Portão fechado');
    });

    const unsubConectado = ws.on('USUARIO_CONECTADO', () => {
      setConnected(true);
      addLog('Conectado ao sistema');
    });

    // Cleanup ao desmontar
    return () => {
      unsubTag();
      unsubPermitido();
      unsubNegado();
      unsubAberto();
      unsubFechado();
      unsubConectado();
      ws.disconnect();
    };
  }, []);

  function addLog(message) {
    setLogs((prev) => [
      { id: Date.now().toString(), message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  }

  function handleOpenGate() {
    ws.openGate();
    addLog('Solicitando abertura remota...');
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
        Controle de Acesso
      </Text>

      <Text style={{ textAlign: 'center', color: connected ? 'green' : 'red' }}>
        {connected ? 'Conectado' : 'Desconectado'}
      </Text>

      <TouchableOpacity
        onPress={handleOpenGate}
        style={{
          backgroundColor: '#2196F3',
          padding: 15,
          borderRadius: 10,
          marginVertical: 20,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
          ABRIR PORTÃO
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Últimos Eventos
      </Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <Text>{item.time} - {item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}
*/
