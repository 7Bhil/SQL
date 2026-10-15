#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const exercises = require('./exercises');
const { createDatabase, executeQuery, compareResults } = require('./db');
const { renderTable } = require('./formatter');
const { loadProgress, markCompleted, resetProgress } = require('./progress');

function clearScreen() {
  console.clear();
}

function printHeader() {
  console.log(chalk.bold.hex('#00D2FF')(`
╔═══════════════════════════════════════════════════════════════╗
║                   🏆 SQL MASTER CLI 🏆                        ║
║           Maîtrisez SQL de A à Z pas à pas en terminal        ║
╚═══════════════════════════════════════════════════════════════╝
`));
}

async function showMainMenu() {
  clearScreen();
  printHeader();

  const progress = loadProgress();
  const total = exercises.length;
  const done = progress.completedLevels.length;
  const percentage = Math.round((done / total) * 100);

  console.log(chalk.white(`Progression globale : `) + chalk.green.bold(`${done}/${total} (${percentage}%)`));
  console.log(chalk.gray('---------------------------------------------------------------\n'));

  const choices = [
    { name: `▶  Continuer la progression (Niveau ${Math.min(progress.currentLevel, total)})`, value: 'continue' },
    { name: `📋 Choisir un niveau parmi tous les exercices`, value: 'list' },
    { name: `🔄 Réinitialiser ma progression`, value: 'reset' },
    { name: `🚪 Quitter`, value: 'exit' }
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
      const targetId = Math.min(progress.currentLevel, total);
      await startExercise(targetId);
      break;
    }
    case 'list': {
      await showExerciseList();
      break;
    }
    case 'reset': {
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'yes',
          message: chalk.red('Êtes-vous sûr de vouloir réinitialiser toute votre progression ?'),
          default: false
        }
      ]);
      if (confirm.yes) {
        resetProgress();
        console.log(chalk.green('\nProgression réinitialisée avec succès !'));
        await waitKey();
      }
      await showMainMenu();
      break;
    }
    case 'exit': {
      console.log(chalk.cyan('\nÀ bientôt sur SQL Master ! 💪\n'));
      process.exit(0);
    }
  }
}

async function showExerciseList() {
  clearScreen();
  printHeader();

  const progress = loadProgress();
  const choices = exercises.map(ex => {
    const isDone = progress.completedLevels.includes(ex.id);
    const isCurrent = progress.currentLevel === ex.id;
    let badge = isDone ? chalk.green('✔ [Terminé]') : (isCurrent ? chalk.yellow('▶ [En cours]') : chalk.gray('○ [Verrouillé]'));
    if (ex.id <= progress.currentLevel) {
      return {
        name: `${badge} Niveau ${ex.id} - ${chalk.bold(ex.title)} (${chalk.cyan(ex.category)})`,
        value: ex.id
      };
    } else {
      return {
        name: chalk.gray(`🔒 Niveau ${ex.id} - ${ex.title} (Bloqué)`),
        value: null,
        disabled: 'Complétez les niveaux précédents d\'abord'
      };
    }
  });

  choices.push(new inquirer.Separator());
  choices.push({ name: '⬅ Retour au menu principal', value: 'back' });

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Sélectionnez un exercice :',
      choices,
      pageSize: 15
    }
  ]);

  if (answer.selected === 'back') {
    await showMainMenu();
  } else if (answer.selected) {
    await startExercise(answer.selected);
  }
}

async function waitKey() {
  await inquirer.prompt([{ type: 'input', name: 'press', message: chalk.gray('Appuyez sur Entrée pour continuer...') }]);
}

async function startExercise(exerciseId) {
  const exercise = exercises.find(e => e.id === exerciseId);
  if (!exercise) return showMainMenu();

  let hintIndex = 0;
  let running = true;

  while (running) {
    clearScreen();
    printHeader();

    console.log(chalk.bgHex('#005577').white.bold(` NIVEAU ${exercise.id} / ${exercises.length} : ${exercise.title} `));
    console.log(chalk.magenta(`Catégorie : ${exercise.category}\n`));

    console.log(chalk.yellow.bold('📖 COURS / RAPPEL :'));
    console.log(chalk.white(exercise.lesson));
    console.log('\n' + chalk.gray('─'.repeat(63)) + '\n');

    console.log(chalk.cyan.bold('🎯 OBJECTIF DE L\'EXERCICE :'));
    console.log(chalk.bold.white(exercise.task));
    console.log('\n' + chalk.gray('─'.repeat(63)));

    console.log(chalk.italic.gray("Commandes spéciales : ':hint' pour un indice | ':solution' pour la réponse | ':back' pour le menu"));

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
      await showMainMenu();
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
      markCompleted(exercise.id);

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
              { name: '📋 Revenir au menu principal', value: 'menu' }
            ]
          }
        ]);

        if (nextPrompt.nextAction === 'next') {
          exerciseId = nextId;
          return startExercise(nextId);
        } else if (nextPrompt.nextAction === 'menu') {
          running = false;
          return showMainMenu();
        }
      } else {
        console.log(chalk.yellow.bold('🏆 FÉLICITATIONS ! Vous avez terminé TOUS les niveaux de SQL Master ! 🎓\n'));
        await waitKey();
        running = false;
        return showMainMenu();
      }
    } else {
      console.log(chalk.red.bold(`\n❌ ÉCHEC : ${check.reason}`));
      console.log(chalk.yellow("Tapez ':hint' si vous avez besoin d'aide ou essayez une autre requête.\n"));
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
