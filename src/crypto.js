const crypto = require('crypto');

// Secret interne utilisé pour le HMAC anti-triche et la dérivation
const SECRET_SALT = 'sql-master-secret-salt-2026-anti-cheat-key';

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SECRET_SALT, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash) {
  const check = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
}

// Générer un passeport chiffré (AES-256-CBC + HMAC-SHA256)
function generatePassport(userData) {
  const payload = JSON.stringify({
    username: userData.username,
    score: userData.score || 0,
    completedLevels: userData.completedLevels || [],
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SECRET_SALT, 'passport-salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const ivHex = iv.toString('hex');
  const hmac = crypto.createHmac('sha256', SECRET_SALT)
    .update(ivHex + ':' + encrypted)
    .digest('hex');

  // Format final : SQLPASS.<iv>.<encrypted>.<hmac>
  return `SQLPASS.${ivHex}.${encrypted}.${hmac}`;
}

// Valider et décoder un passeport chiffré
function decodePassport(passportString) {
  try {
    if (!passportString || !passportString.startsWith('SQLPASS.')) {
      return { valid: false, error: 'Format de clé invalide' };
    }

    const parts = passportString.split('.');
    if (parts.length !== 4) {
      return { valid: false, error: 'Structure de clé corrompue' };
    }

    const [, ivHex, encryptedHex, hmacHex] = parts;

    // Vérifier l'authenticité (HMAC anti-altération)
    const expectedHmac = crypto.createHmac('sha256', SECRET_SALT)
      .update(ivHex + ':' + encryptedHex)
      .digest('hex');

    if (expectedHmac !== hmacHex) {
      return { valid: false, error: 'Clé altérée ou invalide (signature rejetée)' };
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(SECRET_SALT, 'passport-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const data = JSON.parse(decrypted);
    return { valid: true, data };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generatePassport,
  decodePassport
};
