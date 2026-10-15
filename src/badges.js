const BADGES = [
  {
    id: 'first_step',
    name: 'Premier Pas SQL 🐣',
    description: 'Avoir réussi son premier exercice.'
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
    id: 'speed_demon',
    name: 'Éclair de Génie ⚡',
    description: 'Avoir résolu un exercice en moins de 10 secondes.'
  },
  {
    id: 'sql_grandmaster',
    name: 'Grand Maître SQL 👑',
    description: 'Avoir complété l\'intégralité des 25 niveaux de A à Z !'
  }
];

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

  // 1. Premier pas
  if (user.completedLevels && user.completedLevels.length >= 1) {
    grant('first_step');
  }

  // 2. Ninja du filtrage
  const filterLevels = [1, 2, 3, 4, 5, 6, 7, 8];
  if (filterLevels.every(lvl => user.completedLevels.includes(lvl))) {
    grant('where_ninja');
  }

  // 3. Maître des jointures
  const joinLevels = [14, 15, 16];
  if (joinLevels.every(lvl => user.completedLevels.includes(lvl))) {
    grant('join_master');
  }

  // 4. Éclair de génie
  if (solveTimeSeconds !== null && solveTimeSeconds <= 10) {
    grant('speed_demon');
  }

  // 5. Grand maître
  if (user.completedLevels && user.completedLevels.length >= 25) {
    grant('sql_grandmaster');
  }

  return newlyAwarded;
}

module.exports = {
  BADGES,
  checkAndAwardBadges
};
