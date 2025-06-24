const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const moniteurRoutes = require('./routes/moniteur.routes');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/moniteur', moniteurRoutes);
console.log('Serving uploads from:', path.join(__dirname, '../uploads'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app; 