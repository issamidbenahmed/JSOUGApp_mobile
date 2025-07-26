const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const moniteurRoutes = require('./routes/moniteur.routes');
const adminRoutes = require('./routes/admin.routes');
const path = require('path');

const app = express();
app.use(cors());
// Stripe webhook doit recevoir le body brut
app.use('/api/moniteur/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/moniteur', moniteurRoutes);
app.use('/api/admin', adminRoutes);
console.log('Serving uploads from:', path.join(__dirname, '../uploads'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app; 