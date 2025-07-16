const db = require('../config/db');

const Booking = {
  async create(eleve_id, moniteur_id, poste_id, date, slot, hour) {
    const [result] = await db.query(
      'INSERT INTO bookings (eleve_id, moniteur_id, poste_id, date, slot, hour, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [eleve_id, moniteur_id, poste_id, date, slot, hour]
    );
    return { id: result.insertId, eleve_id, moniteur_id, poste_id, date, slot, hour };
  },
  async isSlotTaken(poste_id, date, slot, hour) {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE poste_id = ? AND date = ? AND slot = ? AND hour = ?',
      [poste_id, date, slot, hour]
    );
    return rows.length > 0;
  },
  async findByEleve(eleve_id) {
    const [rows] = await db.query('SELECT * FROM bookings WHERE eleve_id = ?', [eleve_id]);
    return rows;
  },
  async findByMoniteur(moniteur_id) {
    const [rows] = await db.query('SELECT * FROM bookings WHERE moniteur_id = ?', [moniteur_id]);
    return rows;
  },
};

module.exports = Booking; 