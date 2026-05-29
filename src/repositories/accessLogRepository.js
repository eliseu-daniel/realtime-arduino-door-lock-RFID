const { query } = require('../database/connection');

const TABLE = 'access_logs';

const accessLogRepository = {
  async findAll({ limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email,
              d.nome AS dispositivo_nome, d.serial_number AS dispositivo_serial
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN devices d ON l.device_id = d.id
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, limit, offset]
    );
  },

  async findById(id) {
    const rows = await query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email,
              d.nome AS dispositivo_nome, d.serial_number AS dispositivo_serial
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN devices d ON l.device_id = d.id
       WHERE l.id = ?`,
      [TABLE, id]
    );
    return rows[0] || null;
  },

  async findByDevice(deviceId, { limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email,
              d.nome AS dispositivo_nome, d.serial_number AS dispositivo_serial
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN devices d ON l.device_id = d.id
       WHERE l.device_id = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, deviceId, limit, offset]
    );
  },

  async findByUser(userId, { limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email,
              d.nome AS dispositivo_nome, d.serial_number AS dispositivo_serial
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN devices d ON l.device_id = d.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, userId, limit, offset]
    );
  },

  async create({ user_id, device_id, uid_tag, evento, origem, observacao }) {
    const result = await query(
      'INSERT INTO ?? (user_id, device_id, uid_tag, evento, origem, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [TABLE, user_id || null, device_id || null, uid_tag || null, evento, origem, observacao || null]
    );
    return this.findById(result.insertId);
  },
};

module.exports = accessLogRepository;
