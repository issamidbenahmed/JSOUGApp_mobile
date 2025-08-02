const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Création automatique des tables users et otps si elles n'existent pas
(async () => {
  // Table users
  const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    address VARCHAR(255),
    price VARCHAR(20),
    state VARCHAR(50),
    role ENUM('eleve', 'moniteur') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  // Table otps
  const createOtpsTable = `CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20),
    code VARCHAR(10),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  // Table password_resets
  const createPasswordResetsTable = `CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    token VARCHAR(255),
    expiresAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  // Table bookings
  const createBookingsTable = `CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eleve_id INT NOT NULL,
    moniteur_id INT NOT NULL,
    poste_id INT NOT NULL,
    date VARCHAR(20) NOT NULL,
    slot VARCHAR(20) NOT NULL,
    hour VARCHAR(20) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    commission DECIMAL(10,2) DEFAULT 10,
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    payment_method ENUM('local', 'stripe') DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eleve_id) REFERENCES users(id),
    FOREIGN KEY (moniteur_id) REFERENCES users(id),
    FOREIGN KEY (poste_id) REFERENCES postes(id)
  )`;

  // Ajout des colonnes si la table bookings existe déjà
  const addStatusColumn = `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending'`;
  const addCommissionColumn = `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission DECIMAL(10,2) DEFAULT 10`;
  const addPaymentStatusColumn = `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid'`;
  const addPaymentMethodColumn = `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method ENUM('local', 'stripe') DEFAULT NULL`;

  // Ajout du champ balance à la table users
  const addBalanceColumn = `ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0`;

  // Table conversations
  const createConversationsTable = `CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message TEXT,
    last_date TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
  )`;

  // Table messages
  const createMessagesTable = `CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  )`;

  // Ajout colonne last_seen à users si manquante
  const addLastSeenColumn = `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP NULL DEFAULT NULL`;

  // Table transactions
  const createTransactionsTable = `CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moniteur_id INT NOT NULL,
    type ENUM('recharge', 'commission') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    FOREIGN KEY (moniteur_id) REFERENCES users(id)
  )`;

  try {
    const conn = await pool.getConnection();
    await conn.query(createUsersTable);
    await conn.query(createOtpsTable);
    await conn.query(createPasswordResetsTable);
    await conn.query(createBookingsTable);
    await conn.query(addStatusColumn);
    await conn.query(addCommissionColumn);
    await conn.query(addPaymentStatusColumn);
    await conn.query(addPaymentMethodColumn);
    await conn.query(addBalanceColumn);
    await conn.query(createConversationsTable);
    await conn.query(createMessagesTable);
    await conn.query(addLastSeenColumn);
    await conn.query(createTransactionsTable);
    conn.release();
  } catch (err) {
    console.error('Erreur création tables:', err);
  }
})();

// Migration automatique de la table notifications
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        body TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    
  } catch (err) {
    console.error('Erreur migration notifications:', err);
  }
})();

module.exports = pool; 