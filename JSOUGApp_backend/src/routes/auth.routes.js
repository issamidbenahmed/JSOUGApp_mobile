const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);
router.post('/request-password-reset', auth.requestPasswordReset);
router.post('/update-role', auth.updateUserRole);

module.exports = router; 