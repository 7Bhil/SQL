# 🏆 SQL Master CLI

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![SQLite: In--Memory](https://img.shields.io/badge/Database-SQLite%20(sql.js)-orange.svg)](https://github.com/sql-js/sql.js)
[![Stars](https://img.shields.io/github/stars/7Bhil/SQL.git?style=social)](https://github.com/7Bhil/SQL.git)

> **Maîtrisez SQL de A à Z directement dans votre terminal !**  
> Une application CLI gamifiée, interactive et complète avec 25 niveaux progressifs, moteur SQLite embarqué, navigation au clavier, système de comptes, trophées et clé chiffrée anti-triche prête pour le Leaderboard.

---

## 🚀 Démarrage en 1 seconde

```bash
# Cloner le dépôt
git clone https://github.com/7Bhil/SQL.git
cd SQL

# Installer les dépendances
npm install

# Lancer l'aventure
npm start
```

---

## ✨ Fonctionnalités phares

- **⌨️ Expérience Terminal de Pro** :
  - **Touche `Échap` (`ESC`)** : retour instantané en arrière à tout moment.
  - **Flèches `Haut ⬆` et `Bas ⬇`** : navigation dans l'historique de vos requêtes comme sous `bash` ou `psql`.
  - **Saisie Multi-Lignes** : appuyez sur `Entrée` pour sauter une ligne, terminez par `;` pour exécuter.
- **👀 Aperçu automatique des Tables & Schémas** :
  - Avant chaque consigne, toutes les tables impliquées et leurs premières lignes de données sont inspectées et affichées sous forme de tableau CLI clair.
- **🏅 Système de Trophées & Badges** :
  - 🐣 *Premier Pas SQL*
  - 🔍 *Ninja du Filtrage*
  - 🔗 *Maître des Jointures*
  - ⚡ *Éclair de Génie* (résolution en moins de 10 secondes)
  - 👑 *Grand Maître SQL* (terminer les 25 niveaux)
- **📊 Progression & Statistiques en direct** :
  - Barre de progression visuelle : `[████████░░░░░░░░░░░░░░░░░] 32%`.
  - Nombre total de requêtes tentées, chronomètre et indices utilisés.
- **🔐 Clé Chiffrée Anti-Triche (Passeport Leaderboard)** :
  - Chiffrement **AES-256-CBC** avec signature d'intégrité **HMAC-SHA256**.
  - Clé portable contenant scores et niveaux validés, infalsifiable à la main.
- **🔓 Mode Sandbox (Accès Libre)** :
  - Code secret : **`0000`**
  - Permet de sauter immédiatement vers n'importe lequel des 25 niveaux sans bloquer.

---

## 📚 Parcours de A à Z (25 Niveaux)

| Niveaux | Module | Notions clés abordées |
|---|---|---|
| **1 - 3** | **1. Les Bases** | `SELECT`, projection de colonnes, alias `AS`, `DISTINCT` |
| **4 - 8** | **2. Filtrage & Conditions** | `WHERE`, opérateurs (`=, >, <=`), `AND`/`OR`, `BETWEEN`, `IN`, `LIKE`, `IS NULL` |
| **9 - 10** | **3. Tri & Pagination** | `ORDER BY (ASC/DESC)`, `LIMIT`, `OFFSET` |
| **11 - 13** | **4. Agrégations & Groupes** | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, `HAVING` |
| **14 - 16** | **5. Les Jointures** | `INNER JOIN`, `LEFT JOIN`, détection d'orphelins avec `IS NULL` |
| **17 - 18** | **6. Sous-requêtes & Logique** | Sous-requêtes dans `WHERE` (`Subqueries`), `CASE WHEN ... THEN ... END` |
| **19 - 20** | **7. Concepts Avancés** | CTE (`WITH`), Fonctions de Fenêtrage (`ROW_NUMBER() OVER (...)`) |
| **21 - 23** | **8. Modification de Données (DML)** | `INSERT INTO`, `UPDATE ... WHERE`, `DELETE FROM ... WHERE` |
| **24 - 25** | **9. Définition de Schéma (DDL)** | `CREATE TABLE` (types & contraintes), `ALTER TABLE ADD COLUMN` |

---

## ⭐ Soutenez le projet !

Si vous appréciez ce projet ou qu'il vous a aidé à progresser en SQL :
👉 **Laissez une étoile (Star ⭐) sur le [dépôt GitHub](https://github.com/7Bhil/SQL.git) !** Cela aide énormément à faire grandir le projet.
