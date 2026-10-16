const fs = require('fs');
const path = require('path');
const { hashPassword, verifyPassword, generatePassport, decodePassport } = require('./crypto');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const SESSION_FILE = path.join(__dirname, '..', 'data', 'session.json');

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function registerUser(username, password) {
  const users = loadUsers();
  const trimmed = username.trim();
  if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, error: "Ce nom d'utilisateur est déjà pris." };
  }

  const newUser = {
    id: Date.now().toString(),
    username: trimmed,
    passwordHash: hashPassword(password),
    score: 0,
    coins: 100, // Cadeau de bienvenue : 100 SQL Coins !
    streak: 0,
    currentLevel: 1,
    completedLevels: [],
    badges: [],
    unlockedThemes: ['cyberpunk'],
    activeTheme: 'cyberpunk',
    hintTokens: 1, // 1 jeton d'indice gratuit offert
    stats: {
      totalQueries: 0,
      hintsUsed: 0,
      coursesRead: []
    },
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  setSession(newUser.username);
  return { success: true, user: newUser };
}

function loginUser(username, password) {
  const users = loadUsers();
  const trimmed = username.trim();
  const user = users.find(u => u.username.toLowerCase() === trimmed.toLowerCase());
  if (!user) {
    return { success: false, error: 'Utilisateur introuvable.' };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: 'Mot de passe incorrect.' };
  }

  setSession(user.username);
  return { success: true, user };
}

function getSessionUser() {
  ensureDataDir();
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    const raw = fs.readFileSync(SESSION_FILE, 'utf-8');
    const { username } = JSON.parse(raw);
    const users = loadUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  } catch (e) {
    return null;
  }
}

function setSession(username) {
  ensureDataDir();
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ username }), 'utf-8');
}

function logout() {
  ensureDataDir();
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE);
  }
}

function updateUserProfile(username, updaterFn) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  updaterFn(user);
  saveUsers(users);
  return user;
}

function recordUserStats(username, { queries = 0, hints = 0, resetStreak = false }) {
  return updateUserProfile(username, user => {
    if (!user.stats) user.stats = { totalQueries: 0, hintsUsed: 0, coursesRead: [] };
    user.stats.totalQueries = (user.stats.totalQueries || 0) + queries;
    user.stats.hintsUsed = (user.stats.hintsUsed || 0) + hints;
    if (resetStreak) {
      user.streak = 0;
    }
  });
}

function markUserLevelCompleted(username, levelId, { basePoints = 100, firstTry = false, isBoss = false } = {}) {
  return updateUserProfile(username, user => {
    if (!user.completedLevels) user.completedLevels = [];
    if (!user.badges) user.badges = [];

    if (firstTry) {
      user.streak = (user.streak || 0) + 1;
    }

    const comboMultiplier = (user.streak || 0) >= 3 ? 1.5 : 1;
    const bossMultiplier = isBoss ? 2 : 1;
    const firstTryBonus = firstTry ? 50 : 0;
    const earnedPoints = Math.round((basePoints + firstTryBonus) * comboMultiplier * bossMultiplier);
    const earnedCoins = isBoss ? 150 : (firstTry ? 75 : 50);

    if (!user.completedLevels.includes(levelId)) {
      user.completedLevels.push(levelId);
      user.score = (user.score || 0) + earnedPoints;
      user.coins = (user.coins || 0) + earnedCoins;
      user._lastReward = { earnedPoints, earnedCoins, comboMultiplier, firstTryBonus };
    } else {
      user._lastReward = { earnedPoints: 0, earnedCoins: 0, alreadyCompleted: true };
    }

    if (user.currentLevel <= levelId) {
      user.currentLevel = levelId + 1;
    }
  });
}

function saveUserBadges(username, badges) {
  return updateUserProfile(username, user => {
    user.badges = badges;
  });
}

function getUserPassport(user) {
  return generatePassport(user);
}

function importUserPassport(username, passportString) {
  const decoded = decodePassport(passportString);
  if (!decoded.valid) {
    return { success: false, error: decoded.error };
  }
  const updated = updateUserProfile(username, user => {
    user.score = Math.max(user.score || 0, decoded.data.score || 0);
    const merged = new Set([...(user.completedLevels || []), ...(decoded.data.completedLevels || [])]);
    user.completedLevels = Array.from(merged).sort((a, b) => a - b);
    user.currentLevel = Math.max(user.currentLevel || 1, user.completedLevels.length + 1);
  });
  return { success: true, user: updated };
}

module.exports = {
  loadUsers,
  registerUser,
  loginUser,
  getSessionUser,
  setSession,
  logout,
  updateUserProfile,
  recordUserStats,
  markUserLevelCompleted,
  saveUserBadges,
  getUserPassport,
  importUserPassport
};
