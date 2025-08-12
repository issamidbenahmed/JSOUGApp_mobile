const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('User model - Raw database rows:', rows);
    console.log('User model - First row:', rows[0]);
    if (rows[0]) {
      console.log('User model - isValidated field:', rows[0].isValidated, 'type:', typeof rows[0].isValidated);
      console.log('User model - isvalidated field (lowercase):', rows[0].isvalidated, 'type:', typeof rows[0].isvalidated);
    }
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