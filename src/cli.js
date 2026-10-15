#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const exercises = require('./exercises');
const { createDatabase, executeQuery, inspectDatabaseTables, compareResults } = require('./db');
const { renderTable } = require('./formatter');
const {
  getSessionUser,
  registerUser,
  loginUser,
  logout,
  markUserLevelCompleted,
  getUserPassport
} = require('./auth');

const SANDBOX_PASSWORD = '0000';

function clearScreen() {
  console.clear();
}

function printHeader(currentUser = null) {
  console.log(chalk.bold.hex('#00D2FF')(`
╔═══════════════════════════════════════════════════════════════╗
║                   🏆 SQL MASTER CLI 🏆                        ║
║           Maîtrisez SQL de A à Z pas à pas en terminal        ║
╚═══════════════════════════════════════════════════════════════╝`));
  if (currentUser) {
    console.log(
      chalk.white(' Connecté : ') +
      chalk.green.bold(currentUser.username) +
      chalk.white(' | Score : ') +
      chalk.yellow.bold(`${currentUser.score || 0} pts`) +
      chalk.white(' | Niveaux : ') +
      chalk.cyan.bold(`${currentUser.completedLevels ? currentUser.completedLevels.length : 0}/${exercises.length}\n`)
    );
  } else {
    console.log(chalk.gray(' Non connecté (Mode invité / Déconnexion)\n'));
  }
}

async function waitKey() {
  await inquirer.prompt([{ type: 'input', name: 'press', message: chalk.gray('Appuyez sur Entrée pour continuer...') }]);
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
        message: 'Bienvenue ! Veuillez choisir une option :',
        choices: [
          { name: '🔑 Se connecter', value: 'login' },
          { name: '👤 Créer un compte', value: 'register' },
          { name: '🔓 Mode Sandbox (Accès Libre sans compte - Code requis)', value: 'sandbox' },
          { name: '🚪 Quitter', value: 'exit' }
        ]
      }
    ]);

    if (choice === 'exit') {
      console.log(chalk.cyan('\nÀ bientôt sur SQL Master ! 💪\n'));
      process.exit(0);
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
        console.log(chalk.green('\n✔ Accès Sandbox accordé !'));
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
          message: 'Choisissez un nom d\'utilisateur :',
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
        console.log(chalk.green(`\n✔ Compte créé avec succès ! Bienvenue, ${res.user.username} !`));
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
          message: 'Nom d\'utilisateur :'
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
        console.log(chalk.green(`\n✔ Connexion réussie ! Heureux de vous revoir, ${res.user.username} !`));
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
  const percentage = Math.round((done / total) * 100);

  console.log(chalk.white(`Progression officielle : `) + chalk.green.bold(`${done}/${total} (${percentage}%)`));
  console.log(chalk.gray('---------------------------------------------------------------\n'));

  const choices = [
    { name: `▶  Continuer l'aventure (Niveau ${Math.min(user.currentLevel || 1, total)})`, value: 'continue' },
    { name: `📋 Choisir un niveau de mon parcours`, value: 'list' },
    { name: `🔓 Mode Sandbox (Tester n'importe quel niveau sans sauvegarde)`, value: 'sandbox' },
    { name: `👤 Mon Profil & Clé Chiffrée (Passeport)`, value: 'profile' },
    { name: `🚪 Se déconnecter`, value: 'logout' },
    { name: `❌ Quitter le programme`, value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Que voulez-vous faire ?',
      choices
    }
  ]);

  switch (answer.action) {
    case 'continue': {
      const targetId = Math.min(user.currentLevel || 1, total);
      await startExercise(targetId, false);
      break;
    }
    case 'list': {
      await showExerciseList(false);
      break;
    }
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
    case 'profile': {
      await showProfile();
      break;
    }
    case 'logout': {
      logout();
      console.log(chalk.yellow('\nDéconnexion réussie.'));
      await waitKey();
      await showMainMenu();
      break;
    }
    case 'exit': {
      console.log(chalk.cyan('\nÀ bientôt sur SQL Master ! 💪\n'));
      process.exit(0);
    }
  }
}

// -------------------------------------------------------------
// ÉCRAN PROFIL & CLÉ CHIFFRÉE
// -------------------------------------------------------------
async function showProfile() {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  const passport = getUserPassport(user);
  const doneCount = user.completedLevels ? user.completedLevels.length : 0;

  console.log(chalk.bgHex('#223344').white.bold(' 👤 FICHE DE PROFIL JOUEUR '));
  console.log(chalk.white(` • Pseudo            : `) + chalk.cyan.bold(user.username));
  console.log(chalk.white(` • Score Total       : `) + chalk.yellow.bold(`${user.score || 0} points`));
  console.log(chalk.white(` • Niveaux réussis   : `) + chalk.green.bold(`${doneCount} / ${exercises.length}`));
  console.log(chalk.white(` • Date de création  : `) + chalk.gray(new Date(user.createdAt).toLocaleString()));
  console.log('\n' + chalk.gray('─'.repeat(63)) + '\n');

  console.log(chalk.magenta.bold('🔐 VOTRE CLÉ CHIFFRÉE ANTI-TRICHE (PASSEPORT LEADERBOARD) :'));
  console.log(chalk.italic.gray("Cette clé contient vos scores et statistiques sous signature cryptographique HMAC."));
  console.log(chalk.italic.gray("Conservez-la pour restaurer votre progression ou synchroniser le Leaderboard mondial !\n"));

  console.log(chalk.yellow(passport));
  console.log('\n' + chalk.gray('─'.repeat(63)) + '\n');

  await waitKey();
  await showMainMenu();
}

// -------------------------------------------------------------
// MODE SANDBOX (ACCÈS LIBRE)
// -------------------------------------------------------------
async function runSandboxMode() {
  await showExerciseList(true);
}

async function showExerciseList(isSandbox = false) {
  clearScreen();
  const user = getSessionUser();
  printHeader(user);

  if (isSandbox) {
    console.log(chalk.bgHex('#CC5500').white.bold(' 🔓 MODE SANDBOX : TOUS LES NIVEAUX SONT DÉBLOQUÉS '));
    console.log(chalk.yellow('Attention : les niveaux réussis en mode Sandbox ne sont PAS sauvegardés sur votre profil.\n'));
  }

  const choices = exercises.map(ex => {
    if (isSandbox) {
      return {
        name: chalk.yellow(`[Niveau ${ex.id}] `) + `${ex.title} (${chalk.cyan(ex.category)})`,
        value: ex.id
      };
    } else {
      const isDone = user.completedLevels && user.completedLevels.includes(ex.id);
      const isCurrent = user.currentLevel === ex.id;
      let badge = isDone ? chalk.green('✔ [Terminé]') : (isCurrent ? chalk.yellow('▶ [En cours]') : chalk.gray('○ [Verrouillé]'));
      if (ex.id <= (user.currentLevel || 1)) {
        return {
          name: `${badge} Niveau ${ex.id} - ${chalk.bold(ex.title)} (${chalk.cyan(ex.category)})`,
          value: ex.id
        };
      } else {
        return {
          name: chalk.gray(`🔒 Niveau ${ex.id} - ${ex.title} (Bloqué)`),
          value: null,
          disabled: 'Complétez les niveaux précédents d\'abord (ou utilisez le Sandbox)'
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
      message: isSandbox ? 'Choisissez n\'importe quel niveau à tester :' : 'Sélectionnez un niveau :',
      choices,
      pageSize: 15
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
// DÉROULEMENT D'UN EXERCICE
// -------------------------------------------------------------
async function startExercise(exerciseId, isSandbox = false) {
  const exercise = exercises.find(e => e.id === exerciseId);
  if (!exercise) return showMainMenu();

  let hintIndex = 0;
  let running = true;

  while (running) {
    clearScreen();
    const user = getSessionUser();
    printHeader(user);

    if (isSandbox) {
      console.log(chalk.bgHex('#CC5500').white.bold(` [MODE SANDBOX] NIVEAU ${exercise.id} : ${exercise.title} `));
    } else {
      console.log(chalk.bgHex('#005577').white.bold(` NIVEAU ${exercise.id} / ${exercises.length} : ${exercise.title} `));
    }
    console.log(chalk.magenta(`Catégorie : ${exercise.category}\n`));

    console.log(chalk.yellow.bold('📖 COURS / RAPPEL :'));
    console.log(chalk.white(exercise.lesson));
    console.log('\n' + chalk.gray('─'.repeat(63)) + '\n');

    console.log(chalk.cyan.bold('🎯 OBJECTIF DE L\'EXERCICE :'));
    console.log(chalk.bold.white(exercise.task));
    console.log('\n' + chalk.gray('─'.repeat(63)) + '\n');

    // Affichage des tables et données disponibles pour l'exercice
    const previewDb = await createDatabase(exercise.setupSql);
    const tablesInfo = inspectDatabaseTables(previewDb);

    console.log(chalk.hex('#FFA500').bold('📦 TABLES ET DONNÉES DISPONIBLES :'));
    if (tablesInfo.length === 0) {
      console.log(chalk.gray('(Aucune table pré-existante)'));
    } else {
      for (const t of tablesInfo) {
        console.log(chalk.blue.bold(`\nTable: `) + chalk.yellow.bold(t.name));
        console.log(renderTable(t.columns, t.values, 5));
      }
    }
    console.log('\n' + chalk.gray('─'.repeat(63)));

    console.log(chalk.italic.gray("Commandes : ':hint' pour un indice | ':solution' pour la réponse | ':back' pour quitter"));

    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: chalk.green.bold('sql> ')
      }
    ]);

    const trimmed = query.trim();

    if (trimmed.toLowerCase() === ':back') {
      running = false;
      if (isSandbox) {
        await showExerciseList(true);
      } else {
        await showMainMenu();
      }
      return;
    }

    if (trimmed.toLowerCase() === ':hint') {
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
      console.log(chalk.magenta.bold('\n🔑 SOLUTION OFFICIELLE :'));
      console.log(chalk.white(exercise.expectedQuery));
      await waitKey();
      continue;
    }

    if (!trimmed) {
      continue;
    }

    // Tester la requête
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
      console.log(chalk.green.bold('\n🎉 BRAVO ! Défi validé avec succès ! 🎉\n'));

      if (!isSandbox && user) {
        markUserLevelCompleted(user.username, exercise.id, 100);
        console.log(chalk.yellow('⭐ +100 points ajoutés à votre profil officiel !'));
      } else {
        console.log(chalk.gray('(Mode Sandbox actif : aucune modification de progression/score)'));
      }

      const nextId = exercise.id + 1;
      if (nextId <= exercises.length) {
        const nextPrompt = await inquirer.prompt([
          {
            type: 'list',
            name: 'nextAction',
            message: 'Que voulez-vous faire ensuite ?',
            choices: [
              { name: `▶ Passer au niveau suivant (${nextId})`, value: 'next' },
              { name: '🔄 Recommencer ce niveau', value: 'retry' },
              { name: '📋 Revenir à la liste des niveaux', value: 'list' }
            ]
          }
        ]);

        if (nextPrompt.nextAction === 'next') {
          exerciseId = nextId;
          return startExercise(nextId, isSandbox);
        } else if (nextPrompt.nextAction === 'list') {
          running = false;
          return showExerciseList(isSandbox);
        }
      } else {
        console.log(chalk.yellow.bold('🏆 FÉLICITATIONS ! Vous avez terminé TOUS les niveaux de SQL Master ! 🎓\n'));
        await waitKey();
        running = false;
        return isSandbox ? showExerciseList(true) : showMainMenu();
      }
    } else {
      console.log(chalk.red.bold(`\n❌ ÉCHEC : ${check.reason}`));
      console.log(chalk.yellow("Tapez ':hint' si vous avez besoin d'aide ou réessayez.\n"));
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
