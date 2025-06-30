const db = require('../config/db');

const Car = {
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM cars WHERE moniteur_id = ?', [moniteurId]);
    // Parse the photos JSON string into an array
    return rows.map(car => ({
      ...car,
      photos: car.photos ? JSON.parse(car.photos) : [],
    }));
  },
  async add(moniteurId, model, transmission, fuel_type, price, photos) {
    const photosJson = JSON.stringify(photos || []);
    const [result] = await db.query('INSERT INTO cars (moniteur_id, model, transmission, fuel_type, price, photos) VALUES (?, ?, ?, ?, ?, ?)', [moniteurId, model, transmission, fuel_type, price, photosJson]);
    return result.insertId;
  },
  async update(id, model, transmission, fuel_type, price, photos) {
    const photosJson = JSON.stringify(photos || []);
    await db.query('UPDATE cars SET model = ?, transmission = ?, fuel_type = ?, price = ?, photos = ? WHERE id = ?', [model, transmission, fuel_type, price, photosJson, id]);
  },
  async remove(id) {
    await db.query('DELETE FROM cars WHERE id = ?', [id]);
  },
  async removeAllForMoniteur(moniteurId) {
    await db.query('DELETE FROM cars WHERE moniteur_id = ?', [moniteurId]);
  },
};

module.exports = Car; 