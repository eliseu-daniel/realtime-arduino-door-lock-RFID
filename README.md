# API - Controle de Acesso Inteligente

## Docker (recomendado)

### Pré-requisitos

- [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados
- Arduino conectado via USB (opcional, a aplicação funciona sem)

### Executar

```bash
docker compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

### Parar

```bash
docker compose down
```

### Arduino conectado

Se tiver um Arduino conectado via USB em `/dev/ttyUSB0`, descomente no `docker-compose.yml`:

```yaml
    # devices:
    #   - /dev/ttyUSB0:/dev/ttyUSB0
```

Caso a porta serial seja diferente, ajuste a variável `SERIAL_PORT` no mesmo arquivo.

---

## Execução manual

### Variáveis de ambiente

Copie o arquivo de exemplo e ajuste:

```bash
cp .env.example .env
```

### Banco de dados

Crie o banco MySQL com o schema:

```bash
mysql -u root -p < src/database/script.sql
```

### Instalar dependências

```bash
npm install
```

### Iniciar servidor

```bash
npm run dev
```

---

## Base URL

```
http://localhost:3000/api
```

## Autenticação

### POST /auth/register

Cadastro de novo usuário.

**Payload:**

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "role": "usuario"
}
```

**Resposta (201):**

```json
{
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "usuario",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST /auth/login

**Payload:**

```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Resposta (200):**

```json
{
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "usuario"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "role": "usuario",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## Dispositivos

### GET /devices

Lista todos os dispositivos.

**Headers:** `Authorization: Bearer <token>`

---

### POST /devices

Cria um novo dispositivo. (Admin apenas)

**Headers:** `Authorization: Bearer <token>`

**Payload:**

```json
{
  "nome": "Portão Principal",
  "serial_number": "ARDUINO-001"
}
```

---

### PUT /devices/:id

Atualiza um dispositivo. (Admin apenas)

**Headers:** `Authorization: Bearer <token>`

---

### DELETE /devices/:id

Remove um dispositivo. (Admin apenas)

**Headers:** `Authorization: Bearer <token>`

---

## Logs de Acesso

### GET /logs

Lista todos os logs.

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?limit=50&offset=0`

---

### GET /logs/:id

Retorna um log específico.

---

### GET /logs/device/:deviceId

Logs filtrados por dispositivo.

---

### GET /logs/user/:userId

Logs filtrados por usuário.

---

## WebSocket

**Conexão:** `ws://localhost:3000`

### Autenticação

Enviar após conectar:

```json
{
  "event": "AUTHENTICATE",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Eventos Recebidos

| Evento | Descrição |
|--------|-----------|
| TAG_LIDA | Tag RFID foi lida |
| ACESSO_PERMITIDO | Acesso autorizado |
| ACESSO_NEGADO | Acesso negado |
| PORTAO_ABERTO | Portão foi aberto |
| PORTAO_FECHADO | Portão foi fechado |
| USUARIO_CONECTADO | Conexão WebSocket autenticada |

### Eventos Enviados

```json
{
  "event": "OPEN_GATE"
}
```

---

## Comandos Seriais (Arduino)

### Recebidos do Arduino

```json
{"event":"TAG_LIDA","uid":"83 B9 BE 18"}
{"event":"ACESSO_PERMITIDO","uid":"83 B9 BE 18"}
{"event":"ACESSO_NEGADO","uid":"83 B9 BE 18"}
{"event":"PORTAO_ABERTO"}
{"event":"PORTAO_FECHADO"}
```

### Enviados para o Arduino

```
{"command":"OPEN_GATE"}
{"command":"LOCK_GATE"}
```
