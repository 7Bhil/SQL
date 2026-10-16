module.exports = [
  {
    id: 1,
    title: "Chapitre 1 : Introduction aux Bases de Données & SELECT",
    levels: [1, 2, 3],
    summary: "Comprendre les tables, les colonnes, les lignes, la projection SELECT, l'alias AS et DISTINCT.",
    content: `
=================================================================
📘 CHAPITRE 1 : LES BASES DE DONNÉES RELATIONNELLES & SELECT
=================================================================

1. QU'EST-CE QU'UNE TABLE SQL ?
-------------------------------
Imaginez une feuille Excel rigoureuse :
• Chaque COLONNE possède un nom et un type strict (INTEGER, TEXT, REAL).
• Chaque LIGNE (ou enregistrement / tuple) représente une entité unique.

  ┌────┬─────────┬───────────┐
  │ id │ nom     │ ville     │  <-- Colonnes (Attributs)
  ├────┼─────────┼───────────┤
  │ 1  │ Alice   │ Paris     │  <-- Ligne 1 (Enregistrement)
  │ 2  │ Bob     │ Lyon      │  <-- Ligne 2
  └────┴─────────┴───────────┘

2. LA COMMANDE SELECT
---------------------
Pour extraire et lire des données, on utilise SELECT :

  -- Sélectionner toutes les colonnes :
  SELECT * FROM utilisateurs;

  -- Sélectionner uniquement certaines colonnes :
  SELECT nom, ville FROM utilisateurs;

3. RENOMMER AVEC 'AS' (ALIAS)
-----------------------------
Pour rendre un rapport plus lisible, on renomme une colonne à l'affichage :

  SELECT nom AS client_nom, ville AS localisation FROM utilisateurs;

4. ÉLIMINER LES DOUBLONS AVEC 'DISTINCT'
----------------------------------------
Si 50 clients habitent à Paris, 'SELECT ville' affichera 50 fois 'Paris'.
Avec DISTINCT, chaque valeur n'apparaît qu'une seule fois :

  SELECT DISTINCT ville FROM utilisateurs;
`,
    exampleSetup: `
      CREATE TABLE utilisateurs (id INT, nom TEXT, ville TEXT);
      INSERT INTO utilisateurs VALUES (1, 'Alice', 'Paris'), (2, 'Bob', 'Lyon'), (3, 'Chloé', 'Paris');
    `,
    exampleQuery: "SELECT DISTINCT ville AS villes_uniques FROM utilisateurs;"
  },
  {
    id: 2,
    title: "Chapitre 2 : Filtrer avec précision (WHERE, LIKE, NULL)",
    levels: [4, 5, 6, 7, 8],
    summary: "Maîtriser WHERE, AND/OR, IN, BETWEEN, les motifs LIKE et le piège du NULL.",
    content: `
=================================================================
📘 CHAPITRE 2 : L'ART DU FILTRAGE AVEC 'WHERE'
=================================================================

1. LES OPÉRATEURS DE COMPARAISON
--------------------------------
La clause WHERE se place juste après FROM et filtre ligne par ligne :
  =   (égal)          != ou <> (différent)
  >   (supérieur)     >=       (supérieur ou égal)
  <   (inférieur)     <=       (inférieur ou égal)

  SELECT * FROM produits WHERE prix <= 100;

2. COMBINER LES CONDITIONS : AND / OR
-------------------------------------
• AND : TOUTES les conditions doivent être vraies.
• OR  : AU MOINS UNE condition doit être vraie.

  SELECT * FROM produits WHERE categorie = 'Audio' AND stock > 0;

3. INTERVALLES (BETWEEN) & LISTES (IN)
--------------------------------------
Au lieu d'écrire de longs 'OR' ou 'AND' :
  -- Intervalle inclusif :
  SELECT * FROM produits WHERE prix BETWEEN 20 AND 50;

  -- Liste de valeurs :
  SELECT * FROM clients WHERE ville IN ('Paris', 'Lyon', 'Lille');

4. RECHERCHE PARTIELLE DE TEXTE : LIKE
--------------------------------------
• '%' remplace 0, 1 ou plusieurs caractères.
• '_' remplace exactement 1 caractère.

  WHERE email LIKE '%@gmail.com'  --> Finit par @gmail.com
  WHERE nom LIKE 'A%'             --> Commence par A
  WHERE code LIKE '%PRO%'         --> Contient PRO n'importe où

5. LE PIÈGE MORTEL DU 'NULL'
----------------------------
En SQL, NULL signifie "Valeur inconnue / absente".
⚠️ Écrire "WHERE tel = NULL" NE MARCHE JAMAIS !
Il faut écrire :
  WHERE tel IS NULL
  WHERE tel IS NOT NULL
`,
    exampleSetup: `
      CREATE TABLE clients (id INT, nom TEXT, email TEXT, tel TEXT);
      INSERT INTO clients VALUES (1, 'Alice', 'alice@pro.fr', '0601'), (2, 'Bob', 'bob@gmail.com', NULL), (3, 'Adam', 'adam@pro.fr', NULL);
    `,
    exampleQuery: "SELECT nom, email FROM clients WHERE email LIKE '%@pro.fr' AND tel IS NULL;"
  },
  {
    id: 3,
    title: "Chapitre 3 : Tri & Pagination (ORDER BY, LIMIT, OFFSET)",
    levels: [9, 10],
    summary: "Ordonner les résultats en croissant/décroissant et créer des pages de résultats.",
    content: `
=================================================================
📘 CHAPITRE 3 : TRI & PAGINATION (ORDER BY / LIMIT / OFFSET)
=================================================================

1. TRIER AVEC ORDER BY
----------------------
• ASC  : Ordre croissant (A -> Z, 0 -> 9) [Par défaut]
• DESC : Ordre décroissant (Z -> A, 9 -> 0)

On peut trier sur plusieurs colonnes en cas d'ex-aequo :
  SELECT nom, note FROM films ORDER BY note DESC, nom ASC;

2. LIMITER ET PAGINER AVEC LIMIT & OFFSET
-----------------------------------------
Quand une table contient 1 million de lignes, on affiche par paquets :
• LIMIT N  : Ne garde que N lignes.
• OFFSET M : Saute les M premières lignes avant de commencer.

  -- Afficher le Top 3 :
  SELECT * FROM joueurs ORDER BY score DESC LIMIT 3;

  -- Sauter le 1er et prendre les 2 suivants (2e et 3e) :
  SELECT * FROM joueurs ORDER BY score DESC LIMIT 2 OFFSET 1;
`,
    exampleSetup: `
      CREATE TABLE joueurs (pseudo TEXT, score INT);
      INSERT INTO joueurs VALUES ('Neo', 950), ('Trinity', 1200), ('Morpheus', 800), ('Cypher', 400);
    `,
    exampleQuery: "SELECT pseudo, score FROM joueurs ORDER BY score DESC LIMIT 2 OFFSET 1;"
  },
  {
    id: 4,
    title: "Chapitre 4 : Agrégations, GROUP BY et HAVING",
    levels: [11, 12, 13],
    summary: "Calculer des statistiques par groupe et comprendre la différence entre WHERE et HAVING.",
    content: `
=================================================================
📘 CHAPITRE 4 : AGRÉGATIONS, GROUP BY & HAVING
=================================================================

1. LES 5 FONCTIONS D'AGRÉGATION
-------------------------------
• COUNT(*)   : Nombre de lignes
• SUM(col)   : Somme totale
• AVG(col)   : Moyenne
• MIN(col)   : Plus petite valeur
• MAX(col)   : Plus grande valeur

2. REGROUPER AVEC GROUP BY
--------------------------
GROUP BY rassemble les lignes qui ont la même valeur dans une colonne pour calculer une statistique par paquet :

  Table brute :                Après GROUP BY departement :
  ┌──────┬─────────┐           ┌──────┬───────────────┐
  │ dep  │ salaire │           │ dep  │ AVG(salaire)  │
  ├──────┼─────────┤   ===>    ├──────┼───────────────┤
  │ Tech │ 4000    │           │ Tech │ 4500          │
  │ Tech │ 5000    │           │ RH   │ 3000          │
  │ RH   │ 3000    │           └──────┴───────────────┘
  └──────┴─────────┘

3. LA DIFFÉRENCE VITALE : WHERE vs HAVING
-----------------------------------------
• WHERE  filtre les lignes individuelles AVANT le GROUP BY.
• HAVING filtre les groupes APRÈS le GROUP BY (sur les fonctions COUNT, AVG, SUM).

  SELECT departement, COUNT(*) AS nb, AVG(salaire) AS moy
  FROM employes
  WHERE salaire > 2000          -- 1. Filtre les employés
  GROUP BY departement          -- 2. Forme les groupes
  HAVING COUNT(*) >= 2;         -- 3. Garde les groupes d'au moins 2 personnes
`,
    exampleSetup: `
      CREATE TABLE employes (nom TEXT, dep TEXT, salaire INT);
      INSERT INTO employes VALUES ('A', 'Tech', 4000), ('B', 'Tech', 5000), ('C', 'RH', 3000);
    `,
    exampleQuery: "SELECT dep, COUNT(*) AS effectif, AVG(salaire) AS salaire_moyen FROM employes GROUP BY dep HAVING COUNT(*) > 1;"
  },
  {
    id: 5,
    title: "Chapitre 5 : Les Jointures Relationnelles (JOIN)",
    levels: [14, 15, 16],
    summary: "Relier plusieurs tables avec INNER JOIN, LEFT JOIN et trouver les données orphelines.",
    content: `
=================================================================
📘 CHAPITRE 5 : LES JOINTURES (INNER JOIN & LEFT JOIN)
=================================================================

1. CLÉ PRIMAIRE (PK) & CLÉ ÉTRANGÈRE (FK)
-----------------------------------------
Dans une base propre, on ne duplique pas les informations du client dans chaque commande. On met son 'id' (client_id) :

  [Table clients]             [Table commandes]
  id (PK) | nom               id | client_id (FK) | montant
  --------+--------           ---+----------------+--------
  1       | Alice   <======== 10 | 1              | 150€
  2       | Bob               11 | 1              | 200€

2. INNER JOIN (Intersection stricte)
------------------------------------
Ne garde QUE les lignes qui ont une correspondance dans LES DEUX tables.
(Ici, Bob n'apparaîtra pas car il n'a aucune commande).

  SELECT clients.nom, commandes.montant
  FROM clients
  INNER JOIN commandes ON clients.id = commandes.client_id;

3. LEFT JOIN (Priorité à la table de gauche)
--------------------------------------------
Garde TOUTES les lignes de la table de gauche (clients), même sans correspondance à droite (montant vaudra NULL pour Bob).

  SELECT clients.nom, commandes.montant
  FROM clients
  LEFT JOIN commandes ON clients.id = commandes.client_id;

4. ASTUCE PRO : DÉTECTER LES ORPHELINS
--------------------------------------
Comment trouver les clients qui n'ont JAMAIS commandé ?
Faites un LEFT JOIN et gardez uniquement ceux où la clé de droite est NULL !

  SELECT clients.nom
  FROM clients
  LEFT JOIN commandes ON clients.id = commandes.client_id
  WHERE commandes.id IS NULL;
`,
    exampleSetup: `
      CREATE TABLE clients (id INT, nom TEXT);
      CREATE TABLE commandes (id INT, client_id INT, montant INT);
      INSERT INTO clients VALUES (1, 'Alice'), (2, 'Bob');
      INSERT INTO commandes VALUES (10, 1, 150);
    `,
    exampleQuery: "SELECT clients.nom, commandes.montant FROM clients LEFT JOIN commandes ON clients.id = commandes.client_id;"
  },
  {
    id: 6,
    title: "Chapitre 6 : Sous-requêtes & Logique Conditionnelle (CASE)",
    levels: [17, 18],
    summary: "Imbriquer un SELECT dans un autre et créer des colonnes dynamiques avec CASE WHEN.",
    content: `
=================================================================
📘 CHAPITRE 6 : SOUS-REQUÊTES & CASE WHEN
=================================================================

1. LES SOUS-REQUÊTES (SUBQUERIES)
---------------------------------
Comment trouver les produits plus chers que la moyenne sans connaître la moyenne à l'avance ?
En plaçant une requête entre parenthèses !

  SELECT nom, prix
  FROM produits
  WHERE prix > (SELECT AVG(prix) FROM produits);

2. LOGIQUE IF / ELSE EN SQL : CASE WHEN
---------------------------------------
Le bloc CASE WHEN ... THEN ... ELSE ... END permet de transformer des valeurs à la volée :

  SELECT nom, prix,
    CASE
      WHEN prix >= 100 THEN 'Premium'
      WHEN prix >= 30  THEN 'Standard'
      ELSE 'Économique'
    END AS gamme
  FROM produits;
`,
    exampleSetup: `
      CREATE TABLE produits (nom TEXT, prix INT);
      INSERT INTO produits VALUES ('Câble', 10), ('Clavier', 60), ('Écran', 300);
    `,
    exampleQuery: "SELECT nom, prix, CASE WHEN prix > (SELECT AVG(prix) FROM produits) THEN 'Cher' ELSE 'Abordable' END AS categorie_prix FROM produits;"
  },
  {
    id: 7,
    title: "Chapitre 7 : CTE (WITH), Récursivité & Fonctions de Fenêtrage",
    levels: [19, 20, 31, 32],
    summary: "Écrire du SQL modulaire avec WITH, parcourir des arbres et classer avec OVER(PARTITION BY).",
    content: `
=================================================================
📘 CHAPITRE 7 : CTE (WITH), RÉCURSIVITÉ & WINDOW FUNCTIONS
=================================================================

1. LES CTE (Common Table Expressions - WITH)
--------------------------------------------
Au lieu d'imbriquer des sous-requêtes illisibles, 'WITH' crée une table temporaire nommée très propre :

  WITH ventes_par_vendeur AS (
    SELECT vendeur_id, SUM(montant) AS total FROM ventes GROUP BY vendeur_id
  )
  SELECT * FROM ventes_par_vendeur WHERE total > 1000;

2. LES CTE RÉCURSIVES (WITH RECURSIVE)
--------------------------------------
Permet à une requête de s'appeler elle-même ! Idéal pour générer des suites ou parcourir un organigramme (Chef -> Sous-chef -> Employé) :

  WITH RECURSIVE compteur(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM compteur WHERE n < 5
  )
  SELECT n FROM compteur;

3. LES FONCTIONS DE FENÊTRAGE (WINDOW FUNCTIONS)
------------------------------------------------
Contrairement à GROUP BY qui écrase les lignes, 'OVER (...)' ajoute un calcul ou un classement tout en gardant chaque ligne intacte :

• ROW_NUMBER() OVER (PARTITION BY dep ORDER BY salaire DESC) : Numérote 1, 2, 3 dans chaque département.
• LAG(col, 1) OVER (ORDER BY mois) : Récupère la valeur de la ligne précédente (parfait pour comparer avec le mois d'avant !).
`,
    exampleSetup: `
      CREATE TABLE revenus (mois INT, ca INT);
      INSERT INTO revenus VALUES (1, 1000), (2, 1350), (3, 1200);
    `,
    exampleQuery: "SELECT mois, ca, LAG(ca, 1) OVER (ORDER BY mois) AS ca_mois_precedent FROM revenus;"
  },
  {
    id: 8,
    title: "Chapitre 8 : Écriture & Modification de Schéma (DML & DDL)",
    levels: [21, 22, 23, 24, 25],
    summary: "Insérer (INSERT), modifier (UPDATE), supprimer (DELETE), créer et altérer des tables.",
    content: `
=================================================================
📘 CHAPITRE 8 : MANIPULATION (DML) & ARCHITECTURE (DDL)
=================================================================

1. AJOUTER DES LIGNES : INSERT INTO
-----------------------------------
  INSERT INTO clients (nom, ville) VALUES ('Lucas', 'Nantes');

2. METTRE À JOUR : UPDATE ... SET ... WHERE
-------------------------------------------
  UPDATE produits SET stock = stock - 1, prix = 49.99 WHERE id = 10;
  ⚠️ Sans WHERE, toute la table est écrasée !

3. SUPPRIMER : DELETE FROM ... WHERE
------------------------------------
  DELETE FROM paniers WHERE expire = 1;

4. CRÉER UNE TABLE : CREATE TABLE
---------------------------------
  CREATE TABLE utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT NOT NULL UNIQUE,
    points INTEGER DEFAULT 0
  );

5. MODIFIER UNE TABLE EXISTANTE : ALTER TABLE
---------------------------------------------
  ALTER TABLE utilisateurs ADD COLUMN actif INTEGER DEFAULT 1;
`,
    exampleSetup: `
      CREATE TABLE scores (id INTEGER PRIMARY KEY, joueur TEXT, pts INT);
      INSERT INTO scores VALUES (1, 'Alice', 100);
    `,
    exampleQuery: "INSERT INTO scores VALUES (2, 'Bob', 250); UPDATE scores SET pts = pts + 50 WHERE joueur = 'Alice'; SELECT * FROM scores;"
  },
  {
    id: 9,
    title: "Chapitre 9 : Vues, Index & Transactions ACID",
    levels: [26, 27, 28],
    summary: "Créer des vues virtuelles (VIEW), optimiser avec INDEX et sécuriser avec BEGIN/COMMIT.",
    content: `
=================================================================
📘 CHAPITRE 9 : VUES (VIEW), INDEX & TRANSACTIONS ACID
=================================================================

1. LES VUES (CREATE VIEW)
-------------------------
Une Vue est une requête enregistrée qui s'utilise comme une table virtuelle.
Parfait pour simplifier des jointures complexes ou cacher des colonnes sensibles (comme les mots de passe ou salaires) :

  CREATE VIEW vue_clients_public AS
  SELECT id, nom, ville FROM clients;

  -- Ensuite on l'interroge comme une vraie table :
  SELECT * FROM vue_clients_public;

2. LES INDEX (CREATE INDEX)
---------------------------
Sans index, la base doit lire toutes les lignes une par une (Full Table Scan).
Un index crée un arbre de recherche ultra-rapide (B-Tree) sur une ou plusieurs colonnes :

  CREATE INDEX idx_clients_email ON clients(email);

3. LES TRANSACTIONS ACID (BEGIN / COMMIT / ROLLBACK)
----------------------------------------------------
Lors d'un virement bancaire, il faut débiter A et créditer B. Si le serveur plante entre les deux, l'argent disparaît !
Une Transaction garantit que TOUT réussit ou RIEN ne s'applique :

  BEGIN TRANSACTION;
    UPDATE comptes SET solde = solde - 100 WHERE id = 1;
    UPDATE comptes SET solde = solde + 100 WHERE id = 2;
  COMMIT;
`,
    exampleSetup: `
      CREATE TABLE comptes (id INT, titulaire TEXT, solde INT);
      INSERT INTO comptes VALUES (1, 'Alice', 500), (2, 'Bob', 200);
    `,
    exampleQuery: "BEGIN TRANSACTION; UPDATE comptes SET solde = solde - 150 WHERE id = 1; UPDATE comptes SET solde = solde + 150 WHERE id = 2; COMMIT; SELECT * FROM comptes;"
  },
  {
    id: 10,
    title: "Chapitre 10 : Triggers & Procédures Stockées (Niveau Expert)",
    levels: [29, 30, 33, 34, 35],
    summary: "Automatiser la base avec CREATE TRIGGER et programmer des Procédures Stockées (CREATE PROCEDURE / CALL).",
    content: `
=================================================================
📘 CHAPITRE 10 : TRIGGERS & PROCÉDURES STOCKÉES (DBA SENIOR)
=================================================================

1. LES DÉCLENCHEURS AUTOMATIQUES (TRIGGERS)
-------------------------------------------
Un Trigger est un programme qui se déclenche AUTOMATIQUEMENT avant (BEFORE) ou après (AFTER) un INSERT, UPDATE ou DELETE sur une table.
• 'NEW.colonne' désigne la nouvelle valeur insérée/modifiée.
• 'OLD.colonne' désigne l'ancienne valeur avant modification/suppression.

Exemple : Enregistrer automatiquement un journal d'audit quand un salaire change :

  CREATE TRIGGER audit_salaire
  AFTER UPDATE ON employes
  BEGIN
    INSERT INTO logs (employe_id, ancien_salaire, nouveau_salaire)
    VALUES (OLD.id, OLD.salaire, NEW.salaire);
  END;

2. LES PROCÉDURES STOCKÉES (CREATE PROCEDURE & CALL)
----------------------------------------------------
Une Procédure Stockée est une fonction enregistrée dans la base de données qui accepte des paramètres et exécute une suite d'opérations SQL critiques :

  -- 1. Déclaration de la procédure :
  CREATE PROCEDURE crediter_compte(c_id INT, montant REAL)
  BEGIN
    UPDATE comptes SET solde = solde + montant WHERE id = c_id;
  END;

  -- 2. Appel de la procédure :
  CALL crediter_compte(1, 250);
`,
    exampleSetup: `
      CREATE TABLE comptes (id INT, nom TEXT, solde REAL);
      CREATE TABLE historique (compte_id INT, nouveau_solde REAL);
      INSERT INTO comptes VALUES (1, 'Alice', 1000);
    `,
    exampleQuery: `CREATE TRIGGER log_solde AFTER UPDATE ON comptes BEGIN INSERT INTO historique VALUES (NEW.id, NEW.solde); END;
CREATE PROCEDURE ajouter_bonus(c_id INT, bonus REAL) BEGIN UPDATE comptes SET solde = solde + bonus WHERE id = c_id; END;
CALL ajouter_bonus(1, 500);
SELECT * FROM historique;`
  }
];
