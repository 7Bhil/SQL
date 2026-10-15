const readline = require('readline');
const chalk = require('chalk');

/**
 * Invite de saisie multi-lignes pour SQL avec support de :
 * - Entrée simple : retour à la ligne ou soumission si termine par ';'
 * - Touche Échap (ESC) : retour immédiat au menu précédent
 * - Fin par point-virgule (;) puis Entrée, ou ligne vide après ';' pour exécuter
 */
function promptSqlQuery(promptLabel = 'sql> ') {
  return new Promise((resolve) => {
    const lines = [];
    let isEscPressed = false;

    // Définir le mode raw pour capturer les touches spéciales comme ESC
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    const keyListener = (chunk, key) => {
      if (key && key.name === 'escape') {
        isEscPressed = true;
        cleanup();
        resolve({ action: 'escape', query: '' });
      }
    };

    process.stdin.on('keypress', keyListener);

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

        // Si l'utilisateur tape une commande spéciale dès la 1ère ligne
        if (isFirstLine && (trimmedLine.startsWith(':') || trimmedLine === '')) {
          cleanup();
          resolve({ action: 'submit', query: trimmedLine });
          return;
        }

        lines.push(line);
        const fullQuery = lines.join('\n').trim();

        // Si la requête se termine par ';' ou si l'utilisateur entre une ligne vide après du texte
        if (trimmedLine.endsWith(';') || (trimmedLine === '' && lines.length > 1)) {
          cleanup();
          resolve({ action: 'submit', query: fullQuery });
        } else {
          // Continuer sur la ligne suivante
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
