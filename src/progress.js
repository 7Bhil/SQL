const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'progress.json');

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {
      currentLevel: 1,
      completedLevels: []
    };
  }
  try {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      currentLevel: 1,
      completedLevels: []
    };
  }
}

function saveProgress(progress) {
  const dir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

function markCompleted(levelId) {
  const p = loadProgress();
  if (!p.completedLevels.includes(levelId)) {
    p.completedLevels.push(levelId);
  }
  if (p.currentLevel <= levelId) {
    p.currentLevel = levelId + 1;
  }
  saveProgress(p);
}

function resetProgress() {
  saveProgress({ currentLevel: 1, completedLevels: [] });
}

module.exports = {
  loadProgress,
  saveProgress,
  markCompleted,
  resetProgress
};
