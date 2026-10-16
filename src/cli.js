#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const exercises = require('./exercises');
const courses = require('./courses');
const { createDatabase, executeQuery, inspectDatabaseTables, compareResults } = require('./db');
const { renderTable, renderProgressBar } = require('./formatter');
const {
  getSessionUser,
  registerUser,
  loginUser,
  logout,
  updateUserProfile,
  recordUserStats,
  markUserLevelCompleted,
  saveUserBadges,
  getUserPassport,
  importUserPassport
} = require('./auth');
const { BADGES, THEMES, getUserRank, checkAndAwardBadges } = require('./badges');
const { promptSqlQuery } = require('./prompt');

const SANDBOX_PASSWORD = '0000';

function clearScreen() {
  console.clear();
}

function getThemeColors(user) {
  const themeId = user && user.activeTheme && THEMES[user.activeTheme] ? user.activeTheme : 'cyberpunk';
  return THEMES[themeId];
}

function printHeader(currentUser = null) {
  const theme = getThemeColors(currentUser);
  console.log(
    chalk.bold.hex(theme.primary)(`
╔═════════════════════════════════════════════════════════════════════╗
║               🏆 SQL MASTER : ULTIMATE ACADEMY & RPG 🏆             ║
║        Cours interactifs, 35 Niveaux A-Z, Triggers & Procédures     ║
╚═════════════════════════════════════════════════════════════════════╝`)
  );
  if (currentUser) {
    const rank = getUserRank(currentUser.score || 0);
    const badgesCount = currentUser.badges ? currentUser.badges.length : 0;
    const streakStr = (currentUser.streak || 0) > 0 ? chalk.hex('#FF4500').bold(`🔥x${currentUser.streak}`) : chalk.gray('0');
    console.log(
      chalk.white(' 👤 ') +
        chalk.green.bold(currentUser.username) +
        chalk.white(` [Rang ${rank.code}: ${rank.title}]`) +
        chalk.white(' | ⭐ ') +
        chalk.yellow.bold(`${currentUser.score || 0} XP`) +
        chalk.white(' | 💰 ') +
        chalk.hex('#FFD700').bold(`${currentUser.coins || 0} Coins`) +
        chalk.white(' | Combo: ') +
        streakStr +
        chalk.white(' | 🏅 ') +
        chalk.magenta.bold(`${badgesCount}/${BADGES.length}\n`)
    );
  } else {
    console.log(chalk.gray(' Non connecté (Mode Invité / Accès Sandbox disponible)\n'));
  }
}

async function waitKey(msg = 'Appuyez sur Entrée pour continuer...') {
  await inquirer.prompt([{ type: 'input', name: 'press', message: chalk.gray(msg) }]);
}

// -------------------------------------------------------------
// ÉCRAN DE DÉPART (AUTH / SANDBOX)
// -------------------------------------------------------------
async function authGate() {
  let user = getSessionUser();
  if (user) {
    return user;
  }

  while (!user) {
    clearScreen();
    printHeader(null);

    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Bienvenue dans SQL Master ! Que souhaitez-vous faire ?',
        choices: [
          { name: '🔑 Se connecter à mon compte', value: 'login' },
          { name: '👤 Créer un nouveau compte joueur (+100 Coins offerts !)', value: 'register' },
          { name: '📚 Explorer l\'Académie SQL (Cours gratuits de A à Z)', value: 'academy_guest' },
          { name: '🔓 Mode Sandbox (Débloquer les 35 niveaux - Code 0000)', value: 'sandbox' },
          { name: '🚪 Quitter', value: 'exit' }
        ]
      }
    ]);

    if (choice === 'exit') {
      console.log(chalk.cyan('\nÀ bientôt sur SQL Master ! 💪\n'));
      process.exit(0);
    }

    if (choice === 'academy_guest') {
      await showAcademyMenu();
      continue;
    }

    if (choice === 'sandbox') {
      const { pwd } = await inquirer.prompt([
        {
          type: 'password',
          name: 'pwd',
          message: 'Entrez le code secret du Mode Sandbox :',
          mask: '*'
        }
      ]);

      if (pwd === SANDBOX_PASSWORD) {
        console.log(chalk.green('\n✔ Accès Sandbox accordé ! Les 35 niveaux sont ouverts.'));
        await waitKey();
        await runSandboxMode();
      } else {
        console.log(chalk.red('\n❌ Mot de passe incorrect !'));
        await waitKey();
      }
      continue;
    }

    if (choice === 'register') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: "Choisissez votre pseudo de joueur :",
          validate: v => (v.trim().length >= 3 ? true : 'Au moins 3 caractères requis.')
        },
        {
          type: 'password',
          name: 'password',
          message: 'Choisissez un mot de passe :',
          mask: '*',
          validate: v => (v.length >= 4 ? true : 'Au moins 4 caractères requis.')
        }
      ]);

      const res = registerUser(answers.username, answers.password);
      if (res.success) {
        console.log(chalk.green(`\n🎉 Compte créé ! Bienvenue ${res.user.username} (+100 SQL Coins & 1 Jeton d'indice offerts) !`));
        await waitKey();
        user = res.user;
      } else {
        console.log(chalk.red(`\n❌ Erreur : ${res.error}`));
        await waitKey();
      }
    }

    if (choice === 'login') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: "Nom d'utilisateur :"
        },
        {
          type: 'password',
          name: 'password',
          message: 'Mot de passe :',
          mask: '*'
        }
      ]);

      const res = loginUser(answers.username, answers.password);
      if (res.success) {
        console.log(chalk.green(`\n✔ Connexion réussie ! Bon retour, ${res.user.username} !`));
        await waitKey();
        user = res.user;
      } else {
        console.log(chalk.red(`\n❌ ${res.error}`));
        await waitKey();
      }
    }
  }

  return user;
}

// -------------------------------------------------------------
// MENU PRINCIPAL (COMPTE ACTIF)
// -------------------------------------------------------------
async function showMainMenu() {
  const user = await authGate();
  clearScreen();
  printHeader(user);

  const total = exercises.length;
  const done = user.completedLevels ? user.completedLevels.length : 0;
  const progressBar = renderProgressBar(done, total, 28);

  console.log(chalk.white(`Progression Aventure : `) + progressBar + chalk.green.bold(` (${done}/${total} niveaux)`));
  console.log(chalk.gray('─────────────────────────────────────────────────────────────────────\n'));

  const currentLvl = Math.min(user.currentLevel || 1, total);
  const currentEx = exercises.find(e => e.id === currentLvl);
  const nextLabel = currentEx && currentEx.isBoss ? `👹 AFFRONTER LE BOSS (Niveau ${currentLvl})` : `▶  Continuer l'Aventure (Niveau ${currentLvl})`;

  const choices = [
    { name: chalk.bold.green(nextLabel), value: 'continue' },
    { name: `📚 Académie SQL Interactive (10 Chapitres de Cours + Exemples Live)`, value: 'academy' },
    { name: `📋 Carte des 35 Niveaux (SELECT ➔ JOIN ➔ Triggers ➔ Procédures Stockées)`, value: 'list' },
    { name: `⚡ Mode Contre-la-Montre (Time Attack 60s - Gagnez des Coins !)`, value: 'time_attack' },
    { name: `🛒 Boutique RPG & Thèmes Visuels (${user.coins || 0} Coins disponibles)`, value: 'shop' },
    { name: `👤 Mon Profil, Trophées & Passeport Chiffré Leaderboard`, value: 'profile' },
    { name: `🔓 Mode Sandbox (Tester n'importe quel niveau - Code 0000)`, value: 'sandbox' },
    { name: `🚪 Se déconnecter`, value: 'logout' },
    { name: `❌ Quitter`, value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Menu Principal :',
      choices,
      pageSize: 12
    }
  ]);

  switch (answer.action) {
    case 'continue':
      await startExercise(currentLvl, false);
      break;
    case 'academy':
      await showAcademyMenu();
      break;
    case 'list':
      await showExerciseList(false);
      break;
    case 'time_attack':
      await startTimeAttackMode();
      break;
    case 'shop':
      await showShopMenu();
      break;
    case 'profile':
      await showProfile();
      break;
    case 'sandbox': {
      const { pwd } = await inquirer.prompt([
        {
          type: 'password',
          name: 'pwd',
          message: 'Entrez le code secret Sandbox (0000) :',
          mask: '*'
        }
      ]);
      if (pwd === SANDBOX_PASSWORD) {
        await runSandboxMode();
      } else {
        console.log(chalk.red('\n❌ Mot de passe incorrect !'));
        await waitKey();
        await showMainMenu();
      }
      break;
    }
    case 'logout':
      logout();
      console.log(chalk.yellow('\nDéconnexion réussie.'));
      await waitKey();
      await showMainMenu();
      break;
    case 'exit':
      console.log(chalk.cyan('\nÀ bientôt sur SQL Master ! 💪\n'));
      process.exit(0);
  }
}

// -------------------------------------------------------------
// 📚 ACADÉMIE SQL INTERACTIVE (COURS COMPLETS)
// -------------------------------------------------------------
async function showAcademyMenu() {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  console.log(chalk.bgHex('#004488').white.bold(' 📚 ACADÉMIE SQL : APPRENEZ DE ZÉRO JUSQU\'AUX PROCÉDURES STOCKÉES '));
  console.log(chalk.gray('Chaque chapitre contient des explications illustrées, un exemple exécutable et des exercices dédiés.\n'));

  const readList = (user && user.stats && user.stats.coursesRead) || [];

  const choices = courses.map(c => {
    const isRead = readList.includes(c.id);
    const badge = isRead ? chalk.green('✔ [Lu]') : chalk.yellow('📘 [Cours]');
    return {
      name: `${badge} ${chalk.bold(c.title)} ${chalk.gray(`(Niveaux ${c.levels.join(', ')})`)}`,
      value: c.id
    };
  });

  choices.push(new inquirer.Separator());
  choices.push({ name: '⬅ Retour au menu principal', value: 'back' });

  const { selectedCourse } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCourse',
      message: 'Choisissez un chapitre à étudier :',
      choices,
      pageSize: 14
    }
  ]);

  if (selectedCourse === 'back') {
    if (user) return showMainMenu();
    return;
  }

  await displayCourseDetail(selectedCourse);
}

async function displayCourseDetail(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return showAcademyMenu();

  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  console.log(chalk.cyan(course.content));

  // Marquer le cours comme lu et donner un petit bonus + badge éventuel
  if (user) {
    updateUserProfile(user.username, u => {
      if (!u.stats) u.stats = { totalQueries: 0, hintsUsed: 0, coursesRead: [] };
      if (!u.stats.coursesRead) u.stats.coursesRead = [];
      if (!u.stats.coursesRead.includes(course.id)) {
        u.stats.coursesRead.push(course.id);
        u.coins = (u.coins || 0) + 25;
      }
      if (!u.badges) u.badges = [];
      if (!u.badges.includes('scholar')) {
        u.badges.push('scholar');
      }
    });
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Que souhaitez-vous faire avec ce chapitre ?',
      choices: [
        { name: '▶ Exécuter la démo interactive de ce cours en direct', value: 'demo' },
        { name: `⚔️ S'entraîner sur le 1er exercice de ce chapitre (Niveau ${course.levels[0]})`, value: 'practice' },
        { name: '📚 Retour à la liste des chapitres', value: 'back' }
      ]
    }
  ]);

  if (action === 'demo') {
    console.log(chalk.yellow.bold('\n⚡ EXÉCUTION DE LA DÉMO EN DIRECT :'));
    const db = await createDatabase(course.exampleSetup);
    const tables = inspectDatabaseTables(db);
    for (const t of tables) {
      console.log(chalk.blue.bold(`\nTable initiale : ${t.name}`));
      console.log(renderTable(t.columns, t.values, 5));
    }
    console.log(chalk.green.bold(`\nRequête exécutée :\n`) + chalk.white(course.exampleQuery));
    const res = executeQuery(db, course.exampleQuery);
    console.log(chalk.cyan.bold(`\nRésultat obtenu :`));
    console.log(renderTable(res.columns, res.values, 10));
    console.log('');
    await waitKey();
    return displayCourseDetail(courseId);
  }

  if (action === 'practice') {
    const targetLevel = course.levels[0];
    const isSandbox = !user || targetLevel > (user.currentLevel || 1);
    return startExercise(targetLevel, isSandbox);
  }

  return showAcademyMenu();
}

// -------------------------------------------------------------
// 🛒 BOUTIQUE RPG & THÈMES VISUELS
// -------------------------------------------------------------
async function showShopMenu() {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  console.log(chalk.bgHex('#660066').white.bold(' 🛒 BOUTIQUE SQL MASTER : DÉPENSEZ VOS SQL COINS '));
  console.log(chalk.yellow(`💰 Votre solde actuel : ${user.coins || 0} SQL Coins | 💡 Jetons d'indice sans pénalité : ${user.hintTokens || 0}\n`));

  const unlocked = user.unlockedThemes || ['cyberpunk'];
  const choices = [
    {
      name: `💡 Acheter 1 Jeton d'Indice Gratuit (Protège votre Combo 🔥) — ${chalk.yellow('100 Coins')}`,
      value: 'buy_hint'
    },
    new inquirer.Separator('--- 🎨 THÈMES DE TERMINAL ---')
  ];

  for (const key of Object.keys(THEMES)) {
    const t = THEMES[key];
    const isOwned = unlocked.includes(t.id);
    const isActive = user.activeTheme === t.id;
    const status = isActive
      ? chalk.green.bold('[ÉQUIPÉ]')
      : isOwned
      ? chalk.cyan('[DÉBLOQUÉ - Cliquer pour équiper]')
      : chalk.yellow(`[Prix : ${t.price} Coins]`);
    choices.push({
      name: `${chalk.hex(t.primary).bold(t.name)} ${status}`,
      value: `theme_${t.id}`
    });
  }

  choices.push(new inquirer.Separator());
  choices.push({ name: '⬅ Retour au menu principal', value: 'back' });

  const { item } = await inquirer.prompt([
    {
      type: 'list',
      name: 'item',
      message: 'Choisissez un article :',
      choices
    }
  ]);

  if (item === 'back') return showMainMenu();

  if (item === 'buy_hint') {
    if ((user.coins || 0) < 100) {
      console.log(chalk.red('\n❌ Vous n\'avez pas assez de SQL Coins (100 requis) !'));
    } else {
      updateUserProfile(user.username, u => {
        u.coins -= 100;
        u.hintTokens = (u.hintTokens || 0) + 1;
      });
      console.log(chalk.green('\n✔ 1 Jeton d\'indice acheté avec succès !'));
    }
    await waitKey();
    return showShopMenu();
  }

  if (item.startsWith('theme_')) {
    const themeId = item.replace('theme_', '');
    const themeObj = THEMES[themeId];
    if (unlocked.includes(themeId)) {
      updateUserProfile(user.username, u => {
        u.activeTheme = themeId;
      });
      console.log(chalk.green(`\n✔ Thème '${themeObj.name}' équipé !`));
    } else if ((user.coins || 0) >= themeObj.price) {
      updateUserProfile(user.username, u => {
        u.coins -= themeObj.price;
        if (!u.unlockedThemes) u.unlockedThemes = ['cyberpunk'];
        u.unlockedThemes.push(themeId);
        u.activeTheme = themeId;
      });
      console.log(chalk.green(`\n🎉 Thème '${themeObj.name}' débloqué et équipé !`));
    } else {
      console.log(chalk.red(`\n❌ Solde insuffisant (${themeObj.price} Coins requis).`));
    }
    await waitKey();
    return showShopMenu();
  }
}

// -------------------------------------------------------------
// ⚡ MODE CONTRE-LA-MONTRE (TIME ATTACK 60s)
// -------------------------------------------------------------
async function startTimeAttackMode() {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  console.log(chalk.bgHex('#CC0000').white.bold(' ⚡ MODE CONTRE-LA-MONTRE (TIME ATTACK - 60 SECONDES) ⚡ '));
  console.log(chalk.white('\nRésolvez un maximum de défis rapides en 60 secondes pour gagner des XP et des SQL Coins !'));
  console.log(chalk.gray("Tapez ':back' ou [Échap] pour abandonner.\n"));

  const { start } = await inquirer.prompt([
    { type: 'confirm', name: 'start', message: 'Êtes-vous prêt à lancer le chronomètre de 60s ?', default: true }
  ]);

  if (!start) return showMainMenu();

  const pool = exercises.slice(0, 18); // Défis rapides
  const endTime = Date.now() + 60 * 1000;
  let solvedCount = 0;

  while (Date.now() < endTime) {
    const remainingSec = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    if (remainingSec <= 0) break;

    const randomEx = pool[Math.floor(Math.random() * pool.length)];
    clearScreen();
    console.log(chalk.bgHex('#CC0000').white.bold(` ⏱️ TEMPS RESTANT : ${remainingSec}s | SCORE : ${solvedCount} résolu(s) `));
    console.log(chalk.cyan.bold(`\n🎯 Défi Express : ${randomEx.task}`));

    const previewDb = await createDatabase(randomEx.setupSql);
    const tablesInfo = inspectDatabaseTables(previewDb);
    for (const t of tablesInfo) {
      console.log(chalk.yellow.bold(`\nTable: ${t.name}`));
      console.log(renderTable(t.columns, t.values, 3));
    }
    console.log('');

    const inputResult = await promptSqlQuery('time-attack> ');
    if (inputResult.action === 'escape' || inputResult.query.trim().toLowerCase() === ':back') {
      break;
    }

    if (Date.now() >= endTime) {
      console.log(chalk.red.bold('\n⏰ DRIIIING ! Le temps est écoulé !'));
      break;
    }

    const dbExp = await createDatabase(randomEx.setupSql);
    const dbUsr = await createDatabase(randomEx.setupSql);
    const expRes = executeQuery(dbExp, randomEx.expectedQuery);
    const usrRes = executeQuery(dbUsr, inputResult.query.trim());
    const check = compareResults(expRes, usrRes, randomEx.orderMatters);

    if (check.matches) {
      solvedCount++;
      console.log(chalk.green.bold('\n✔ CORRECT ! +1 point !'));
    } else {
      console.log(chalk.red.bold(`\n❌ Raté : ${check.reason}`));
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  const bonusXp = solvedCount * 50;
  const bonusCoins = solvedCount * 40;
  console.log(chalk.yellow.bold(`\n🏁 FIN DU CONTRE-LA-MONTRE ! Vous avez résolu ${solvedCount} requête(s) !`));
  if (user && solvedCount > 0) {
    updateUserProfile(user.username, u => {
      u.score = (u.score || 0) + bonusXp;
      u.coins = (u.coins || 0) + bonusCoins;
    });
    console.log(chalk.green.bold(`🎁 Récompense : +${bonusXp} XP et +${bonusCoins} SQL Coins ajoutés à votre profil !`));
  }
  await waitKey();
  return showMainMenu();
}

// -------------------------------------------------------------
// 👤 ÉCRAN PROFIL, TROPHÉES & CLÉ PASSEPORT
// -------------------------------------------------------------
async function showProfile() {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  const rank = getUserRank(user.score || 0);
  const passport = getUserPassport(user);
  const doneCount = user.completedLevels ? user.completedLevels.length : 0;
  const stats = user.stats || { totalQueries: 0, hintsUsed: 0, coursesRead: [] };
  const userBadges = user.badges || [];

  console.log(chalk.bgHex('#223344').white.bold(' 👤 FICHE DE PROFIL & PASSEPORT JOUEUR '));
  console.log(chalk.white(` • Pseudo            : `) + chalk.cyan.bold(user.username));
  console.log(chalk.white(` • Rang RPG Actuel   : `) + chalk.magenta.bold(`[Rang ${rank.code}] ${rank.title}`));
  console.log(chalk.white(` • Expérience (XP)   : `) + chalk.yellow.bold(`${user.score || 0} XP`));
  console.log(chalk.white(` • SQL Coins 💰      : `) + chalk.hex('#FFD700').bold(`${user.coins || 0} Coins`));
  console.log(chalk.white(` • Niveaux réussis   : `) + chalk.green.bold(`${doneCount} / ${exercises.length}`));
  console.log(chalk.white(` • Chapitres étudiés : `) + chalk.cyan.bold(`${(stats.coursesRead || []).length} / ${courses.length}`));
  console.log(chalk.white(` • Requêtes tentées  : `) + chalk.blue.bold(stats.totalQueries || 0));
  console.log('\n' + chalk.gray('─'.repeat(68)) + '\n');

  console.log(chalk.hex('#FFD700').bold('🏆 TROPHÉES & BADGES DÉBLOQUÉS :'));
  for (const b of BADGES) {
    const unlocked = userBadges.includes(b.id);
    if (unlocked) {
      console.log(chalk.green.bold(`  ✔ ${b.name}`) + chalk.white(` — ${b.description}`));
    } else {
      console.log(chalk.gray(`  ○ 🔒 ${b.name} — ${b.description}`));
    }
  }
  console.log('\n' + chalk.gray('─'.repeat(68)) + '\n');

  console.log(chalk.magenta.bold('🔐 VOTRE CLÉ CHIFFRÉE ANTI-TRICHE (PASSEPORT LEADERBOARD) :'));
  console.log(chalk.yellow(passport));
  console.log('\n' + chalk.gray('─'.repeat(68)) + '\n');

  const { profileAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'profileAction',
      message: 'Options du profil :',
      choices: [
        { name: '⬅ Retour au menu principal', value: 'back' },
        { name: '📥 Importer / Restaurer une Clé Chiffrée (Passeport)', value: 'import' }
      ]
    }
  ]);

  if (profileAction === 'import') {
    const { keyStr } = await inquirer.prompt([
      { type: 'input', name: 'keyStr', message: 'Collez votre clé SQLPASS... :' }
    ]);
    const res = importUserPassport(user.username, keyStr.trim());
    if (res.success) {
      console.log(chalk.green('\n✔ Passeport vérifié et progression restaurée avec succès !'));
    } else {
      console.log(chalk.red(`\n❌ Échec : ${res.error}`));
    }
    await waitKey();
    return showProfile();
  }

  await showMainMenu();
}

// -------------------------------------------------------------
// MODE SANDBOX & CARTE DES 35 NIVEAUX
// -------------------------------------------------------------
async function runSandboxMode() {
  await showExerciseList(true);
}

async function showExerciseList(isSandbox = false) {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  if (isSandbox) {
    console.log(chalk.bgHex('#CC5500').white.bold(' 🔓 MODE SANDBOX : LES 35 NIVEAUX SONT DÉBLOQUÉS '));
    console.log(chalk.yellow('Attention : les niveaux réussis en mode Sandbox ne sont PAS sauvegardés.\n'));
  }

  const choices = exercises.map(ex => {
    const bossTag = ex.isBoss ? chalk.red.bold('👹 [BOSS] ') : '';
    if (isSandbox) {
      return {
        name: chalk.yellow(`[Niveau ${ex.id}] `) + bossTag + `${ex.title} (${chalk.cyan(ex.category)})`,
        value: ex.id
      };
    } else {
      const isDone = user.completedLevels && user.completedLevels.includes(ex.id);
      const isCurrent = user.currentLevel === ex.id;
      const badge = isDone ? chalk.green('✔ [Terminé]') : isCurrent ? chalk.yellow('▶ [En cours]') : chalk.gray('○');
      if (ex.id <= (user.currentLevel || 1)) {
        return {
          name: `${badge} Niveau ${ex.id} - ${bossTag}${chalk.bold(ex.title)} (${chalk.cyan(ex.category)})`,
          value: ex.id
        };
      } else {
        return {
          name: chalk.gray(`🔒 Niveau ${ex.id} - ${ex.title} (Bloqué)`),
          value: null,
          disabled: 'Complétez les niveaux précédents (ou utilisez le Mode Sandbox 0000)'
        };
      }
    }
  });

  choices.push(new inquirer.Separator());
  choices.push({ name: '⬅ Retour au menu', value: 'back' });

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: isSandbox ? "Choisissez n'importe quel niveau (1 à 35) :" : 'Sélectionnez un niveau :',
      choices,
      pageSize: 16
    }
  ]);

  if (answer.selected === 'back') {
    if (user) {
      await showMainMenu();
    } else {
      await authGate();
    }
  } else if (answer.selected) {
    await startExercise(answer.selected, isSandbox);
  }
}

// -------------------------------------------------------------
// ⚔️ DÉROULEMENT D'UN EXERCICE (AVEC :cours, :hint, COMBOS & BOSS)
// -------------------------------------------------------------
async function startExercise(exerciseId, isSandbox = false) {
  const exercise = exercises.find(e => e.id === exerciseId);
  if (!exercise) return showMainMenu();

  let hintIndex = 0;
  let attemptsOnThisLevel = 0;
  let running = true;
  const startTime = Date.now();
  const isBoss = Boolean(exercise.isBoss || exercise.id % 5 === 0);

  while (running) {
    clearScreen();
    const user = getSessionUser();
    printHeader(user);

    if (isSandbox) {
      console.log(chalk.bgHex('#CC5500').white.bold(` [MODE SANDBOX] NIVEAU ${exercise.id} / ${exercises.length} : ${exercise.title} `));
    } else if (isBoss) {
      console.log(chalk.bgHex('#990000').white.bold(` 👹 COMBAT DE BOSS — NIVEAU ${exercise.id} / ${exercises.length} : ${exercise.title} (XP & COINS x2 !) `));
    } else {
      console.log(chalk.bgHex('#005577').white.bold(` NIVEAU ${exercise.id} / ${exercises.length} : ${exercise.title} `));
    }
    console.log(chalk.magenta(`Catégorie : ${exercise.category}\n`));

    console.log(chalk.yellow.bold('📖 RAPPEL DE COURS :'));
    console.log(chalk.white(exercise.lesson));
    console.log('\n' + chalk.gray('─'.repeat(68)) + '\n');

    console.log(chalk.cyan.bold("🎯 MISSION DE L'EXERCICE :"));
    console.log(chalk.bold.white(exercise.task));
    console.log('\n' + chalk.gray('─'.repeat(68)) + '\n');

    const previewDb = await createDatabase(exercise.setupSql);
    const tablesInfo = inspectDatabaseTables(previewDb);

    console.log(chalk.hex('#FFA500').bold('📦 TABLES ET DONNÉES DISPONIBLES :'));
    if (tablesInfo.length === 0) {
      console.log(chalk.gray('(Aucune table pré-existante — utilisez CREATE TABLE selon la consigne)'));
    } else {
      for (const t of tablesInfo) {
        console.log(chalk.blue.bold(`\nTable: `) + chalk.yellow.bold(t.name));
        console.log(renderTable(t.columns, t.values, 5));
      }
    }
    console.log('\n' + chalk.gray('─'.repeat(68)));

    console.log(chalk.italic.gray("Navigation : [Échap] ou ':back' = Retour | Flèches ⬆/⬇ = Historique | Entrée = Ligne suivante | ';' = Exécuter"));
    console.log(chalk.italic.gray("Commandes  : ':cours' = Ouvrir le chapitre complet | ':hint' = Indice | ':solution' = Réponse\n"));

    const inputResult = await promptSqlQuery('sql> ');

    if (inputResult.action === 'escape' || inputResult.query.trim().toLowerCase() === ':back') {
      running = false;
      if (isSandbox) {
        await showExerciseList(true);
      } else {
        await showMainMenu();
      }
      return;
    }

    const trimmed = inputResult.query.trim();

    if (trimmed.toLowerCase() === ':cours') {
      const relatedCourse = courses.find(c => c.levels.includes(exercise.id)) || courses[0];
      console.log(chalk.cyan(relatedCourse.content));
      await waitKey('Appuyez sur Entrée pour revenir à votre exercice...');
      continue;
    }

    if (trimmed.toLowerCase() === ':hint') {
      if (user && !isSandbox) {
        if ((user.hintTokens || 0) > 0) {
          updateUserProfile(user.username, u => {
            u.hintTokens -= 1;
          });
          console.log(chalk.green(`\n🛡️ Jeton d'indice utilisé ! Votre série de Combo 🔥 est préservée.`));
        } else {
          recordUserStats(user.username, { hints: 1, resetStreak: true });
        }
      }
      if (hintIndex < exercise.hints.length) {
        console.log(chalk.yellow(`\n💡 INDICE ${hintIndex + 1} : `) + exercise.hints[hintIndex]);
        hintIndex++;
      } else {
        console.log(chalk.yellow('\n💡 Tous les indices ont déjà été affichés !'));
      }
      await waitKey();
      continue;
    }

    if (trimmed.toLowerCase() === ':solution') {
      if (user && !isSandbox) {
        recordUserStats(user.username, { resetStreak: true });
      }
      console.log(chalk.magenta.bold('\n🔑 SOLUTION OFFICIELLE :'));
      console.log(chalk.white(exercise.expectedQuery));
      await waitKey();
      continue;
    }

    if (!trimmed) {
      continue;
    }

    attemptsOnThisLevel++;
    if (user && !isSandbox) {
      recordUserStats(user.username, { queries: 1 });
    }

    const dbExpected = await createDatabase(exercise.setupSql);
    const dbUser = await createDatabase(exercise.setupSql);

    const expectedRes = executeQuery(dbExpected, exercise.expectedQuery);
    const userRes = executeQuery(dbUser, trimmed);

    console.log('\n' + chalk.cyan.bold('📊 RÉSULTAT OBTENU :'));
    if (!userRes.success) {
      console.log(chalk.red.bold(`❌ Erreur SQL : ${userRes.error}`));
    } else {
      console.log(renderTable(userRes.columns, userRes.values));
    }

    console.log('\n' + chalk.cyan.bold('🎯 RÉSULTAT ATTENDU :'));
    console.log(renderTable(expectedRes.columns, expectedRes.values));

    const check = compareResults(expectedRes, userRes, exercise.orderMatters);

    if (check.matches) {
      const solveTimeSeconds = Math.round((Date.now() - startTime) / 1000);
      const isFirstTry = attemptsOnThisLevel === 1 && hintIndex === 0;

      console.log(chalk.green.bold(`\n🎉 VICTOIRE ! Défi résolu en ${solveTimeSeconds}s ! 🎉`));

      if (!isSandbox && user) {
        const updatedUser = markUserLevelCompleted(user.username, exercise.id, {
          basePoints: 100,
          firstTry: isFirstTry,
          isBoss
        });

        const reward = updatedUser._lastReward || {};
        if (!reward.alreadyCompleted) {
          console.log(
            chalk.yellow.bold(`⭐ +${reward.earnedPoints} XP`) +
              chalk.hex('#FFD700').bold(` | 💰 +${reward.earnedCoins} SQL Coins`) +
              (isFirstTry ? chalk.green.bold(' (Bonus Sans-Faute !)') : '') +
              (isBoss ? chalk.red.bold(' (Bonus BOSS x2 !)') : '')
          );
        } else {
          console.log(chalk.gray('(Niveau déjà validé précédemment — Mode révision)'));
        }

        const freshUser = getSessionUser();
        const newBadges = checkAndAwardBadges(freshUser, exercise.id, solveTimeSeconds);
        if (newBadges.length > 0) {
          saveUserBadges(freshUser.username, freshUser.badges);
          for (const nb of newBadges) {
            console.log(chalk.bgHex('#FFD700').black.bold(`\n 🏅 NOUVEAU TROPHÉE DÉBLOQUÉ : ${nb.name} `));
            console.log(chalk.yellow(`   ${nb.description}`));
          }
        }
      } else {
        console.log(chalk.gray('(Mode Sandbox actif : pas de sauvegarde de score)'));
      }

      console.log('');
      const nextId = exercise.id + 1;
      if (nextId <= exercises.length) {
        const nextPrompt = await inquirer.prompt([
          {
            type: 'list',
            name: 'nextAction',
            message: 'Que voulez-vous faire ensuite ?',
            choices: [
              { name: `▶ Passer au niveau suivant (Niveau ${nextId})`, value: 'next' },
              { name: '🔄 Recommencer ce niveau', value: 'retry' },
              { name: '📚 Lire le cours associé dans l\'Académie', value: 'course' },
              { name: '📋 Revenir à la carte des niveaux', value: 'list' }
            ]
          }
        ]);

        if (nextPrompt.nextAction === 'next') {
          return startExercise(nextId, isSandbox);
        } else if (nextPrompt.nextAction === 'course') {
          const relatedCourse = courses.find(c => c.levels.includes(exercise.id)) || courses[0];
          return displayCourseDetail(relatedCourse.id);
        } else if (nextPrompt.nextAction === 'list') {
          running = false;
          return showExerciseList(isSandbox);
        }
      } else {
        console.log(chalk.yellow.bold('👑 FÉLICITATIONS LÉGENDAIRES ! Vous avez vaincu le Boss Final et terminé les 35 niveaux ! 🐉🎓\n'));
        await waitKey();
        running = false;
        return isSandbox ? showExerciseList(true) : showMainMenu();
      }
    } else {
      if (user && !isSandbox) {
        recordUserStats(user.username, { resetStreak: true });
      }
      console.log(chalk.red.bold(`\n❌ ÉCHEC : ${check.reason}`));
      console.log(chalk.yellow("Astuce : tapez ':cours' pour revoir la leçon ou ':hint' pour un indice.\n"));
      await waitKey();
    }
  }
}

async function main() {
  await showMainMenu();
}

main().catch(err => {
  console.error(chalk.red('Erreur inattendue :'), err);
});
