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
  db._storedProcedures = {};
  if (setupSql && setupSql.trim().length > 0) {
    executeWithProcedures(db, setupSql);
  }
  return db;
}

/**
 * Transpileur / Émulateur de Procédures Stockées pour SQLite :
 * Supporte :
 *   CREATE PROCEDURE nom_proc(param1 TYPE, param2 TYPE)
 *   BEGIN
 *     instructions SQL;
 *   END;
 * Et :
 *   CALL nom_proc(val1, val2);
 */
function executeWithProcedures(db, rawQuery) {
  if (!db._storedProcedures) {
    db._storedProcedures = {};
  }

  let query = rawQuery.trim();

  // 1. Extraire toutes les déclarations CREATE PROCEDURE ... BEGIN ... END;
  const createProcRegex = /CREATE\s+PROCEDURE\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*BEGIN\s+([\s\S]*?)\s+END\s*;/gi;
  query = query.replace(createProcRegex, (match, procName, paramsStr, body) => {
    const params = paramsStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => p.split(/\s+/)[0]); // Garde le nom du paramètre

    db._storedProcedures[procName.toLowerCase()] = {
      name: procName,
      params,
      body: body.trim()
    };
    return ''; // Retiré du flux SQL standard
  });

  // 2. Remplacer tous les appels CALL nom_proc(arg1, arg2); par le corps de la procédure
  const callRegex = /CALL\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*;?/gi;
  query = query.replace(callRegex, (match, procName, argsStr) => {
    const proc = db._storedProcedures[procName.toLowerCase()];
    if (!proc) {
      throw new Error(`Procédure stockée introuvable : ${procName}`);
    }

    // Découper les arguments en respectant les chaînes entre guillemets
    const args = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === "'" || ch === '"') {
        inQuotes = !inQuotes;
        current += ch;
      } else if (ch === ',' && !inQuotes) {
        args.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim().length > 0) {
      args.push(current.trim());
    }

    if (args.length !== proc.params.length) {
      throw new Error(
        `La procédure '${procName}' attend ${proc.params.length} argument(s), mais ${args.length} fourni(s).`
      );
    }

    let expandedBody = proc.body;
    proc.params.forEach((paramName, idx) => {
      // Remplacement sécurisé du nom du paramètre (avec ou sans préfixe @ ou :)
      const regex = new RegExp(`\\b${paramName}\\b`, 'g');
      expandedBody = expandedBody.replace(regex, args[idx]);
    });

    if (!expandedBody.trim().endsWith(';')) {
      expandedBody += ';';
    }
    return expandedBody;
  });

  if (!query.trim()) {
    return [];
  }

  return db.exec(query);
}

function executeQuery(db, query) {
  try {
    const res = executeWithProcedures(db, query);
    if (!res || res.length === 0) {
      return { success: true, columns: [], values: [] };
    }
    // Prendre le dernier jeu de résultats (pratique quand il y a un INSERT/UPDATE/CALL suivi d'un SELECT)
    const lastResult = res[res.length - 1];
    return {
      success: true,
      columns: lastResult.columns,
      values: lastResult.values
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// Récupère la liste de toutes les tables et vues et leur contenu pour l'illustration
function inspectDatabaseTables(db) {
  try {
    const tablesRes = db.exec(
      "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%';"
    );
    if (!tablesRes || tablesRes.length === 0) {
      return [];
    }

    const items = tablesRes[0].values.map(row => ({ name: row[0], type: row[1] }));
    const tablesInfo = [];

    for (const item of items) {
      const dataRes = db.exec(`SELECT * FROM ${item.name} LIMIT 10;`);
      if (dataRes && dataRes.length > 0) {
        tablesInfo.push({
          name: item.type === 'view' ? `${item.name} (VUE)` : item.name,
          columns: dataRes[0].columns,
          values: dataRes[0].values
        });
      } else {
        const colInfo = db.exec(`PRAGMA table_info(${item.name});`);
        const columns = colInfo && colInfo.length > 0 ? colInfo[0].values.map(r => r[1]) : [];
        tablesInfo.push({
          name: item.type === 'view' ? `${item.name} (VUE)` : item.name,
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

// Comparer deux résultats de requêtes avec diagnostic pédagogique
function compareResults(expected, actual, orderMatters = false) {
  if (!actual.success) {
    return { matches: false, reason: `Erreur SQL : ${actual.error}` };
  }

  if (expected.columns.length !== actual.columns.length) {
    return {
      matches: false,
      reason: `Nombre de colonnes incorrect : attendu ${expected.columns.length} (${expected.columns.join(', ')}), mais obtenu ${actual.columns.length} (${actual.columns.join(', ')}). Vérifiez votre clause SELECT.`
    };
  }

  // Vérifier le nom des colonnes (insensible à la casse)
  for (let i = 0; i < expected.columns.length; i++) {
    if (expected.columns[i].toLowerCase() !== actual.columns[i].toLowerCase()) {
      return {
        matches: false,
        reason: `La colonne n°${i + 1} s'appelle '${actual.columns[i]}' au lieu de '${expected.columns[i]}'. Avez-vous pensé à utiliser AS pour l'alias ?`
      };
    }
  }

  if (expected.values.length !== actual.values.length) {
    const diff = actual.values.length - expected.values.length;
    const hintMsg =
      diff > 0
        ? `Vous avez ${diff} ligne(s) en trop. Vérifiez votre filtrage (WHERE / HAVING / DISTINCT / LIMIT).`
        : `Il vous manque ${Math.abs(diff)} ligne(s). Votre condition WHERE ou votre jointure (INNER vs LEFT JOIN) est peut-être trop stricte.`;
    return {
      matches: false,
      reason: `Nombre de lignes différent : attendu ${expected.values.length}, obtenu ${actual.values.length}. ${hintMsg}`
    };
  }

  const normalizeRow = row =>
    row.map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'number') return Number(v.toFixed(4)).toString();
      return String(v).trim();
    });

  if (orderMatters) {
    for (let i = 0; i < expected.values.length; i++) {
      const expR = normalizeRow(expected.values[i]);
      const actR = normalizeRow(actual.values[i]);
      if (JSON.stringify(expR) !== JSON.stringify(actR)) {
        // Vérifier si ce sont les mêmes lignes mais dans le mauvais ordre
        const sortedExp = expected.values.map(r => JSON.stringify(normalizeRow(r))).sort();
        const sortedAct = actual.values.map(r => JSON.stringify(normalizeRow(r))).sort();
        if (JSON.stringify(sortedExp) === JSON.stringify(sortedAct)) {
          return {
            matches: false,
            reason: `Les données sont bonnes, mais l'ordre des lignes est incorrect à la ligne ${i + 1} ! Vérifiez votre clause ORDER BY (ASC ou DESC).`
          };
        }
        return {
          matches: false,
          reason: `Les valeurs de la ligne ${i + 1} (${actR.join(', ')}) ne correspondent pas à l'attendu (${expR.join(', ')}).`
        };
      }
    }
  } else {
    const stringifyRows = rows => rows.map(r => JSON.stringify(normalizeRow(r))).sort();
    const sortedExp = stringifyRows(expected.values);
    const sortedAct = stringifyRows(actual.values);
    for (let i = 0; i < sortedExp.length; i++) {
      if (sortedExp[i] !== sortedAct[i]) {
        return {
          matches: false,
          reason: `Certaines valeurs calculées ou filtrées ne correspondent pas aux données attendues.`
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
