const db = require('../config/db');

exports.getAllMoniteurs = async (req, res) => {
  try {
    // Récupérer les moniteurs avec leurs infos de base
    const [moniteurs] = await db.query("SELECT id, fullName, email, isValidated FROM users WHERE role = 'moniteur'");
    // Pour chaque moniteur, récupérer permis, voitures, certificats
    for (const m of moniteurs) {
      // Licences
      const [licenses] = await db.query('SELECT type FROM driving_licenses WHERE moniteur_id = ?', [m.id]);
      m.licenses = licenses;
      // Voitures
      const [cars] = await db.query('SELECT * FROM cars WHERE moniteur_id = ?', [m.id]);
      for (const car of cars) {
        // On parse la colonne photos (JSON)
        try {
          car.photos = car.photos ? JSON.parse(car.photos) : [];
        } catch (e) {
          car.photos = [];
        }
      }
      m.cars = cars;
      // Certificats
      const [certificates] = await db.query('SELECT photo_url FROM certificates WHERE moniteur_id = ?', [m.id]);
      m.certificates = certificates;
    }
    res.json(moniteurs);
  } catch (err) {
    console.error('Erreur getAllMoniteurs:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.validateMoniteur = async (req, res) => {
  const moniteurId = req.params.id;
  try {
    await db.query('UPDATE users SET isValidated = 1 WHERE id = ?', [moniteurId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur validateMoniteur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 