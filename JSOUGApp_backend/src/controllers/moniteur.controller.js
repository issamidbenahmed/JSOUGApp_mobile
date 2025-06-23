const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'avatar_' + req.user.id + '_' + Date.now() + ext);
  },
});
const upload = multer({ storage });
exports.uploadAvatar = upload.single('avatar');

exports.getMoniteurProfile = async (req, res) => {
  const moniteurId = req.user.id; // assuming JWT middleware sets req.user
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [moniteurId]);
    if (!rows.length) return res.status(404).json({ error: 'Moniteur not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMoniteurProfile = async (req, res) => {
  const moniteurId = req.user.id;
  const { fullName, description, email, phone, address, password } = req.body;
  try {
    console.log('--- updateMoniteurProfile called ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const fields = [];
    const values = [];
    if (fullName !== undefined) { fields.push('fullName = ?'); values.push(fullName); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }
    if (password !== undefined) { fields.push('password = ?'); values.push(password); }
    // Handle avatar upload
    if (req.file) {
      const avatarPath = '/uploads/' + req.file.filename;
      fields.push('avatar = ?');
      values.push(avatarPath);
      console.log('Avatar path to save:', avatarPath);
    }
    if (!fields.length) {
      console.log('No fields to update');
      return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(moniteurId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    console.log('SQL:', sql);
    console.log('Values:', values);
    const result = await db.query(sql, values);
    console.log('DB result:', result);
    res.json({ message: 'Profile updated', avatar: req.file ? '/uploads/' + req.file.filename : undefined });
  } catch (err) {
    console.error('Error in updateMoniteurProfile:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 