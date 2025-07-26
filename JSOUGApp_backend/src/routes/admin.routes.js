const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/moniteurs', authenticate, requireAdmin, adminController.getAllMoniteurs);
router.patch('/moniteurs/:id/validate', authenticate, requireAdmin, adminController.validateMoniteur);
router.get('/balance', authenticate, requireAdmin, adminController.getBalance);
router.get('/bookings', authenticate, requireAdmin, adminController.getAllBookings);
router.get('/transactions', authenticate, requireAdmin, adminController.getAllTransactions);

module.exports = router; 