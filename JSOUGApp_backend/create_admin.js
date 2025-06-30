const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

async function createAdmin() {
  const fullName = 'Admin';
  const email = 'admin@example.com';
  const password = 'admin123'; // Change ce mot de passe après la première connexion !
  const address = '';
  const price = '';
  const state = '';
  const role = 'admin';

  const exists = await User.findByEmail(email);
  if (exists) {
    console.log('Un admin avec cet email existe déjà.');
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const id = await User.create({ fullName, email, password: hash, address, price, state, role });
  console.log('Admin créé avec succès, id:', id);
}

createAdmin().then(() => process.exit()); 