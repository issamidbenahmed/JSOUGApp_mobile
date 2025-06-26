const db = require('../config/db');

const DrivingLicense = {
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM driving_licenses WHERE moniteur_id = ?', [moniteurId]);
    return rows;
  },
  async add(moniteurId, type) {
    await db.query('INSERT INTO driving_licenses (moniteur_id, type) VALUES (?, ?)', [moniteurId, type]);
  },
  async removeAllForMoniteur(moniteurId) {
    await db.query('DELETE FROM driving_licenses WHERE moniteur_id = ?', [moniteurId]);
  },
};

module.exports = DrivingLicense; 