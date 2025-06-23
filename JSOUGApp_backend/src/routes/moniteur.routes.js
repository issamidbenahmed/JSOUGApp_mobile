const express = require('express');
const router = express.Router();
const moniteurController = require('../controllers/moniteur.controller');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, moniteurController.getMoniteurProfile);
router.patch('/profile', authenticate, moniteurController.uploadAvatar, moniteurController.updateMoniteurProfile);

module.exports = router; 