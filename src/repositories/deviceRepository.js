const { query } = require('../database/connection');

const TABLE = 'devices';

const deviceRepository = {
  async findAll() {
    return query('SELECT * FROM ?? ORDER BY created_at DESC', [TABLE]);
  },

  async findById(id) {
    const rows = await query('SELECT * FROM ?? WHERE id = ?', [TABLE, id]);
    return rows[0] || null;
  },

  async findBySerialNumber(serialNumber) {
    const rows = await query('SELECT * FROM ?? WHERE serial_number = ?', [TABLE, serialNumber]);
    return rows[0] || null;
  },

  async create({ nome, serial_number }) {
    const result = await query(
      'INSERT INTO ?? (nome, serial_number) VALUES (?, ?)',
      [TABLE, nome, serial_number]
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

module.exports = deviceRepository;
