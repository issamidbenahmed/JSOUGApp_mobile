const db = require('../config/db');

const Car = {
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM cars WHERE moniteur_id = ?', [moniteurId]);
    return rows;
  },
  async add(moniteurId, model, transmission, fuel_type, price) {
    const [result] = await db.query('INSERT INTO cars (moniteur_id, model, transmission, fuel_type, price) VALUES (?, ?, ?, ?, ?)', [moniteurId, model, transmission, fuel_type, price]);
    return result.insertId;
  },
  async update(id, model, transmission, fuel_type, price) {
    await db.query('UPDATE cars SET model = ?, transmission = ?, fuel_type = ?, price = ? WHERE id = ?', [model, transmission, fuel_type, price, id]);
  },
  async remove(id) {
    await db.query('DELETE FROM cars WHERE id = ?', [id]);
  },
  async removeAllForMoniteur(moniteurId) {
    await db.query('DELETE FROM cars WHERE moniteur_id = ?', [moniteurId]);
  },
};

module.exports = Car; 