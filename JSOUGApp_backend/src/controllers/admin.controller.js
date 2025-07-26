const db = require('../config/db');
const User = require('../models/user.model');

// Récupérer le solde de l'administrateur
exports.getBalance = async (req, res) => {
  try {
    const admin = await User.findByRole('admin');
    if (!admin) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    res.json({ balance: admin.balance || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer toutes les réservations
exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, 
             u1.fullName as eleve_name,
             u2.fullName as moniteur_name
      FROM bookings b
      LEFT JOIN users u1 ON b.eleve_id = u1.id
      LEFT JOIN users u2 ON b.moniteur_id = u2.id
      ORDER BY b.createdAt DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer toutes les transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, u.fullName as moniteur_name
      FROM transactions t
      LEFT JOIN users u ON t.moniteur_id = u.id
      ORDER BY t.date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

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