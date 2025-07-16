const db = require('../config/db');

const Message = {
  async create(conversation_id, sender_id, text) {
    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, NOW())',
      [conversation_id, sender_id, text]
    );
    return { id: result.insertId, conversation_id, sender_id, text };
  },
  async findByConversation(conversation_id) {
    const [rows] = await db.query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation_id]
    );
    return rows;
  },
};

module.exports = Message; 