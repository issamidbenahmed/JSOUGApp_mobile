const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  async create(user) {
    const { fullName, email, password, address, price, state, role } = user;
    const [result] = await db.query(
      'INSERT INTO users (fullName, email, password, address, price, state, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, password, address, price, state, role]
    );
    return result.insertId;
  },
};

module.exports = User; 