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
router.get('/booking/check', authenticate, moniteurController.checkBookingSlot);
router.post('/booking', authenticate, moniteurController.createBooking);
router.post('/messages/start', authenticate, moniteurController.startConversation);
router.get('/messages/conversations', authenticate, moniteurController.getConversations);
router.get('/messages/:conversationId', authenticate, moniteurController.getMessages);
router.post('/messages/:conversationId', authenticate, moniteurController.sendMessage);
router.get('/user-status/:userId', authenticate, moniteurController.getUserStatus);
router.delete('/postes/:id', authenticate, moniteurController.deletePoste);

module.exports = router; 