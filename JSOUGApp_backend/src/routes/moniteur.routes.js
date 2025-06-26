const express = require('express');
const router = express.Router();
const moniteurController = require('../controllers/moniteur.controller');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, moniteurController.getMoniteurProfile);
router.patch('/profile', authenticate, moniteurController.uploadAvatar, moniteurController.updateMoniteurProfile);
router.patch('/change-password', authenticate, moniteurController.changePassword);
router.get('/details', authenticate, moniteurController.getMoniteurDetails);
router.post('/car-photo', authenticate, moniteurController.uploadCarPhoto);
router.delete('/car-photo/:id', authenticate, moniteurController.deleteCarPhoto);
router.post('/certificate', authenticate, moniteurController.uploadCertificate);
router.delete('/certificate/:id', authenticate, moniteurController.deleteCertificate);

module.exports = router; 