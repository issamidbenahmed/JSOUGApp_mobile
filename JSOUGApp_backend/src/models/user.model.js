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
  async updateBalance(id, newBalance) {
    // S'assurer que newBalance est un nombre
    const numericBalance = parseFloat(newBalance) || 0;
    await db.query('UPDATE users SET balance = ? WHERE id = ?', [numericBalance, id]);
    console.log(`Balance mise à jour pour user ${id}: ${numericBalance}`);
  },
  async findByRole(role) {
    const [rows] = await db.query('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
    return rows[0];
  },
};

module.exports = User; 