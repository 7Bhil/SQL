# 🏆 SQL Master : Ultimate Academy & RPG

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![SQLite: In--Memory](https://img.shields.io/badge/Database-SQLite%20%2B%20Stored%20Procedures-orange.svg)](https://github.com/sql-js/sql.js)
[![Stars](https://img.shields.io/github/stars/7Bhil/SQL.git?style=social)](https://github.com/7Bhil/SQL.git)

> **De Zéro jusqu'aux Triggers & Procédures Stockées directement dans votre terminal !**  
> Une véritable **Académie SQL interactive** fusionnée avec un **RPG gamifié** : 10 chapitres de cours illustrés avec démos en direct, 35 niveaux progressifs, Combats de Boss, Mode Contre-la-Montre, Boutique de thèmes et Passeport Chiffré Anti-Triche.

![Démo SQL Master RPG](./demo.gif)

---

## 🚀 Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/7Bhil/SQL.git
cd SQL

# 2. Installer les dépendances
npm install

# 3. Lancer l'aventure
npm start
```

---

## 🌟 Ce qui rend SQL Master unique

### 1. 📚 L'Académie SQL Interactive (10 Chapitres de Cours de A à Z)
Accessible avec ou sans compte ! Chaque chapitre propose :
- Des **cours complets illustrés en schémas ASCII** (comprendre visuellement un `INNER JOIN` vs `LEFT JOIN`, ou le flux d'un `GROUP BY` / `HAVING`).
- Un bouton **"▶ Exécuter la démo interactive en direct"** pour voir la requête tourner sous vos yeux.
- Un raccourci **`:cours`** utilisable à tout moment au milieu d'un exercice en cas d'oubli !

### 2. ⚙️ Moteur SQL Pro : jusqu'aux Triggers & Procédures Stockées (35 Niveaux)
Contrairement aux tutoriels basiques qui s'arrêtent au `SELECT`, SQL Master embarque un **transpileur de Procédures Stockées (`CREATE PROCEDURE ... BEGIN ... END;` & `CALL`)** :
- Créez des Vues sécurisées (`CREATE VIEW`).
- Optimisez avec des Index (`CREATE INDEX`).
- Gérez des virements bancaires atomiques (`BEGIN TRANSACTION ... COMMIT`).
- Automatisez des tables d'audit et des stocks avec des Déclencheurs (`CREATE TRIGGER AFTER INSERT / UPDATE`).
- Programmez et appelez vos propres **Procédures Stockées (`CREATE PROCEDURE` & `CALL`)** !

### 3. 🎮 Gamification RPG Complète
- **Rangs Évolutifs (Rang F ➔ Rang S)** : progressez de *Stagiaire Data 🐣* jusqu'à *Dieu Vivant du SQL 🐉*.
- **Combats de Boss 👹** : tous les 5 niveaux, affrontez un scénario d'urgence en production avec **XP et SQL Coins doublés (x2)** !
- **Combo Streak 🔥 & Bonus Sans-Faute** : enchaînez les réussites du premier coup pour multiplier vos gains (`x1.5`).
- **Boutique RPG & Thèmes Visuels 🛒** : dépensez vos **SQL Coins 💰** pour débloquer les thèmes *Matrix Hacker 🟢*, *Dracula Dark 🧛*, *Empereur Gold 👑* ou des *Jetons d'Indice Gratuits*.
- **Mode Contre-la-Montre (Time Attack 60s) ⚡** : résolvez un maximum de défis express en 60 secondes.

### 4. 🔐 Passeport Chiffré Anti-Triche & Mode Sandbox (`0000`)
- **Passeport Leaderboard (`SQLPASS...`)** : votre profil est exportable sous forme de clé chiffrée **AES-256-CBC + HMAC-SHA256** infalsifiable.
- **Mode Sandbox (`0000`)** : tapez le code secret `0000` pour déverrouiller instantanément les 35 niveaux sans contrainte.

---

## 🗺️ Programme des 35 Niveaux & 10 Chapitres

| Niveaux | Chapitre Académie | Compétences maîtrisées |
|---|---|---|
| **1 - 3** | **Chapitre 1 : Les Bases** | `SELECT`, colonnes ciblées, alias `AS`, `DISTINCT` |
| **4 - 8** | **Chapitre 2 : Filtrage** | `WHERE`, `AND`/`OR`, `BETWEEN`, `IN`, `LIKE`, `IS NULL` |
| **9 - 10** | **Chapitre 3 : Tri & Pagination** | `ORDER BY (ASC/DESC)`, `LIMIT`, `OFFSET` |
| **11 - 13** | **Chapitre 4 : Agrégations** | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, `HAVING` |
| **14 - 16** | **Chapitre 5 : Jointures** | `INNER JOIN`, `LEFT JOIN`, détection d'orphelins |
| **17 - 18** | **Chapitre 6 : Sous-requêtes** | `Subqueries` imbriquées, `CASE WHEN ... THEN ... ELSE ... END` |
| **19 - 20** | **Chapitre 7 : SQL Moderne** | `CTE (WITH)`, Fenêtrage `ROW_NUMBER() OVER (PARTITION BY ...)` |
| **21 - 25** | **Chapitre 8 : DML & DDL** | `INSERT INTO`, `UPDATE`, `DELETE`, `CREATE TABLE`, `ALTER TABLE` |
| **26 - 28** | **Chapitre 9 : Administration** | `CREATE VIEW`, `CREATE UNIQUE INDEX`, `BEGIN TRANSACTION / COMMIT` |
| **29 - 30** | **Chapitre 10A : Triggers** | `CREATE TRIGGER (AFTER UPDATE / AFTER INSERT)`, `OLD` & `NEW` |
| **31 - 32** | **Chapitre 7B : Analytique Pro** | Récursivité `WITH RECURSIVE`, décalage temporel `LAG() OVER (...)` |
| **33 - 35** | **Chapitre 10B : Procédures** | `CREATE PROCEDURE (...) BEGIN ... END;`, `CALL`, Architecture Boss Final |

---

## ⭐ Soutenez le projet !

Si ce projet vous plaît ou vous aide à maîtriser SQL :
👉 **Pensez à laisser une étoile (Star ⭐) en haut à droite sur [GitHub](https://github.com/7Bhil/SQL.git) !**
