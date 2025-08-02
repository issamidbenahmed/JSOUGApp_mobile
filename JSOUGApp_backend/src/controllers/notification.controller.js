const Notification = require('../models/notification.model');

// Créer une notification
const createNotification = async (req, res) => {
  try {
    const { user_id, type, title, body } = req.body;
    if (!user_id || !type || !title) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    const id = await Notification.create({ user_id, type, title, body });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Lister les notifications d'un utilisateur
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const notifications = await Notification.getAllForUser(user_id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const notification_id = req.params.id;
    await Notification.markAsRead(notification_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    await Notification.markAllAsRead(user_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Fonction utilitaire pour créer une notification depuis d'autres contrôleurs
const createNotificationForUser = async ({ user_id, type, title, body }) => {
  try {
    await Notification.create({ user_id, type, title, body });
  } catch (err) {
    console.error('Erreur création notification utilitaire:', err);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationForUser
}; 