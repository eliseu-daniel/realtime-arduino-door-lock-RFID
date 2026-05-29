const { query } = require('../database/connection');

const TABLE = 'users';

const userRepository = {
  async findAll() {
    return query('SELECT id, nome, email, role, created_at, updated_at FROM ?? ORDER BY created_at DESC', [TABLE]);
  },

  async findById(id) {
    const rows = await query('SELECT id, nome, email, role, created_at, updated_at FROM ?? WHERE id = ?', [TABLE, id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const rows = await query('SELECT * FROM ?? WHERE email = ?', [TABLE, email]);
    return rows[0] || null;
  },

  async create({ nome, email, senha, role }) {
    const result = await query(
      'INSERT INTO ?? (nome, email, senha, role) VALUES (?, ?, ?, ?)',
      [TABLE, nome, email, senha, role || 'usuario']
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push('?? = ?');
        values.push(key, value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await query(`UPDATE ?? SET ${fields.join(', ')} WHERE id = ?`, [TABLE, ...values]);
    return this.findById(id);
  },

  async delete(id) {
    await query('DELETE FROM ?? WHERE id = ?', [TABLE, id]);
  },
};

module.exports = userRepository;
