const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const DrivingLicense = require('../models/driving_license.model');
const Location = require('../models/location.model');
const Car = require('../models/car.model');
const CarPhoto = require('../models/car_photo.model');
const Certificate = require('../models/certificate.model');
const Poste = require('../models/poste.model');
const Booking = require('../models/booking.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'avatar_' + req.user.id + '_' + Date.now() + ext);
  },
});
const upload = multer({ storage });
exports.uploadAvatar = upload.single('avatar');

const multerCarPhoto = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'));
}});
const multerCertificate = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'));
}});

exports.getMoniteurProfile = async (req, res) => {
  const moniteurId = req.user.id; // assuming JWT middleware sets req.user
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [moniteurId]);
    if (!rows.length) return res.status(404).json({ error: 'Moniteur not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMoniteurProfile = async (req, res) => {
  const moniteurId = req.user.id;
  const { fullName, description, email, phone, address, password } = req.body;
  try {
    console.log('--- updateMoniteurProfile called ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const fields = [];
    const values = [];
    if (fullName !== undefined) { fields.push('fullName = ?'); values.push(fullName); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }
    if (password !== undefined) { fields.push('password = ?'); values.push(password); }
    // Handle avatar upload
    if (req.file) {
      const avatarPath = '/uploads/' + req.file.filename;
      fields.push('avatar = ?');
      values.push(avatarPath);
      console.log('Avatar path to save:', avatarPath);
    }
    if (!fields.length) {
      console.log('No fields to update');
      return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(moniteurId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    console.log('SQL:', sql);
    console.log('Values:', values);
    const result = await db.query(sql, values);
    console.log('DB result:', result);
    res.json({ message: 'Profile updated', avatar: req.file ? '/uploads/' + req.file.filename : undefined });
  } catch (err) {
    console.error('Error in updateMoniteurProfile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const moniteurId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  try {
    // 1. Récupérer l'utilisateur
    const user = await User.findById(moniteurId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // 2. Vérifier l'ancien mot de passe
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    // 3. Hasher le nouveau mot de passe
    const hash = await bcrypt.hash(newPassword, 10);
    // 4. Mettre à jour le mot de passe
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, moniteurId]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error in changePassword:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMoniteurDetails = async (req, res) => {
  const moniteurId = req.user.id;
  try {
    // Permis
    const licenses = await DrivingLicense.findByMoniteur(moniteurId);
    // Locations
    const locations = await Location.findByMoniteur(moniteurId);
    // Voitures (photos are already included as an array)
    const cars = await Car.findByMoniteur(moniteurId);
    // Certificats
    const certificates = await Certificate.findByMoniteur(moniteurId);
    res.json({ licenses, locations, cars, certificates });
  } catch (err) {
    console.error('Error in getMoniteurDetails:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMoniteurDetails = async (req, res) => {
  const moniteurId = req.user.id;
  const { licenses, locations, cars, certificates, price, description } = req.body;
  try {
    // Mettre à jour prix et description dans users
    const fields = [];
    const values = [];
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (fields.length) {
      values.push(moniteurId);
      await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    // Permis
    await DrivingLicense.removeAllForMoniteur(moniteurId);
    if (Array.isArray(licenses)) {
      for (const lic of licenses) {
        await DrivingLicense.add(moniteurId, lic.type || lic);
      }
    }
    // Locations
    await Location.removeAllForMoniteur(moniteurId);
    if (Array.isArray(locations)) {
      for (const loc of locations) {
        await Location.add(moniteurId, loc.place || loc);
      }
    }
    // Voitures
    await Car.removeAllForMoniteur(moniteurId);
    if (Array.isArray(cars)) {
      for (const car of cars) {
        // car.photos should be an array of URLs
        await Car.add(moniteurId, car.model || '', car.transmission || '', car.fuel_type || '', car.price || 0, car.photos || []);
      }
    }
    // Certificats
    await Certificate.removeAllForMoniteur(moniteurId);
    if (Array.isArray(certificates)) {
      for (const cert of certificates) {
        await Certificate.add(moniteurId, cert.photo_url || cert);
      }
    }
    res.json({ message: 'Details updated' });
  } catch (err) {
    console.error('Error in updateMoniteurDetails:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Multer setup for car photos
const carPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'car_photo_' + Date.now() + ext);
  },
});
const uploadCarPhoto = multer({ storage: carPhotoStorage });

// Multer setup for certificates
const certificateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'certificate_' + Date.now() + ext);
  },
});
const uploadCertificate = multer({ storage: certificateStorage });

// Car photo upload endpoint
exports.uploadCarPhoto = [uploadCarPhoto.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photo_url = '/uploads/' + req.file.filename;
  res.json({ photo_url });
}];

// Certificate upload endpoint
exports.uploadCertificate = [uploadCertificate.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photo_url = '/uploads/' + req.file.filename;
  res.json({ photo_url });
}];

exports.deleteCarPhoto = async (req, res) => {
  const { id } = req.params;
  try {
    await CarPhoto.remove(id);
    res.json({ message: 'Car photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    await Certificate.remove(id);
    res.json({ message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPoste = async (req, res) => {
  const moniteurId = req.user.id;
  const { price, description } = req.body;
  if (!price || !description) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  try {
    const poste = await Poste.create(moniteurId, price, description);
    res.json({ success: true, poste });
  } catch (err) {
    console.error('Erreur createPoste:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getMyPostes = async (req, res) => {
  const moniteurId = req.user.id;
  try {
    const postes = await Poste.findByMoniteur(moniteurId);
    res.json(postes);
  } catch (err) {
    console.error('Erreur getMyPostes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getAllPostes = async (req, res) => {
  try {
    const postes = await Poste.findAllWithMoniteurAndCar();
    res.json(postes);
  } catch (err) {
    console.error('Erreur getAllPostes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Vérifier la disponibilité d'un créneau
exports.checkBookingSlot = async (req, res) => {
  const { poste_id, date, slot, hour } = req.query;
  if (!poste_id || !date || !slot || !hour) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  try {
    const taken = await Booking.isSlotTaken(poste_id, date, slot, hour);
    res.json({ taken });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une réservation (statut initial : pending)
exports.createBooking = async (req, res) => {
  const eleve_id = req.user.id;
  const { moniteur_id, poste_id, date, slot, hour } = req.body;
  if (!moniteur_id || !poste_id || !date || !slot || !hour) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  try {
    const taken = await Booking.isSlotTaken(poste_id, date, slot, hour);
    if (taken) {
      return res.status(409).json({ error: 'Ce créneau est déjà réservé' });
    }
    // La réservation est créée avec status: 'pending', commission: 10, payment_status: 'unpaid'
    const booking = await Booking.create(eleve_id, moniteur_id, poste_id, date, slot, hour);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Démarrer une conversation (ou la retrouver)
exports.startConversation = async (req, res) => {
  const user1_id = req.user.id;
  const { user2_id } = req.body;
  if (!user2_id) return res.status(400).json({ error: 'user2_id requis' });
  try {
    const conv = await Conversation.findOrCreate(user1_id, user2_id);
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Lister toutes les conversations de l'utilisateur
exports.getConversations = async (req, res) => {
  const user_id = req.user.id;
  try {
    const convs = await Conversation.findByUser(user_id);
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer les messages d'une conversation
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.findByConversation(conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  const sender_id = req.user.id;
  const { conversationId } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Message vide' });
  try {
    const msg = await Message.create(conversationId, sender_id, text);
    await Conversation.updateLastMessage(conversationId, text, new Date());
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Statut en ligne d'un utilisateur
exports.getUserStatus = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = require('../config/db');
    const [rows] = await db.query('SELECT last_seen FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ online: false });
    const lastSeen = rows[0].last_seen;
    if (!lastSeen) return res.json({ online: false });
    const last = new Date(lastSeen);
    const now = new Date();
    const diff = (now - last) / 1000; // secondes
    res.json({ online: diff < 120 });
  } catch (err) {
    res.status(500).json({ online: false });
  }
};

// Supprimer un poste
exports.deletePoste = async (req, res) => {
  const moniteurId = req.user.id;
  const posteId = req.params.id;
  try {
    // Vérifie que le poste appartient bien au moniteur
    const [rows] = await db.query('SELECT * FROM postes WHERE id = ? AND moniteur_id = ?', [posteId, moniteurId]);
    if (!rows.length) return res.status(404).json({ error: 'Poste non trouvé' });
    await db.query('DELETE FROM postes WHERE id = ?', [posteId]);
    res.json({ success: true, message: 'Poste supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Accepter ou refuser une réservation
exports.respondToBooking = async (req, res) => {
  const moniteur_id = req.user.id;
  const { booking_id, action } = req.body; // action: 'accept' ou 'reject'
  if (!booking_id || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  try {
    const booking = await Booking.getById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' });
    if (booking.moniteur_id != moniteur_id) return res.status(403).json({ error: 'Non autorisé' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Réservation déjà traitée' });
    if (action === 'reject') {
      await Booking.updateStatus(booking_id, 'rejected');
      return res.json({ success: true, status: 'rejected' });
    }
    // action === 'accept'
    // Vérifier le solde du moniteur
    const user = await User.findById(moniteur_id);
    if (user.balance < booking.commission) {
      return res.status(400).json({ error: 'Solde insuffisant pour accepter la réservation.' });
    }
    await Booking.updateStatus(booking_id, 'accepted');
    return res.json({ success: true, status: 'accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Confirmer le paiement d'une réservation (par l'élève)
exports.confirmBookingPayment = async (req, res) => {
  const eleve_id = req.user.id;
  const { booking_id, payment_method } = req.body; // payment_method: 'local' ou 'stripe'
  if (!booking_id || !['local', 'stripe'].includes(payment_method)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  try {
    const booking = await Booking.getById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' });
    if (booking.eleve_id != eleve_id) return res.status(403).json({ error: 'Non autorisé' });
    if (booking.status !== 'accepted') return res.status(400).json({ error: 'Réservation non acceptée par le moniteur' });
    // Vérifier le solde du moniteur
    const moniteur = await User.findById(booking.moniteur_id);
    if (moniteur.balance < booking.commission) {
      return res.status(400).json({ error: 'Solde du moniteur insuffisant, veuillez attendre qu’il recharge.' });
    }
    // Déduire la commission
    const newBalance = moniteur.balance - booking.commission;
    await User.updateBalance(moniteur.id, newBalance);
    // Passer la réservation à completed, paid, et enregistrer le mode de paiement
    await Booking.completeBooking(booking_id, payment_method);
    res.json({ success: true, status: 'completed' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une session Stripe Checkout pour recharger le solde du moniteur
exports.createStripeRechargeSession = async (req, res) => {
  const moniteur_id = req.user.id;
  const { amount } = req.body; // en dirhams
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: 'Recharge solde moniteur',
            },
            unit_amount: Math.round(amount * 100), // Stripe attend les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/recharge-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/recharge-cancel`,
      metadata: {
        moniteur_id: String(moniteur_id),
        amount: String(amount),
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Erreur Stripe:', err);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
};

// Créer une session Stripe Checkout pour payer une réservation (élève)
exports.createStripeBookingSession = async (req, res) => {
  const eleve_id = req.user.id;
  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id requis' });
  }
  try {
    // Récupérer la réservation
    const booking = await Booking.getById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' });
    if (booking.eleve_id != eleve_id) return res.status(403).json({ error: 'Non autorisé' });
    // Récupérer le poste pour le prix
    const [posteRows] = await db.query('SELECT * FROM postes WHERE id = ?', [booking.poste_id]);
    const poste = posteRows[0];
    if (!poste || !poste.price) return res.status(400).json({ error: 'Prix du poste introuvable' });
    const amount = parseFloat(poste.price);
    if (!amount || isNaN(amount) || amount < 5) {
      return res.status(400).json({ error: 'Montant trop petit pour Stripe (min 5 MAD)' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: `Réservation poste #${poste.id}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/recharge-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/recharge-cancel`,
      metadata: {
        eleve_id: String(eleve_id),
        booking_id: String(booking_id),
        poste_id: String(poste.id),
        amount: String(amount),
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Erreur Stripe:', err);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
};

// Webhook Stripe pour traiter les paiements (recharge moniteur + paiement réservation élève)
exports.stripeWebhook = async (req, res) => {
  // LOG DU RAW BODY POUR DEBUG
  console.log('RAW BODY:', req.body);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // Utilise req.body (car express.raw) et PAS req.rawBody
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur signature Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('SESSION STRIPE:', session);
    
    // Vérifier si c'est une recharge moniteur
    const moniteur_id = session.metadata && session.metadata.moniteur_id;
    const amount = session.metadata && parseFloat(session.metadata.amount);
    
    if (moniteur_id && amount) {
      // Recharge moniteur
      try {
        const user = await User.findById(moniteur_id);
        if (user) {
          const newBalance = parseFloat(user.balance || 0) + amount;
          await User.updateBalance(moniteur_id, newBalance);
          
          // Enregistrer la transaction de recharge
          await db.query('INSERT INTO transactions (moniteur_id, type, amount, description) VALUES (?, ?, ?, ?)', 
            [moniteur_id, 'recharge', amount, `Recharge solde via Stripe`]);
          
          console.log(`Solde crédité pour moniteur ${moniteur_id}: +${amount} MAD`);
        }
      } catch (err) {
        console.error('Erreur crédit solde:', err);
      }
    }
    
    // Vérifier si c'est un paiement de réservation élève
    const booking_id = session.metadata && session.metadata.booking_id;
    const eleve_id = session.metadata && session.metadata.eleve_id;
    
    if (booking_id && eleve_id) {
      // Paiement réservation élève
      try {
        const booking = await Booking.getById(booking_id);
        const posteAmount = parseFloat(session.metadata.amount) || 0;
        
        // Ignorer les paiements de test (montants trop petits)
        if (posteAmount < 5) {
          console.log(`Paiement ignoré (montant trop petit): ${posteAmount} MAD pour réservation ${booking_id}`);
          return res.json({ received: true });
        }
        
        if (booking && booking.status === 'accepted') {
          // Vérifier le solde du moniteur
          const moniteur = await User.findById(booking.moniteur_id);
          const moniteurBalance = parseFloat(moniteur.balance) || 0;
          const commission = parseFloat(booking.commission) || 0;
          
          if (moniteurBalance >= commission) {
            // Ajouter le montant payé au solde du moniteur (posteAmount déjà défini plus haut)
            const newMoniteurBalance = moniteurBalance + posteAmount - commission;
            console.log(`Moniteur ${moniteur.id}: solde avant=${moniteurBalance}, montant poste=${posteAmount}, commission=${commission}, nouveau solde=${newMoniteurBalance}`);
            await User.updateBalance(moniteur.id, newMoniteurBalance);
            
            // Ajouter la commission au solde de l'administrateur
            const admin = await User.findByRole('admin');
            console.log('Admin trouvé:', admin);
            if (admin) {
              const adminBalance = parseFloat(admin.balance) || 0;
              const newAdminBalance = adminBalance + commission;
              console.log(`Admin ${admin.id}: solde avant=${adminBalance}, commission=${commission}, nouveau solde=${newAdminBalance}`);
              await User.updateBalance(admin.id, newAdminBalance);
            } else {
              console.error('Aucun administrateur trouvé dans la base de données');
            }
            
            // Enregistrer la transaction commission
            await db.query('INSERT INTO transactions (moniteur_id, type, amount, description) VALUES (?, ?, ?, ?)', 
              [booking.moniteur_id, 'commission', -booking.commission, `Commission pour réservation #${booking_id} (Stripe)`]);
            
            // Marquer la réservation comme payée et complétée (SANS redéduire la commission)
            await db.query('UPDATE bookings SET status = ?, payment_status = ?, payment_method = ? WHERE id = ?', 
              ['completed', 'paid', 'stripe', booking_id]);
            
            console.log(`Réservation ${booking_id} payée via Stripe: +${posteAmount} MAD au moniteur, -${booking.commission} MAD commission, +${booking.commission} MAD à l'admin`);
          } else {
            console.error(`Solde insuffisant pour moniteur ${moniteur.id}, réservation ${booking_id} non traitée`);
          }
        }
      } catch (err) {
        console.error('Erreur traitement paiement réservation:', err);
      }
    }
  }
  res.json({ received: true });
};

// Récupérer l'historique des transactions du moniteur
exports.getTransactions = async (req, res) => {
  const moniteur_id = req.user.id;
  try {
    const db = require('../config/db');
    const [rows] = await db.query('SELECT * FROM transactions WHERE moniteur_id = ? ORDER BY date DESC', [moniteur_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer les réservations du moniteur ou de l'élève connecté
exports.getBookings = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    const db = require('../config/db');
    let rows;
    if (userRole === 'moniteur') {
      [rows] = await db.query('SELECT * FROM bookings WHERE moniteur_id = ? ORDER BY date DESC', [userId]);
    } else if (userRole === 'eleve') {
      [rows] = await db.query('SELECT * FROM bookings WHERE eleve_id = ? ORDER BY date DESC', [userId]);
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 