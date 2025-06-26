const db = require('../config/db');

const Certificate = {
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM certificates WHERE moniteur_id = ?', [moniteurId]);
    return rows;
  },
  async add(moniteurId, photo_url) {
    await db.query('INSERT INTO certificates (moniteur_id, photo_url) VALUES (?, ?)', [moniteurId, photo_url]);
  },
  async remove(id) {
    await db.query('DELETE FROM certificates WHERE id = ?', [id]);
  },
  async removeAllForMoniteur(moniteurId) {
    await db.query('DELETE FROM certificates WHERE moniteur_id = ?', [moniteurId]);
  },
};

module.exports = Certificate; 