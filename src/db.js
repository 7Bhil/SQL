const initSqlJs = require('sql.js');

let SQL_ENGINE = null;

async function getEngine() {
  if (!SQL_ENGINE) {
    SQL_ENGINE = await initSqlJs();
  }
  return SQL_ENGINE;
}

async function createDatabase(setupSql = '') {
  const SQL = await getEngine();
  const db = new SQL.Database();
  if (setupSql && setupSql.trim().length > 0) {
    db.run(setupSql);
  }
  return db;
}

function executeQuery(db, query) {
  try {
    const res = db.exec(query);
    if (!res || res.length === 0) {
      return { success: true, columns: [], values: [] };
    }
    const first = res[0];
    return {
      success: true,
      columns: first.columns,
      values: first.values
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// Récupère la liste de toutes les tables et leur contenu pour l'illustration
function inspectDatabaseTables(db) {
  try {
    const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (!tablesRes || tablesRes.length === 0) {
      return [];
    }

    const tableNames = tablesRes[0].values.map(row => row[0]);
    const tablesInfo = [];

    for (const tableName of tableNames) {
      const dataRes = db.exec(`SELECT * FROM ${tableName} LIMIT 10;`);
      if (dataRes && dataRes.length > 0) {
        tablesInfo.push({
          name: tableName,
          columns: dataRes[0].columns,
          values: dataRes[0].values
        });
      } else {
        // Table vide, on inspecte quand même ses colonnes via PRAGMA
        const colInfo = db.exec(`PRAGMA table_info(${tableName});`);
        const columns = colInfo && colInfo.length > 0 ? colInfo[0].values.map(r => r[1]) : [];
        tablesInfo.push({
          name: tableName,
          columns,
          values: []
        });
      }
    }

    return tablesInfo;
  } catch (err) {
    return [];
  }
}

// Comparer deux résultats de requêtes
function compareResults(expected, actual, orderMatters = false) {
  if (!actual.success) {
    return { matches: false, reason: `Erreur SQL: ${actual.error}` };
  }

  // Vérifier colonnes (insensible à la casse sur les noms si besoin, mais standardisé)
  if (expected.columns.length !== actual.columns.length) {
    return {
      matches: false,
      reason: `Nombre de colonnes différent: attendu ${expected.columns.length} (${expected.columns.join(', ')}), obtenu ${actual.columns.length} (${actual.columns.join(', ')})`
    };
  }

  if (expected.values.length !== actual.values.length) {
    return {
      matches: false,
      reason: `Nombre de lignes différent: attendu ${expected.values.length} ligne(s), obtenu ${actual.values.length} ligne(s)`
    };
  }

  const normalizeRow = (row) => row.map(v => (v === null ? 'NULL' : String(v).trim()));

  if (orderMatters) {
    for (let i = 0; i < expected.values.length; i++) {
      const expR = normalizeRow(expected.values[i]);
      const actR = normalizeRow(actual.values[i]);
      if (JSON.stringify(expR) !== JSON.stringify(actR)) {
        return {
          matches: false,
          reason: `L'ordre ou les valeurs de la ligne ${i + 1} ne correspondent pas.`
        };
      }
    }
  } else {
    const stringifyRows = (rows) => rows.map(r => JSON.stringify(normalizeRow(r))).sort();
    const sortedExp = stringifyRows(expected.values);
    const sortedAct = stringifyRows(actual.values);
    for (let i = 0; i < sortedExp.length; i++) {
      if (sortedExp[i] !== sortedAct[i]) {
        return {
          matches: false,
          reason: `Les lignes renvoyées ne correspondent pas aux résultats attendus.`
        };
      }
    }
  }

  return { matches: true };
}

module.exports = {
  createDatabase,
  executeQuery,
  inspectDatabaseTables,
  compareResults
};
