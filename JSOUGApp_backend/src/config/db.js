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

  try {
    const conn = await pool.getConnection();
    await conn.query(createUsersTable);
    await conn.query(createOtpsTable);
    await conn.query(createPasswordResetsTable);
    conn.release();
  } catch (err) {
    console.error('Erreur création tables:', err);
  }
})();

module.exports = pool; 