const db = require('../config/db');

const Location = {
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM locations WHERE moniteur_id = ?', [moniteurId]);
    return rows;
  },
  async add(moniteurId, place) {
    await db.query('INSERT INTO locations (moniteur_id, place) VALUES (?, ?)', [moniteurId, place]);
  },
  async remove(id) {
    await db.query('DELETE FROM locations WHERE id = ?', [id]);
  },
  async removeAllForMoniteur(moniteurId) {
    await db.query('DELETE FROM locations WHERE moniteur_id = ?', [moniteurId]);
  },
};

module.exports = Location; 