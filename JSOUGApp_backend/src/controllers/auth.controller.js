const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const { sendMail } = require('../utils/mailer');
const { sendSms } = require('../utils/sms');
const { sign } = require('../utils/jwt');
const db = require('../config/db');
const crypto = require('crypto');

function randomOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

exports.register = async (req, res) => {
  const { fullName, email, password, address, price, state, role } = req.body;
  if (!fullName || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  const exists = await User.findByEmail(email);
  if (exists) return res.status(409).json({ error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const id = await User.create({ fullName, email, password: hash, address, price, state, role });
  res.json({ id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
};

exports.sendOtp = async (req, res) => {
  console.log('--- sendOtp called ---');
  console.log('Request body:', req.body);
  const { phone } = req.body;
  const code = randomOTP();
  console.log('Generated OTP code:', code, 'for phone:', phone);
  try {
    await OTP.create(phone, code);
    console.log('OTP inserted in DB:', phone, code);
    const sms = await sendSms(phone, `Votre code OTP est : ${code}`);
    console.log('Twilio SMS response:', sms);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Error in sendOtp:', err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  const valid = await OTP.verify(phone, code);
  if (!valid) return res.status(400).json({ error: 'Invalid or expired OTP' });
  //await OTP.delete(phone);
  res.json({ message: 'OTP verified' });
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min
  try {
    const [result] = await db.query('INSERT INTO password_resets (email, token, expiresAt) VALUES (?, ?, ?)', [email, token, expiresAt]);
    console.log('Password reset insert result:', result);
    // For web testing:
    const resetLink = `http://localhost:8081/reset-password?token=${token}`;
    // For mobile (Expo), use:
    // const resetLink = `jsougapp://reset-password?token=${token}`;
    await sendMail(email, 'Password Reset', `Click this link to reset your password: ${resetLink}`);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Erreur lors de l\'insertion password reset:', err);
    res.status(500).json({ error: 'Failed to create password reset', details: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const [rows] = await db.query('SELECT * FROM password_resets WHERE token = ? AND expiresAt > NOW()', [token]);
  if (!rows.length) return res.status(400).json({ error: 'Invalid or expired token' });
  const email = rows[0].email;
  const hash = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
  //await db.query('DELETE FROM password_resets WHERE token = ?', [token]);
  res.json({ message: 'Password updated' });
}; 