const fs = require('fs');
const path = require('path');
const { hashPassword, verifyPassword, generatePassport } = require('./crypto');

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
    currentLevel: 1,
    completedLevels: [],
    badges: [],
    stats: {
      totalQueries: 0,
      hintsUsed: 0
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
    return { success: false, error: "Utilisateur introuvable." };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Mot de passe incorrect." };
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

function recordUserStats(username, { queries = 0, hints = 0 }) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  if (!user.stats) {
    user.stats = { totalQueries: 0, hintsUsed: 0 };
  }
  user.stats.totalQueries = (user.stats.totalQueries || 0) + queries;
  user.stats.hintsUsed = (user.stats.hintsUsed || 0) + hints;

  saveUsers(users);
  return user;
}

function markUserLevelCompleted(username, levelId, points = 100) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  if (!user.completedLevels) user.completedLevels = [];
  if (!user.badges) user.badges = [];

  if (!user.completedLevels.includes(levelId)) {
    user.completedLevels.push(levelId);
    user.score = (user.score || 0) + points;
  }
  if (user.currentLevel <= levelId) {
    user.currentLevel = levelId + 1;
  }

  saveUsers(users);
  return user;
}

function saveUserBadges(username, badges) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  user.badges = badges;
  saveUsers(users);
  return user;
}

function getUserPassport(user) {
  return generatePassport(user);
}

module.exports = {
  loadUsers,
  registerUser,
  loginUser,
  getSessionUser,
  setSession,
  logout,
  recordUserStats,
  markUserLevelCompleted,
  saveUserBadges,
  getUserPassport
};
