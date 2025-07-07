const db = require('../config/db');
const DrivingLicense = require('./driving_license.model');
const Location = require('./location.model');
const Car = require('./car.model');
const Certificate = require('./certificate.model');

const Poste = {
  async create(moniteurId, price, description) {
    const [result] = await db.query(
      'INSERT INTO postes (moniteur_id, price, description, createdAt) VALUES (?, ?, ?, NOW())',
      [moniteurId, price, description]
    );
    return { id: result.insertId, moniteur_id: moniteurId, price, description };
  },
  async findByMoniteur(moniteurId) {
    const [rows] = await db.query('SELECT * FROM postes WHERE moniteur_id = ? ORDER BY createdAt DESC', [moniteurId]);
    return rows;
  },
  async findAll() {
    const [rows] = await db.query('SELECT * FROM postes ORDER BY createdAt DESC');
    return rows;
  },
  async delete(id, moniteurId) {
    await db.query('DELETE FROM postes WHERE id = ? AND moniteur_id = ?', [id, moniteurId]);
  },
};

Poste.findAllWithMoniteurAndCar = async function () {
  // On récupère le poste, le moniteur, et la première voiture (et sa première photo)
  const [rows] = await db.query(`
    SELECT 
      p.id AS poste_id, p.price, p.description AS poste_description, p.createdAt,
      u.id AS moniteur_id, u.fullName, u.avatar, u.description AS moniteur_description,
      c.id AS car_id, c.model, c.transmission, c.fuel_type, c.photos
    FROM postes p
    JOIN users u ON p.moniteur_id = u.id
    LEFT JOIN cars c ON c.moniteur_id = u.id
    GROUP BY p.id
    ORDER BY p.createdAt DESC
  `);
  // Pour chaque poste, on ajoute les permis, la localisation, la description, les voitures et certificats du moniteur
  const result = [];
  for (const row of rows) {
    let carPhotos = [];
    if (row.photos) {
      try { carPhotos = JSON.parse(row.photos); } catch (e) { carPhotos = []; }
    }
    // Récupérer les permis du moniteur
    const licenses = await DrivingLicense.findByMoniteur(row.moniteur_id);
    // Récupérer la localisation principale du moniteur
    const locations = await Location.findByMoniteur(row.moniteur_id);
    // Récupérer toutes les voitures du moniteur
    const cars = await Car.findByMoniteur(row.moniteur_id);
    // Récupérer tous les certificats du moniteur
    const certificates = await Certificate.findByMoniteur(row.moniteur_id);
    result.push({
      poste_id: row.poste_id,
      price: row.price,
      description: row.poste_description,
      createdAt: row.createdAt,
      moniteur: {
        id: row.moniteur_id,
        fullName: row.fullName,
        avatar: row.avatar,
        description: row.moniteur_description
      },
      car: {
        id: row.car_id,
        model: row.model,
        transmission: row.transmission,
        fuel_type: row.fuel_type,
        photo: carPhotos[0]?.photo_url || carPhotos[0] || null
      },
      licenses: licenses.map(l => l.type),
      location: locations[0]?.place || null,
      cars: cars,
      certificates: certificates
    });
  }
  return result;
};

module.exports = Poste; 