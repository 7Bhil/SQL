# 🏆 SQL Master CLI

Un programme interactif en ligne de commande (CLI) pour apprendre et maîtriser **SQL de A à Z** à travers une suite d'exercices pratiques progressifs, un système de comptes et une clé chiffrée anti-triche prête pour le Leaderboard.

---

## 🚀 Démarrage

Dans votre terminal, lancez :

```bash
npm start
```
*(ou `./src/cli.js`)*

---

## 🌟 Nouvelles fonctionnalités

### 1. 👤 Système de Comptes & Profils
- **Création de compte** & **Connexion** avec mot de passe haché par dérivation de clé sécurisée (`PBKDF2-SHA512`).
- Session locale persistée : vous restez connecté tant que vous ne vous déconnectez pas explicitement.
- Chaque niveau validé sur votre profil officiel vous rapporte **+100 points**.

### 2. 🔐 Clé Chiffrée Anti-Triche (Passeport Leaderboard)
- Accessible dans votre profil : **`SQLPASS.<iv>.<données_chiffrées>.<hmac>`**.
- Chiffrée avec **AES-256-CBC** et signée avec un **HMAC-SHA256**.
- **Anti-triche** : impossible de falsifier ses scores ou ses niveaux sans briser la signature d'authenticité.
- Prête pour synchroniser votre rang sur le futur Leaderboard mondial ou exporter votre progression !

### 3. 🔓 Mode Sandbox (Accès Libre)
- Accessible depuis l'accueil ou le menu principal.
- **Code secret** : `0000`
- Débloque **l'accès immédiat aux 20 niveaux sans prérequis** pour s'entraîner ou tester sans contrainte.
- *Remarque* : Les niveaux réussis en Sandbox ne modifient pas vos scores officiels.

---

## 📚 Parcours pédagogique (20 niveaux de A à Z)
1. **Les Bases** : `SELECT`, colonnes ciblées, alias `AS`, dédoublonnage `DISTINCT`.
2. **Filtrage** : `WHERE`, comparateurs, `AND`/`OR`, intervalles `BETWEEN`, listes `IN`, motifs `LIKE`, gestion du `NULL`.
3. **Tri & Pagination** : `ORDER BY`, `LIMIT`, `OFFSET`.
4. **Agrégations & Groupes** : `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`, `HAVING`.
5. **Jointures** : `INNER JOIN`, `LEFT JOIN`, recherche d'enregistrements orphelins.
6. **Sous-requêtes & Conditions** : Subqueries, `CASE WHEN ... THEN ... ELSE ... END`.
7. **Concepts Pro Avancés** : Common Table Expressions (`WITH`), fonctions de fenêtrage (`ROW_NUMBER() OVER (...)`).
