const db = require('../config/db');

const OTP = {
  async create(phone, code) {
    try {
      const [result] = await db.query('INSERT INTO otps (phone, code, createdAt) VALUES (?, ?, NOW())', [phone, code]);
      console.log('OTP insert result:', result);
      return result;
    } catch (err) {
      console.error('Erreur lors de l\'insertion OTP:', err);
      throw err;
    }
  },
  async verify(phone, code) {
    const [rows] = await db.query(
      'SELECT * FROM otps WHERE phone = ? AND code = ? AND createdAt > (NOW() - INTERVAL 10 MINUTE)',
      [phone, code]
    );
    return rows.length > 0;
  },
  async delete(phone) {
    await db.query('DELETE FROM otps WHERE phone = ?', [phone]);
  }
};

module.exports = OTP; 