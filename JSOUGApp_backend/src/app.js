const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const moniteurRoutes = require('./routes/moniteur.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const googleAuthRoutes = require('./routes/googleAuth.routes');
const path = require('path');

const app = express();

// Configure CORS for development
const corsOptions = {
  origin: [
    'http://localhost:19006',  // Expo web default
    'http://localhost:3000',   // Common React dev server
    'http://localhost:5000',   // Your backend port
    'http://localhost:8080',   // Common alternative port
    'http://localhost:8081',   // React Native development server
    'http://10.0.2.2:8081',    // Android emulator to localhost
    'exp://127.0.0.1:19000'    // Expo client
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Stripe webhook doit recevoir le body brut
app.use('/api/moniteur/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/moniteur', moniteurRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/google-auth', googleAuthRoutes);
console.log('Serving uploads from:', path.join(__dirname, '../uploads'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app;