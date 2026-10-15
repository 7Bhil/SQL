const readline = require('readline');
const chalk = require('chalk');

// Historique en mémoire des requêtes pour les touches Haut/Bas
const QUERY_HISTORY = [];

/**
 * Invite de saisie multi-lignes pour SQL avec support de :
 * - Touches Haut / Bas : Navigation dans l'historique
 * - Touche Échap (ESC) : Retour immédiat au menu précédent
 * - Multi-lignes : Entrée crée une nouvelle ligne ( ...> )
 * - Exécution : Terminez par ';' ou ligne vide
 */
function promptSqlQuery(promptLabel = 'sql> ') {
  return new Promise((resolve) => {
    let historyIndex = QUERY_HISTORY.length;
    const lines = [];
    let isEscPressed = false;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: 50
    });

    const keyListener = (chunk, key) => {
      if (key) {
        if (key.name === 'escape') {
          isEscPressed = true;
          cleanup();
          resolve({ action: 'escape', query: '' });
          return;
        }

        // Navigation historique sur la première ligne
        if (lines.length === 0) {
          if (key.name === 'up' && QUERY_HISTORY.length > 0) {
            if (historyIndex > 0) {
              historyIndex--;
              replaceCurrentLine(rl, QUERY_HISTORY[historyIndex]);
            }
          } else if (key.name === 'down') {
            if (historyIndex < QUERY_HISTORY.length - 1) {
              historyIndex++;
              replaceCurrentLine(rl, QUERY_HISTORY[historyIndex]);
            } else {
              historyIndex = QUERY_HISTORY.length;
              replaceCurrentLine(rl, '');
            }
          }
        }
      }
    };

    process.stdin.on('keypress', keyListener);

    function replaceCurrentLine(readlineInterface, newText) {
      readlineInterface.line = newText;
      readlineInterface.cursor = newText.length;
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      process.stdout.write(chalk.green.bold(promptLabel) + newText);
    }

    function cleanup() {
      process.stdin.removeListener('keypress', keyListener);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      rl.close();
    }

    function askLine(isFirstLine = true) {
      const prefix = isFirstLine ? chalk.green.bold(promptLabel) : chalk.gray(' ...> ');
      rl.question(prefix, (line) => {
        if (isEscPressed) return;

        const trimmedLine = line.trim();

        // Commandes spéciales (:hint, :solution, :back)
        if (isFirstLine && (trimmedLine.startsWith(':') || trimmedLine === '')) {
          cleanup();
          resolve({ action: 'submit', query: trimmedLine });
          return;
        }

        lines.push(line);
        const fullQuery = lines.join('\n').trim();

        if (trimmedLine.endsWith(';') || (trimmedLine === '' && lines.length > 1)) {
          cleanup();
          if (fullQuery && !QUERY_HISTORY.includes(fullQuery)) {
            QUERY_HISTORY.push(fullQuery);
          }
          resolve({ action: 'submit', query: fullQuery });
        } else {
          askLine(false);
        }
      });
    }

    askLine(true);
  });
}

module.exports = {
  promptSqlQuery
};
