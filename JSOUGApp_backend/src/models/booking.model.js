const db = require('../config/db');

const Booking = {
  async create(eleve_id, moniteur_id, poste_id, date, slot, hour) {
    const [result] = await db.query(
      'INSERT INTO bookings (eleve_id, moniteur_id, poste_id, date, slot, hour, status, commission, payment_status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [eleve_id, moniteur_id, poste_id, date, slot, hour, 'pending', 10, 'unpaid']
    );
    return { id: result.insertId, eleve_id, moniteur_id, poste_id, date, slot, hour, status: 'pending', commission: 10, payment_status: 'unpaid' };
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
  async updateStatus(booking_id, status) {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, booking_id]);
  },
  async getById(booking_id) {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    return rows[0];
  },
  async updatePaymentMethod(booking_id, payment_method) {
    await db.query('UPDATE bookings SET payment_method = ? WHERE id = ?', [payment_method, booking_id]);
  },
  async completeBooking(booking_id, payment_method) {
    // On met à jour la réservation
    await db.query('UPDATE bookings SET status = ?, payment_status = ?, payment_method = ? WHERE id = ?', ['completed', 'paid', payment_method, booking_id]);
    // On enregistre la transaction commission si applicable (seulement pour paiement local)
    if (payment_method === 'local') {
      const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
      const booking = rows[0];
      if (booking && booking.commission && booking.moniteur_id) {
        await db.query('INSERT INTO transactions (moniteur_id, type, amount, description) VALUES (?, ?, ?, ?)', [booking.moniteur_id, 'commission', -booking.commission, `Commission pour réservation #${booking_id} (local)`]);
      }
    }
  },
};

module.exports = Booking; 