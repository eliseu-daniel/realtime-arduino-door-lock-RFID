-- ===============================================================
-- Script de Criação do Banco de Dados - Controle de Acesso RFID
-- ===============================================================

CREATE DATABASE IF NOT EXISTS controle_acesso
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE controle_acesso;

-- ---------------------------------------------------------------
-- Tabela: users
-- Armazena os usuários do sistema (administradores e operadores)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,
  role       ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- Tabela: devices
-- Armazena os dispositivos (portões / controladoras) cadastrados
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(255) NOT NULL,
  serial_number  VARCHAR(255) NOT NULL UNIQUE,
  status         ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
  ultimo_contato TIMESTAMP NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_devices_serial (serial_number),
  INDEX idx_devices_status (status)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- Tabela: access_logs
-- Registra todas as ocorrências relacionadas ao controle de acesso (RFID/Porta)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  device_id  INT NULL,
  uid_tag    VARCHAR(255) NULL,
  evento     ENUM(
               'TAG_LIDA',
               'ACESSO_PERMITIDO',
               'ACESSO_NEGADO',
               'PORTAO_ABERTO',
               'PORTAO_FECHADO',
               'ABERTURA_REMOTA'
             ) NOT NULL,
  origem     ENUM('RFID', 'MOBILE', 'SISTEMA') NOT NULL,
  observacao TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_user   (user_id),
  INDEX idx_logs_device (device_id),
  INDEX idx_logs_evento (evento),
  INDEX idx_logs_origem (origem),
  INDEX idx_logs_data   (created_at),
  CONSTRAINT fk_logs_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_logs_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- Tabela: system_logs
-- Audit trail completo do sistema - rastreia todas as ações dos usuários
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NULL,
  acao         VARCHAR(255) NOT NULL,
  recurso      VARCHAR(255) NOT NULL,
  metodo       ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE') NOT NULL,
  rota         VARCHAR(500) NOT NULL,
  status_code  INT NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   TEXT NULL,
  detalhes     JSON NULL,
  resultado    ENUM('sucesso', 'erro', 'pendente') NOT NULL DEFAULT 'pendente',
  mensagem     TEXT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_system_logs_user     (user_id),
  INDEX idx_system_logs_acao     (acao),
  INDEX idx_system_logs_recurso  (recurso),
  INDEX idx_system_logs_data     (created_at),
  INDEX idx_system_logs_resultado (resultado),
  CONSTRAINT fk_system_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
