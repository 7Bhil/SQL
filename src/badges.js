const RANKS = [
  { minScore: 0, code: 'F', title: 'Stagiaire Data 🐣' },
  { minScore: 300, code: 'E', title: 'Apprenti Requêtes 📘' },
  { minScore: 800, code: 'D', title: 'Analyste Junior 🔍' },
  { minScore: 1500, code: 'C', title: 'Ingénieur Base de Données 🛠️' },
  { minScore: 2500, code: 'B', title: 'Maître des Jointures 🔗' },
  { minScore: 3500, code: 'A', title: 'Architecte DBA Senior 🏛️' },
  { minScore: 4500, code: 'S', title: 'Dieu Vivant du SQL 🐉' }
];

const THEMES = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Néon 🌆 (Par défaut)',
    price: 0,
    primary: '#00D2FF',
    secondary: '#FF007F',
    accent: '#FFD700'
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Hacker 🟢',
    price: 300,
    primary: '#00FF41',
    secondary: '#008F11',
    accent: '#ADFF2F'
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Dark 🧛',
    price: 500,
    primary: '#BD93F9',
    secondary: '#FF79C6',
    accent: '#50FA7B'
  },
  gold: {
    id: 'gold',
    name: 'Empereur Gold 👑',
    price: 1000,
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FFFFFF'
  }
};

const BADGES = [
  {
    id: 'first_step',
    name: 'Premier Pas SQL 🐣',
    description: 'Avoir réussi son tout premier exercice.'
  },
  {
    id: 'scholar',
    name: 'Rat de Bibliothèque 📚',
    description: 'Avoir étudié un chapitre complet dans l\'Académie SQL.'
  },
  {
    id: 'where_ninja',
    name: 'Ninja du Filtrage 🔍',
    description: 'Avoir complété tous les niveaux de filtrage (1 à 8).'
  },
  {
    id: 'join_master',
    name: 'Maître des Jointures 🔗',
    description: 'Avoir dompté INNER JOIN et LEFT JOIN (niveaux 14 à 16).'
  },
  {
    id: 'combo_king',
    name: 'Roi du Combo 🔥',
    description: 'Atteindre une série (Streak) de 3 victoires du premier coup sans erreur.'
  },
  {
    id: 'speed_demon',
    name: 'Éclair de Génie ⚡',
    description: 'Avoir résolu un exercice en moins de 10 secondes.'
  },
  {
    id: 'proc_wizard',
    name: 'Sorcier des Procédures 🧙‍♂️',
    description: 'Avoir maîtrisé les Triggers et Procédures Stockées (niveaux 29 à 35).'
  },
  {
    id: 'sql_grandmaster',
    name: 'Grand Maître SQL 👑',
    description: 'Avoir complété l\'intégralité des 35 niveaux de A à Z !'
  }
];

function getUserRank(score = 0) {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.minScore) {
      current = r;
    }
  }
  return current;
}

function checkAndAwardBadges(user, currentExerciseId, solveTimeSeconds) {
  if (!user.badges) user.badges = [];
  const newlyAwarded = [];

  function grant(badgeId) {
    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      const b = BADGES.find(x => x.id === badgeId);
      if (b) newlyAwarded.push(b);
    }
  }

  const completed = user.completedLevels || [];

  if (completed.length >= 1) {
    grant('first_step');
  }

  if ([1, 2, 3, 4, 5, 6, 7, 8].every(lvl => completed.includes(lvl))) {
    grant('where_ninja');
  }

  if ([14, 15, 16].every(lvl => completed.includes(lvl))) {
    grant('join_master');
  }

  if ((user.streak || 0) >= 3) {
    grant('combo_king');
  }

  if (solveTimeSeconds !== null && solveTimeSeconds <= 10) {
    grant('speed_demon');
  }

  if ([29, 30, 33, 34, 35].every(lvl => completed.includes(lvl))) {
    grant('proc_wizard');
  }

  if (completed.length >= 35) {
    grant('sql_grandmaster');
  }

  return newlyAwarded;
}

module.exports = {
  RANKS,
  THEMES,
  BADGES,
  getUserRank,
  checkAndAwardBadges
};
