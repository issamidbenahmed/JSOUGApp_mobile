const { verify } = require('../utils/jwt');
const db = require('../config/db');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token);
    req.user = decoded;
    // Mettre à jour last_seen
    if (decoded && decoded.id) {
      try {
        await db.query('UPDATE users SET last_seen = NOW() WHERE id = ?', [decoded.id]);
      } catch (e) {}
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  }
  next();
}

module.exports = { authenticate, requireAdmin }; 