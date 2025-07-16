const db = require('../config/db');

const Conversation = {
  async findOrCreate(user1_id, user2_id) {
    // Toujours user1_id < user2_id pour éviter les doublons
    const [a, b] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
    const [rows] = await db.query('SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?', [a, b]);
    if (rows.length) return rows[0];
    const [result] = await db.query('INSERT INTO conversations (user1_id, user2_id, last_message, last_date) VALUES (?, ?, NULL, NOW())', [a, b]);
    return { id: result.insertId, user1_id: a, user2_id: b };
  },
  async findByUser(user_id) {
    const [rows] = await db.query('SELECT * FROM conversations WHERE user1_id = ? OR user2_id = ? ORDER BY last_date DESC', [user_id, user_id]);
    // Pour chaque conversation, ajouter le nom et l'avatar de l'autre utilisateur
    const result = [];
    for (const conv of rows) {
      const otherId = conv.user1_id === user_id ? conv.user2_id : conv.user1_id;
      const [users] = await db.query('SELECT fullName, avatar FROM users WHERE id = ?', [otherId]);
      result.push({
        ...conv,
        fullName: users[0]?.fullName || 'Utilisateur',
        avatar: users[0]?.avatar || null,
        currentUserId: user_id,
      });
    }
    return result;
  },
  async updateLastMessage(conversation_id, message, date) {
    await db.query('UPDATE conversations SET last_message = ?, last_date = ? WHERE id = ?', [message, date, conversation_id]);
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM conversations WHERE id = ?', [id]);
    return rows[0];
  },
};

module.exports = Conversation; 