const express = require('express');
const router = express.Router();
const moniteurController = require('../controllers/moniteur.controller');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, moniteurController.getMoniteurProfile);
router.patch('/profile', authenticate, moniteurController.uploadAvatar, moniteurController.updateMoniteurProfile);
router.patch('/change-password', authenticate, moniteurController.changePassword);
router.get('/details', authenticate, moniteurController.getMoniteurDetails);
router.patch('/details', authenticate, moniteurController.updateMoniteurDetails);
router.post('/car-photo', authenticate, moniteurController.uploadCarPhoto);
router.post('/certificate', authenticate, moniteurController.uploadCertificate);
router.post('/postes', authenticate, moniteurController.createPoste);
router.get('/postes', authenticate, moniteurController.getMyPostes);
router.get('/all-postes', moniteurController.getAllPostes);

module.exports = router; 