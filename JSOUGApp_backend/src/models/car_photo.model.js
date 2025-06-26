const db = require('../config/db');

const CarPhoto = {
  async findByCar(carId) {
    const [rows] = await db.query('SELECT * FROM car_photos WHERE car_id = ?', [carId]);
    return rows;
  },
  async add(carId, photo_url) {
    await db.query('INSERT INTO car_photos (car_id, photo_url) VALUES (?, ?)', [carId, photo_url]);
  },
  async remove(id) {
    await db.query('DELETE FROM car_photos WHERE id = ?', [id]);
  },
  async removeAllForCar(carId) {
    await db.query('DELETE FROM car_photos WHERE car_id = ?', [carId]);
  },
};

module.exports = CarPhoto; 