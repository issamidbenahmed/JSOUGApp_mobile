const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);
router.post('/request-password-reset', auth.requestPasswordReset);
router.post('/update-role', auth.updateUserRole);
router.get('/me', authenticate, auth.me);

// Debug endpoint to check user data directly
router.get('/debug-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const db = require('../config/db');
    
    // First, let's check the table structure
    const [tableInfo] = await db.query('DESCRIBE users');
    console.log('Table structure:', tableInfo);
    
    // Now get the user data
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.json({ error: 'User not found' });
    }
    
    const user = rows[0];
    res.json({
      user: user,
      isvalidated_raw: user.isvalidated,
      isvalidated_type: typeof user.isvalidated,
      isvalidated_parsed: parseInt(user.isvalidated),
      all_fields: Object.keys(user),
      table_structure: tableInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 