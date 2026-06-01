const { query } = require('../database/connection');

const TABLE = 'system_logs';

const systemLogRepository = {
  async findAll({ limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, limit, offset]
    );
  },

  async findById(id) {
    const rows = await query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.id = ?`,
      [TABLE, id]
    );
    return rows[0] || null;
  },

  async findByUser(userId, { limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, userId, limit, offset]
    );
  },

  async findByAction(acao, { limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.acao = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, acao, limit, offset]
    );
  },

  async findByResource(recurso, { limit = 100, offset = 0 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome, u.email AS usuario_email
       FROM ?? l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.recurso = ?
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [TABLE, recurso, limit, offset]
    );
  },

  async create({
    user_id,
    acao,
    recurso,
    metodo,
    rota,
    status_code,
    ip_address,
    user_agent,
    detalhes,
    resultado,
    mensagem,
  }) {
    try {
      const result = await query(
        `INSERT INTO ?? (user_id, acao, recurso, metodo, rota, status_code, ip_address, user_agent, detalhes, resultado, mensagem)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          TABLE,
          user_id || null,
          acao,
          recurso,
          metodo,
          rota,
          status_code || null,
          ip_address || null,
          user_agent || null,
          detalhes ? JSON.stringify(detalhes) : null,
          resultado,
          mensagem || null,
        ]
      );
      console.log('[SystemLog] Log criado com sucesso. ID:', result.insertId);
      return this.findById(result.insertId);
    } catch (error) {
      console.error('[SystemLog] Erro ao criar log:', error.message, error.code);
      throw error;
    }
  },

  async update(id, { resultado, status_code, mensagem }) {
    try {
      await query(
        `UPDATE ?? SET resultado = ?, status_code = ?, mensagem = ? WHERE id = ?`,
        [TABLE, resultado, status_code, mensagem, id]
      );
      return this.findById(id);
    } catch (error) {
      console.error('[SystemLog] Erro ao atualizar log:', error.message);
      throw error;
    }
  },
};

module.exports = systemLogRepository;
