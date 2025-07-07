# JSOUGApp Backend

## Installation

```bash
npm install
cp .env.example .env
# Modifie .env avec tes infos MySQL et email
```

## Lancer le serveur

```bash
npm run dev
```

## Endpoints principaux

- `POST /api/auth/register` — Inscription (avec rôle)
- `POST /api/auth/login` — Connexion (JWT)
- `POST /api/auth/send-otp` — Envoi OTP par email
- `POST /api/auth/verify-otp` — Vérification OTP
- `POST /api/auth/reset-password` — Réinitialisation du mot de passe
- `POST /api/moniteur/postes` — Créer une offre/poste (moniteur)
- `GET /api/moniteur/postes` — Lister les offres/postes du moniteur

## Exemple de .env

```
DB_HOST=localhost
DB_USER=root
DB_PASS=motdepasse
DB_NAME=jsougapp
JWT_SECRET=unsecretfort
MAIL_USER=tonemail@gmail.com
MAIL_PASS=tonmdpapp
```

## Exemple de tables MySQL

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  address VARCHAR(255),
  price VARCHAR(20),
  state VARCHAR(50),
  role ENUM('eleve', 'moniteur') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  code VARCHAR(10),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE postes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  moniteur_id INT NOT NULL,
  price VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moniteur_id) REFERENCES users(id) ON DELETE CASCADE
);
``` 