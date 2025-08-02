const db = require('../config/db');

const Notification = {
  async create({ user_id, type, title, body }) {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, type, title, body) VALUES (?, ?, ?, ?)',
      [user_id, type, title, body]
    );
    return result.insertId;
  },

  async getAllForUser(user_id) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return rows;
  },

  async markAsRead(notification_id) {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notification_id]
    );
  },

  async markAllAsRead(user_id) {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [user_id]
    );
  },
};

module.exports = Notification; 