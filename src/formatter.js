const Table = require('cli-table3');
const chalk = require('chalk');

function renderTable(columns, values, maxRows = 20) {
  if (!columns || columns.length === 0) {
    return chalk.gray('(Aucun résultat / Table vide)');
  }

  const table = new Table({
    head: columns.map(c => chalk.cyan.bold(c)),
    style: {
      head: [],
      border: ['grey']
    }
  });

  const displayRows = values.slice(0, maxRows);
  for (const row of displayRows) {
    table.push(row.map(val => (val === null ? chalk.yellow('NULL') : String(val))));
  }

  let output = table.toString();
  if (values.length > maxRows) {
    output += `\n${chalk.gray(`... et ${values.length - maxRows} ligne(s) supplémentaire(s)`)}`;
  }
  return output;
}

module.exports = {
  renderTable
};
