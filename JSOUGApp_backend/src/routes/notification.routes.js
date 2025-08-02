const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

console.log('DEBUG createNotification:', typeof createNotification, createNotification);

// Créer une notification (optionnel, surtout pour tests ou admin)
router.post('/', authenticate, createNotification);

// Lister les notifications de l'utilisateur connecté
router.get('/', authenticate, getNotifications);

// Marquer une notification comme lue
router.patch('/:id/read', authenticate, markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/read-all', authenticate, markAllAsRead);

module.exports = router; 