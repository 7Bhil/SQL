# 🏆 SQL Master CLI

Un programme interactif en ligne de commande (CLI) pour apprendre et maîtriser **SQL de A à Z** à travers une suite d'exercices pratiques progressifs.

---

## 🚀 Démarrage rapide

Dans votre terminal, exécutez simplement :

```bash
npm start
```

ou directement :

```bash
./src/cli.js
```

---

## ✨ Fonctionnalités incluses

1. **20 Niveaux structurés de A à Z** :
   - **Niveaux 1 à 3** : Les bases (`SELECT`, projections de colonnes ciblées, `DISTINCT`)
   - **Niveaux 4 à 8** : Filtrage (`WHERE`, opérateurs de comparaison, `AND` / `OR`, `BETWEEN`, `IN`, motifs textuels avec `LIKE`, `IS NULL`)
   - **Niveaux 9 à 10** : Tri et pagination (`ORDER BY`, `LIMIT`, `OFFSET`)
   - **Niveaux 11 à 13** : Agrégations et groupements (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, filtrage avec `HAVING`)
   - **Niveaux 14 à 16** : Jointures (`INNER JOIN`, `LEFT JOIN`, détection de données orphelines `LEFT JOIN + IS NULL`)
   - **Niveaux 17 à 18** : Sous-requêtes imbriquées (Subqueries) & logiques conditionnelles (`CASE WHEN ... THEN ... ELSE ... END`)
   - **Niveaux 19 à 20** : Concepts avancés du monde pro (CTE `WITH`, Fonctions de fenêtrage `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`)

2. **REPL Interactif gamifié** :
   - Saisissez vos requêtes directement dans le prompt `sql> `.
   - Exécution immédiate en mémoire avec moteur SQLite embarqué (aucun serveur lourd à configurer).

3. **Comparaison visuelle en tableau** :
   - Tableaux clairs comparant le **Résultat obtenu** face au **Résultat attendu**.
   - Validation automatique des valeurs, du nombre de lignes et du respect de l'ordre quand exigé.

4. **Système d'aide & anti-blocage** :
   - Tapez `:hint` pour obtenir des indices progressifs.
   - Tapez `:solution` pour afficher la solution officielle si vous êtes bloqué.
   - Tapez `:back` pour retourner au menu principal.

5. **Sauvegarde automatique** :
   - Votre progression est conservée dans `data/progress.json`.
   - Vous pouvez reprendre à tout moment ou réinitialiser votre parcours depuis le menu.
