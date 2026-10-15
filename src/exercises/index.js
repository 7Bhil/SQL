module.exports = [
  {
    id: 1,
    title: "Introduction à SELECT et projection basique",
    category: "1. Les Bases (SELECT)",
    lesson: `Bienvenue dans votre aventure SQL ! 🚀
La commande fondamentale en SQL pour lire des données est SELECT.
Syntaxe de base :
  SELECT colonne1, colonne2 FROM nom_de_table;
  SELECT * FROM nom_de_table; -- '*' signifie toutes les colonnes`,
    task: "Sélectionnez toutes les colonnes de la table `utilisateurs`.",
    setupSql: `
      CREATE TABLE utilisateurs (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        ville TEXT,
        age INTEGER
      );
      INSERT INTO utilisateurs VALUES 
        (1, 'Alice', 'Paris', 28),
        (2, 'Bob', 'Lyon', 34),
        (3, 'Charlie', 'Marseille', 22),
        (4, 'Diana', 'Paris', 30);
    `,
    expectedQuery: "SELECT * FROM utilisateurs;",
    orderMatters: false,
    hints: [
      "Pour sélectionner tout, utilisez le symbole étoile '*'.",
      "La syntaxe est : SELECT * FROM utilisateurs;"
    ]
  },
  {
    id: 2,
    title: "Sélection de colonnes ciblées et alias (AS)",
    category: "1. Les Bases (SELECT)",
    lesson: `En production, il est recommandé de spécifier uniquement les colonnes nécessaires plutôt que 'SELECT *'.
On peut également renommer une colonne dans le résultat grâce au mot-clé 'AS' :
  SELECT nom AS pseudo, age FROM utilisateurs;`,
    task: "Affichez uniquement le nom (renommé en 'nom_complet') et la ville de chaque utilisateur.",
    setupSql: `
      CREATE TABLE utilisateurs (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        ville TEXT,
        age INTEGER
      );
      INSERT INTO utilisateurs VALUES 
        (1, 'Alice', 'Paris', 28),
        (2, 'Bob', 'Lyon', 34),
        (3, 'Charlie', 'Marseille', 22);
    `,
    expectedQuery: "SELECT nom AS nom_complet, ville FROM utilisateurs;",
    orderMatters: false,
    hints: [
      "Utilisez le mot-clé AS pour renommer la colonne `nom`.",
      "Syntaxe : SELECT nom AS nom_complet, ville FROM utilisateurs;"
    ]
  },
  {
    id: 3,
    title: "Éliminer les doublons avec DISTINCT",
    category: "1. Les Bases (SELECT)",
    lesson: `Lorsque plusieurs lignes ont la même valeur dans une colonne, 'DISTINCT' supprime les doublons du résultat.
Syntaxe :
  SELECT DISTINCT ville FROM utilisateurs;`,
    task: "Affichez la liste unique de toutes les villes présentes dans la table `clients`.",
    setupSql: `
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        ville TEXT
      );
      INSERT INTO clients VALUES 
        (1, 'TechCorp', 'Paris'),
        (2, 'DevStudio', 'Lyon'),
        (3, 'DataWave', 'Paris'),
        (4, 'CloudFlow', 'Bordeaux'),
        (5, 'AI-Lab', 'Lyon');
    `,
    expectedQuery: "SELECT DISTINCT ville FROM clients;",
    orderMatters: false,
    hints: [
      "Pensez au mot-clé DISTINCT juste après SELECT.",
      "Syntaxe : SELECT DISTINCT ville FROM clients;"
    ]
  },
  {
    id: 4,
    title: "Filtrage simple avec WHERE",
    category: "2. Filtrage & Conditions (WHERE)",
    lesson: `La clause 'WHERE' permet d'extraire uniquement les lignes répondant à un critère.
Opérateurs de comparaison : =, != (ou <>), <, >, <=, >=.
Exemple :
  SELECT * FROM produits WHERE prix > 50;`,
    task: "Affichez tous les produits dont le prix est strictement supérieur à 100.",
    setupSql: `
      CREATE TABLE produits (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        categorie TEXT,
        prix REAL,
        stock INTEGER
      );
      INSERT INTO produits VALUES 
        (1, 'Clavier Mécanique', 'Informatique', 89.99, 15),
        (2, 'Écran 4K', 'Informatique', 299.99, 8),
        (3, 'Souris Ergonomique', 'Informatique', 45.00, 30),
        (4, 'Casque Audio Pro', 'Audio', 149.50, 10),
        (5, 'Câble USB-C', 'Accessoires', 12.00, 50);
    `,
    expectedQuery: "SELECT * FROM produits WHERE prix > 100;",
    orderMatters: false,
    hints: [
      "Filtrez à l'aide de WHERE prix > 100.",
      "Syntaxe : SELECT * FROM produits WHERE prix > 100;"
    ]
  },
  {
    id: 5,
    title: "Conditions logiques (AND, OR, NOT)",
    category: "2. Filtrage & Conditions (WHERE)",
    lesson: `On peut combiner plusieurs critères avec AND (les deux doivent être vrais) et OR (au moins un doit être vrai).
Exemple :
  SELECT * FROM clients WHERE ville = 'Paris' AND age >= 18;`,
    task: "Trouvez tous les produits de la catégorie 'Informatique' dont le stock est supérieur ou égal à 10.",
    setupSql: `
      CREATE TABLE produits (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        categorie TEXT,
        prix REAL,
        stock INTEGER
      );
      INSERT INTO produits VALUES 
        (1, 'Clavier', 'Informatique', 89.99, 15),
        (2, 'Écran 4K', 'Informatique', 299.99, 4),
        (3, 'Souris', 'Informatique', 45.00, 25),
        (4, 'Enceinte', 'Audio', 120.00, 12);
    `,
    expectedQuery: "SELECT * FROM produits WHERE categorie = 'Informatique' AND stock >= 10;",
    orderMatters: false,
    hints: [
      "Combinez les deux filtres avec AND.",
      "Syntaxe : SELECT * FROM produits WHERE categorie = 'Informatique' AND stock >= 10;"
    ]
  },
  {
    id: 6,
    title: "Intervalles et listes : BETWEEN et IN",
    category: "2. Filtrage & Conditions (WHERE)",
    lesson: `'BETWEEN min AND max' filtre les valeurs dans un intervalle inclusif.
'IN (val1, val2, ...)' filtre parmi une série de valeurs autorisées.
Exemple :
  SELECT * FROM employes WHERE departement IN ('Ventes', 'Marketing');
  SELECT * FROM employes WHERE salaire BETWEEN 30000 AND 45000;`,
    task: "Sélectionnez le nom et la note des restaurants situés dans les villes 'Paris', 'Nantes' ou 'Lille' ayant une note comprise entre 4 et 5 (inclus).",
    setupSql: `
      CREATE TABLE restaurants (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        ville TEXT,
        note REAL
      );
      INSERT INTO restaurants VALUES 
        (1, 'Le Gourmet', 'Paris', 4.5),
        (2, 'Bistrot du Coin', 'Paris', 3.8),
        (3, 'La Crêperie', 'Nantes', 4.2),
        (4, 'Friterie Nord', 'Lille', 4.9),
        (5, 'Pasta Bella', 'Marseille', 4.7),
        (6, 'Snack Express', 'Lille', 3.2);
    `,
    expectedQuery: "SELECT nom, note FROM restaurants WHERE ville IN ('Paris', 'Nantes', 'Lille') AND note BETWEEN 4 AND 5;",
    orderMatters: false,
    hints: [
      "Utilisez ville IN ('Paris', 'Nantes', 'Lille') et note BETWEEN 4 AND 5.",
      "Attention à ne sélectionner que `nom, note` !"
    ]
  },
  {
    id: 7,
    title: "Recherche textuelle avec LIKE et Wilcards",
    category: "2. Filtrage & Conditions (WHERE)",
    lesson: `'LIKE' permet de rechercher selon un motif textuel :
- '%' représente 0, 1 ou plusieurs caractères quelconques.
- '_' représente exactement un seul caractère quelconque.
Exemple :
  WHERE email LIKE '%@gmail.com'; -- finit par @gmail.com
  WHERE nom LIKE 'A%'; -- commence par A`,
    task: "Sélectionnez tous les utilisateurs dont l'adresse email se termine par '@entreprise.fr'.",
    setupSql: `
      CREATE TABLE employes (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        email TEXT
      );
      INSERT INTO employes VALUES 
        (1, 'Jean Dupont', 'jean@entreprise.fr'),
        (2, 'Sarah Connor', 'sarah@skynet.com'),
        (3, 'Paul Martin', 'paul.martin@entreprise.fr'),
        (4, 'Julie Bernard', 'julie@gmail.com');
    `,
    expectedQuery: "SELECT * FROM employes WHERE email LIKE '%@entreprise.fr';",
    orderMatters: false,
    hints: [
      "Utilisez le symbole '%' au début de votre chaîne de recherche.",
      "Syntaxe : SELECT * FROM employes WHERE email LIKE '%@entreprise.fr';"
    ]
  },
  {
    id: 8,
    title: "Gestion des valeurs nulles (IS NULL / IS NOT NULL)",
    category: "2. Filtrage & Conditions (WHERE)",
    lesson: `En SQL, NULL représente l'absence de valeur. On ne peut JAMAIS tester '= NULL' car NULL n'est égal à rien.
Il faut impérativement utiliser 'IS NULL' ou 'IS NOT NULL'.`,
    task: "Affichez le nom et le numéro de téléphone des clients qui n'ont PAS renseigné de téléphone (colonne 'telephone' nulle).",
    setupSql: `
      CREATE TABLE contacts (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        telephone TEXT
      );
      INSERT INTO contacts VALUES 
        (1, 'Alice', '0601020304'),
        (2, 'Bob', NULL),
        (3, 'Claire', '0708091011'),
        (4, 'David', NULL);
    `,
    expectedQuery: "SELECT nom, telephone FROM contacts WHERE telephone IS NULL;",
    orderMatters: false,
    hints: [
      "Utilisez WHERE telephone IS NULL.",
      "Syntaxe : SELECT nom, telephone FROM contacts WHERE telephone IS NULL;"
    ]
  },
  {
    id: 9,
    title: "Trier les résultats avec ORDER BY",
    category: "3. Tri & Limitation (ORDER BY & LIMIT)",
    lesson: `'ORDER BY' permet d'ordonner les lignes selon une ou plusieurs colonnes :
- ASC (croissant, par défaut)
- DESC (décroissant)
Exemple :
  SELECT nom, score FROM joueurs ORDER BY score DESC, nom ASC;`,
    task: "Affichez tous les livres triés par note du plus apprécié au moins apprécié (décroissant). En cas d'égalité, triez par titre alphabétique (croissant).",
    setupSql: `
      CREATE TABLE livres (
        id INTEGER PRIMARY KEY,
        titre TEXT,
        note REAL
      );
      INSERT INTO livres VALUES 
        (1, 'Le Petit Prince', 4.8),
        (2, '1984', 4.9),
        (3, 'Dune', 4.9),
        (4, 'Germinal', 4.3);
    `,
    expectedQuery: "SELECT * FROM livres ORDER BY note DESC, titre ASC;",
    orderMatters: true,
    hints: [
      "ORDER BY s'applique avec plusieurs colonnes séparées par une virgule.",
      "Syntaxe : SELECT * FROM livres ORDER BY note DESC, titre ASC;"
    ]
  },
  {
    id: 10,
    title: "Limiter et paginer avec LIMIT et OFFSET",
    category: "3. Tri & Limitation (ORDER BY & LIMIT)",
    lesson: `'LIMIT n' limite le nombre de lignes renvoyées à n.
'OFFSET m' saute les m premières lignes (essentiel pour la pagination web !).
Exemple :
  SELECT * FROM articles ORDER BY date_publi DESC LIMIT 5 OFFSET 10;`,
    task: "Affichez le 2ème et le 3ème article les plus chers (sautez le 1er article le plus cher et affichez les 2 suivants), triés par prix décroissant.",
    setupSql: `
      CREATE TABLE articles (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        prix REAL
      );
      INSERT INTO articles VALUES 
        (1, 'Article A', 500),
        (2, 'Article B', 1200),
        (3, 'Article C', 300),
        (4, 'Article D', 800),
        (5, 'Article E', 150);
    `,
    expectedQuery: "SELECT * FROM articles ORDER BY prix DESC LIMIT 2 OFFSET 1;",
    orderMatters: true,
    hints: [
      "Triez par prix DESC d'abord.",
      "Utilisez LIMIT 2 OFFSET 1."
    ]
  },
  {
    id: 11,
    title: "Fonctions d'agrégation (COUNT, SUM, AVG, MIN, MAX)",
    category: "4. Agrégations & Groupements",
    lesson: `Les fonctions d'agrégation effectuent un calcul sur l'ensemble d'une colonne :
- COUNT(col) ou COUNT(*) : compte le nombre de lignes
- SUM(col) : somme des valeurs
- AVG(col) : moyenne
- MIN(col) / MAX(col) : valeur minimale / maximale
Exemple :
  SELECT COUNT(*) AS total_clients, AVG(age) AS age_moyen FROM clients;`,
    task: "Calculez le nombre total d'employés (nommé 'nb_employes'), le salaire moyen ('salaire_moyen'), et le salaire maximal ('salaire_max').",
    setupSql: `
      CREATE TABLE salaries (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        salaire REAL
      );
      INSERT INTO salaries VALUES 
        (1, 'Alice', 3200),
        (2, 'Bob', 2800),
        (3, 'Charles', 4500),
        (4, 'Diane', 3500);
    `,
    expectedQuery: "SELECT COUNT(*) AS nb_employes, AVG(salaire) AS salaire_moyen, MAX(salaire) AS salaire_max FROM salaries;",
    orderMatters: false,
    hints: [
      "Utilisez COUNT(*), AVG(salaire) et MAX(salaire) avec leurs alias respectifs AS.",
      "Syntaxe : SELECT COUNT(*) AS nb_employes, AVG(salaire) AS salaire_moyen, MAX(salaire) AS salaire_max FROM salaries;"
    ]
  },
  {
    id: 12,
    title: "Regroupement avec GROUP BY",
    category: "4. Agrégations & Groupements",
    lesson: `'GROUP BY' regroupe les lignes ayant des valeurs communes pour leur appliquer une fonction d'agrégation par groupe.
Exemple :
  SELECT ville, COUNT(*) AS nb_habitants FROM habitants GROUP BY ville;`,
    task: "Pour chaque catégorie de produits, affichez la catégorie et le montant total de la valeur du stock (somme de prix * stock) renommé 'valeur_stock'.",
    setupSql: `
      CREATE TABLE inventaire (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        categorie TEXT,
        prix REAL,
        stock INTEGER
      );
      INSERT INTO inventaire VALUES 
        (1, 'Souris', 'Accessoires', 20, 10),
        (2, 'Tapis', 'Accessoires', 15, 20),
        (3, 'PC Gamer', 'Ordinateurs', 1200, 2),
        (4, 'Laptop Pro', 'Ordinateurs', 1500, 3);
    `,
    expectedQuery: "SELECT categorie, SUM(prix * stock) AS valeur_stock FROM inventaire GROUP BY categorie;",
    orderMatters: false,
    hints: [
      "On peut multiplier à l'intérieur de SUM() : SUM(prix * stock).",
      "N'oubliez pas GROUP BY categorie."
    ]
  },
  {
    id: 13,
    title: "Filtrer les groupes avec HAVING",
    category: "4. Agrégations & Groupements",
    lesson: `ATTENTION : 'WHERE' filtre les lignes AVANT le groupement.
Pour filtrer sur le résultat d'une fonction d'agrégation, il faut utiliser 'HAVING' APRÈS le GROUP BY.
Exemple :
  SELECT departement, COUNT(*) AS nb FROM employes GROUP BY departement HAVING COUNT(*) > 5;`,
    task: "Affichez les départements et leur salaire moyen (nommé 'salaire_moyen') uniquement pour les départements qui ont plus de 1 employé.",
    setupSql: `
      CREATE TABLE personnel (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        departement TEXT,
        salaire REAL
      );
      INSERT INTO personnel VALUES 
        (1, 'Alice', 'Tech', 4000),
        (2, 'Bob', 'Tech', 4200),
        (3, 'Charlie', 'RH', 3000),
        (4, 'Diana', 'Ventes', 3500),
        (5, 'Éric', 'Ventes', 3600),
        (6, 'Fiona', 'Ventes', 3800);
    `,
    expectedQuery: "SELECT departement, AVG(salaire) AS salaire_moyen FROM personnel GROUP BY departement HAVING COUNT(*) > 1;",
    orderMatters: false,
    hints: [
      "Utilisez GROUP BY departement suivi de HAVING COUNT(*) > 1.",
      "WHERE ne fonctionne pas sur COUNT(*), il faut utiliser HAVING !"
    ]
  },
  {
    id: 14,
    title: "Jointure interne : INNER JOIN",
    category: "5. Les Jointures (JOIN)",
    lesson: `INNER JOIN relie les lignes de deux tables qui partagent une clé correspondante dans les deux tables.
Syntaxe :
  SELECT a.col1, b.col2 
  FROM tableA a
  INNER JOIN tableB b ON a.b_id = b.id;`,
    task: "Affichez le nom du client et le montant de chacune de ses commandes en reliant la table `clients` et `commandes`.",
    setupSql: `
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY,
        nom TEXT
      );
      CREATE TABLE commandes (
        id INTEGER PRIMARY KEY,
        client_id INTEGER,
        montant REAL
      );
      INSERT INTO clients VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
      INSERT INTO commandes VALUES (101, 1, 150.0), (102, 1, 200.0), (103, 2, 75.5);
    `,
    expectedQuery: "SELECT clients.nom, commandes.montant FROM clients INNER JOIN commandes ON clients.id = commandes.client_id;",
    orderMatters: false,
    hints: [
      "Joignez clients avec commandes ON clients.id = commandes.client_id.",
      "Syntaxe : SELECT clients.nom, commandes.montant FROM clients INNER JOIN commandes ON clients.id = commandes.client_id;"
    ]
  },
  {
    id: 15,
    title: "Jointure externe gauche : LEFT JOIN",
    category: "5. Les Jointures (JOIN)",
    lesson: `'LEFT JOIN' conserve TOUTES les lignes de la table de gauche, même si aucune correspondance n'existe dans la table de droite (dans ce cas, les colonnes de droite sont NULL).
Exemple :
  SELECT u.nom, c.montant FROM utilisateurs u LEFT JOIN commandes c ON u.id = c.user_id;`,
    task: "Affichez tous les utilisateurs (colonne 'nom') et le montant de leurs commandes. Les utilisateurs sans commande doivent également apparaître (avec un montant NULL).",
    setupSql: `
      CREATE TABLE utilisateurs (
        id INTEGER PRIMARY KEY,
        nom TEXT
      );
      CREATE TABLE commandes (
        id INTEGER PRIMARY KEY,
        utilisateur_id INTEGER,
        montant REAL
      );
      INSERT INTO utilisateurs VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
      INSERT INTO commandes VALUES (10, 1, 50.0), (11, 1, 80.0);
    `,
    expectedQuery: "SELECT utilisateurs.nom, commandes.montant FROM utilisateurs LEFT JOIN commandes ON utilisateurs.id = commandes.utilisateur_id;",
    orderMatters: false,
    hints: [
      "Utilisez LEFT JOIN commandes ON utilisateurs.id = commandes.utilisateur_id.",
      "Charlie apparaîtra avec NULL pour le montant."
    ]
  },
  {
    id: 16,
    title: "Trouver les éléments orphelins (LEFT JOIN + WHERE IS NULL)",
    category: "5. Les Jointures (JOIN)",
    lesson: `Une technique classique pour trouver les enregistrements d'une table A qui N'ONT PAS d'enregistrement lié dans la table B est de faire un LEFT JOIN et de filtrer avec 'WHERE tableB.cle IS NULL'.`,
    task: "Trouvez le nom des clients qui n'ont JAMAIS passé la moindre commande.",
    setupSql: `
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY,
        nom TEXT
      );
      CREATE TABLE commandes (
        id INTEGER PRIMARY KEY,
        client_id INTEGER,
        total REAL
      );
      INSERT INTO clients VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie'), (4, 'Diana');
      INSERT INTO commandes VALUES (101, 1, 100), (102, 3, 250);
    `,
    expectedQuery: "SELECT clients.nom FROM clients LEFT JOIN commandes ON clients.id = commandes.client_id WHERE commandes.id IS NULL;",
    orderMatters: false,
    hints: [
      "Faites un LEFT JOIN sur commandes puis filtrez WHERE commandes.id IS NULL.",
      "Seuls Bob et Diana n'ont pas passé de commande."
    ]
  },
  {
    id: 17,
    title: "Sous-requêtes dans WHERE (Subqueries)",
    category: "6. Sous-requêtes & Conditions avancées",
    lesson: `Une sous-requête est une requête imbriquée à l'intérieur d'une autre.
Exemple :
  SELECT * FROM employes WHERE salaire > (SELECT AVG(salaire) FROM employes);`,
    task: "Affichez le nom et le prix de tous les articles dont le prix est strictement supérieur au prix moyen de l'ensemble des articles.",
    setupSql: `
      CREATE TABLE articles (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        prix REAL
      );
      INSERT INTO articles VALUES 
        (1, 'Souris', 20),
        (2, 'Clavier', 60),
        (3, 'Écran', 300),
        (4, 'Tapis', 10),
        (5, 'Casque', 110);
    `,
    expectedQuery: "SELECT nom, prix FROM articles WHERE prix > (SELECT AVG(prix) FROM articles);",
    orderMatters: false,
    hints: [
      "Placez la sous-requête entre parenthèses : (SELECT AVG(prix) FROM articles).",
      "Syntaxe : SELECT nom, prix FROM articles WHERE prix > (SELECT AVG(prix) FROM articles);"
    ]
  },
  {
    id: 18,
    title: "Conditionnel avec CASE WHEN ... THEN ... ELSE ... END",
    category: "6. Sous-requêtes & Conditions avancées",
    lesson: `'CASE' permet d'écrire des conditions if/else directement dans une projection SELECT.
Syntaxe :
  SELECT nom,
    CASE 
      WHEN age < 18 THEN 'Mineur'
      WHEN age >= 18 THEN 'Majeur'
      ELSE 'Inconnu'
    END AS statut
  FROM personnes;`,
    task: "Affichez le nom de l'élève, sa note et une colonne nommée 'statut' qui vaut 'Admis' si la note >= 10, sinon 'Recalé'.",
    setupSql: `
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        eleve TEXT,
        note REAL
      );
      INSERT INTO notes VALUES 
        (1, 'Lucas', 14.5),
        (2, 'Emma', 8.0),
        (3, 'Noah', 10.0),
        (4, 'Chloé', 6.5);
    `,
    expectedQuery: "SELECT eleve, note, CASE WHEN note >= 10 THEN 'Admis' ELSE 'Recalé' END AS statut FROM notes;",
    orderMatters: false,
    hints: [
      "Structurez avec CASE WHEN note >= 10 THEN 'Admis' ELSE 'Recalé' END AS statut.",
      "Syntaxe : SELECT eleve, note, CASE WHEN note >= 10 THEN 'Admis' ELSE 'Recalé' END AS statut FROM notes;"
    ]
  },
  {
    id: 19,
    title: "Common Table Expressions (CTE - WITH)",
    category: "7. Requêtes Avancées & Fenêtrage",
    lesson: `Le mot-clé 'WITH' permet de créer une ou plusieurs tables temporaires nommées (CTE - Common Table Expression) pour rendre les requêtes complexes beaucoup plus lisibles et modulaires.
Syntaxe :
  WITH stats_salaires AS (
    SELECT departement, AVG(salaire) AS moyenne FROM employes GROUP BY departement
  )
  SELECT * FROM stats_salaires WHERE moyenne > 3000;`,
    task: "Utilisez un WITH (CTE nommé 'ventes_totales') pour calculer le total des ventes par commercial (commercial_id, total). Puis affichez le nom du commercial et son total en joignant avec la table `commerciaux`.",
    setupSql: `
      CREATE TABLE commerciaux (
        id INTEGER PRIMARY KEY,
        nom TEXT
      );
      CREATE TABLE ventes (
        id INTEGER PRIMARY KEY,
        commercial_id INTEGER,
        montant REAL
      );
      INSERT INTO commerciaux VALUES (1, 'Marc'), (2, 'Sophie'), (3, 'Julien');
      INSERT INTO ventes VALUES 
        (10, 1, 1500), (11, 1, 2300),
        (12, 2, 4000), (13, 2, 1200),
        (14, 3, 800);
    `,
    expectedQuery: `WITH ventes_totales AS (
  SELECT commercial_id, SUM(montant) AS total FROM ventes GROUP BY commercial_id
)
SELECT commerciaux.nom, ventes_totales.total 
FROM commerciaux 
INNER JOIN ventes_totales ON commerciaux.id = ventes_totales.commercial_id;`,
    orderMatters: false,
    hints: [
      "Déclarez WITH ventes_totales AS (SELECT commercial_id, SUM(montant) AS total FROM ventes GROUP BY commercial_id).",
      "Puis faites un SELECT ... FROM commerciaux INNER JOIN ventes_totales ..."
    ]
  },
  {
    id: 20,
    title: "Fonctions de fenêtrage : ROW_NUMBER() OVER (...)",
    category: "7. Requêtes Avancées & Fenêtrage",
    lesson: `Les fonctions de fenêtrage (Window Functions) calculent des valeurs sur un jeu de lignes lié à la ligne courante sans écraser les lignes individuelles (contrairement à GROUP BY).
'ROW_NUMBER() OVER (PARTITION BY dep ORDER BY salaire DESC)' attribue un rang de 1 à N dans chaque groupe (partition).`,
    task: "Affichez le nom, le département, le salaire et le rang salarial au sein de chaque département (nommé 'rang' calculé avec ROW_NUMBER() ordonné par salaire décroissant).",
    setupSql: `
      CREATE TABLE personnel (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        departement TEXT,
        salaire REAL
      );
      INSERT INTO personnel VALUES 
        (1, 'Alice', 'Tech', 4500),
        (2, 'Bob', 'Tech', 3800),
        (3, 'Charlie', 'Tech', 5200),
        (4, 'Diane', 'RH', 3200),
        (5, 'Éric', 'RH', 3400);
    `,
    expectedQuery: "SELECT nom, departement, salaire, ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC) AS rang FROM personnel;",
    orderMatters: false,
    hints: [
      "Utilisez ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC) AS rang.",
      "Ne pas utiliser de GROUP BY classique car nous voulons conserver toutes les lignes individuelles."
    ]
  },
  {
    id: 21,
    title: "Insertion de données avec INSERT INTO",
    category: "8. Modification de Données (DML)",
    lesson: `Pour insérer de nouvelles lignes dans une table, on utilise la commande INSERT INTO :
Syntaxe :
  INSERT INTO table (colonne1, colonne2) VALUES (valeur1, valeur2);
Puis on peut vérifier avec un SELECT.`,
    task: "Insérez un nouvel utilisateur nommé 'Lucas', habitant à 'Bordeaux', âgé de 26 ans dans la table `membres`, puis affichez tous les membres triés par nom.",
    setupSql: `
      CREATE TABLE membres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        ville TEXT,
        age INTEGER
      );
      INSERT INTO membres (nom, ville, age) VALUES ('Alice', 'Paris', 25), ('Bob', 'Lyon', 30);
    `,
    expectedQuery: "INSERT INTO membres (nom, ville, age) VALUES ('Lucas', 'Bordeaux', 26); SELECT * FROM membres ORDER BY nom;",
    orderMatters: true,
    hints: [
      "Exécutez l'INSERT suivi de SELECT * FROM membres ORDER BY nom;.",
      "Syntaxe : INSERT INTO membres (nom, ville, age) VALUES ('Lucas', 'Bordeaux', 26); SELECT * FROM membres ORDER BY nom;"
    ]
  },
  {
    id: 22,
    title: "Mise à jour ciblée avec UPDATE ... WHERE",
    category: "8. Modification de Données (DML)",
    lesson: `Pour mettre à jour des données existantes, on utilise UPDATE avec SET.
ATTENTION : n'oubliez JAMAIS la clause WHERE, sinon TOUTES les lignes de la table seront modifiées !
Syntaxe :
  UPDATE clients SET statut = 'VIP' WHERE depenses > 1000;`,
    task: "Augmentez le salaire de tous les employés du département 'Tech' de 500 euros, puis affichez tous les employés par salaire décroissant.",
    setupSql: `
      CREATE TABLE employes (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        departement TEXT,
        salaire REAL
      );
      INSERT INTO employes VALUES 
        (1, 'Alice', 'Tech', 3500),
        (2, 'Bob', 'RH', 2800),
        (3, 'Charlie', 'Tech', 4000);
    `,
    expectedQuery: "UPDATE employes SET salaire = salaire + 500 WHERE departement = 'Tech'; SELECT * FROM employes ORDER BY salaire DESC;",
    orderMatters: true,
    hints: [
      "Utilisez UPDATE employes SET salaire = salaire + 500 WHERE departement = 'Tech';",
      "Puis affichez avec SELECT * FROM employes ORDER BY salaire DESC;"
    ]
  },
  {
    id: 23,
    title: "Suppression contrôlée avec DELETE FROM",
    category: "8. Modification de Données (DML)",
    lesson: `Pour supprimer des lignes, on utilise DELETE FROM table WHERE condition.
Tout comme UPDATE, omettre le WHERE supprime l'intégralité des données de la table !`,
    task: "Supprimez tous les produits dont le stock est égal à 0, puis affichez la liste restante des produits triés par id.",
    setupSql: `
      CREATE TABLE inventaire (
        id INTEGER PRIMARY KEY,
        nom TEXT,
        stock INTEGER
      );
      INSERT INTO inventaire VALUES 
        (1, 'Clavier', 5),
        (2, 'Souris HS', 0),
        (3, 'Écran', 3),
        (4, 'Vieux Câble', 0);
    `,
    expectedQuery: "DELETE FROM inventaire WHERE stock = 0; SELECT * FROM inventaire ORDER BY id;",
    orderMatters: true,
    hints: [
      "Supprimez avec DELETE FROM inventaire WHERE stock = 0;",
      "Puis affichez avec SELECT * FROM inventaire ORDER BY id;"
    ]
  },
  {
    id: 24,
    title: "Création de table avec CREATE TABLE et contraintes",
    category: "9. Définition de Schéma (DDL)",
    lesson: `La commande CREATE TABLE définit la structure, les types de colonnes et les contraintes :
- PRIMARY KEY : identifiant unique
- NOT NULL : champ obligatoire
- UNIQUE : valeur non duplicable
Exemple :
  CREATE TABLE pays (id INTEGER PRIMARY KEY, nom TEXT NOT NULL UNIQUE);`,
    task: "Créez une table nommée `abonnements` avec 3 colonnes : `id` (INTEGER PRIMARY KEY), `formule` (TEXT NOT NULL), et `prix` (REAL). Insérez ensuite la ligne (1, 'Premium', 19.99) et affichez la table.",
    setupSql: "",
    expectedQuery: "CREATE TABLE abonnements (id INTEGER PRIMARY KEY, formule TEXT NOT NULL, prix REAL); INSERT INTO abonnements VALUES (1, 'Premium', 19.99); SELECT * FROM abonnements;",
    orderMatters: false,
    hints: [
      "CREATE TABLE abonnements (id INTEGER PRIMARY KEY, formule TEXT NOT NULL, prix REAL);",
      "Puis insérez avec INSERT INTO abonnements VALUES (1, 'Premium', 19.99); et sélectionnez tout."
    ]
  },
  {
    id: 25,
    title: "Évolution de schéma avec ALTER TABLE",
    category: "9. Définition de Schéma (DDL)",
    lesson: `Quand une table existe déjà en production, on ne la recrée pas : on utilise ALTER TABLE pour ajouter une nouvelle colonne.
Syntaxe :
  ALTER TABLE utilisateurs ADD COLUMN pays TEXT DEFAULT 'France';`,
    task: "Ajoutez une nouvelle colonne `actif` de type INTEGER avec la valeur par défaut 1 à la table `comptes`, puis affichez tous les comptes.",
    setupSql: `
      CREATE TABLE comptes (
        id INTEGER PRIMARY KEY,
        identifiant TEXT
      );
      INSERT INTO comptes VALUES (1, 'admin'), (2, 'guest');
    `,
    expectedQuery: "ALTER TABLE comptes ADD COLUMN actif INTEGER DEFAULT 1; SELECT * FROM comptes;",
    orderMatters: false,
    hints: [
      "Utilisez ALTER TABLE comptes ADD COLUMN actif INTEGER DEFAULT 1;",
      "Puis faites un SELECT * FROM comptes;"
    ]
  }
];

