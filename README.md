# Kobra — Gestionnaire de mots de passe

Kobra est un projet d’apprentissage réalisé en HTML, CSS et JavaScript. Il utilise un petit serveur local Python pour conserver une adresse stable dans le navigateur.

## Démarrer sans fenêtre de terminal

Double-clique sur **Lancer Kobra.vbs**. Le navigateur ouvre Kobra sans afficher de fenêtre noire. Pour arrêter le serveur local, double-clique sur **Arrêter Kobra.vbs**.

Si tu veux voir les messages de démarrage pour dépanner, utilise plutôt **Lancer Kobra.bat**. Python 3 doit être installé. Le serveur écoute uniquement sur `127.0.0.1`, donc il n’est pas exposé aux autres appareils du réseau.

## Données existantes et stockage

Le coffre utilise `localStorage`, le stockage local du navigateur. Le navigateur conserve les entrées entre les sessions tant que tu réutilises le même navigateur et la même adresse (`http://127.0.0.1:8765`). Il ne s’agit pas d’un fichier visible dans le dossier du projet.

Le stockage de pages ouvertes en double-cliquant sur `index.html` (`file://`) peut différer de celui de l’adresse locale du lanceur. Si des entrées apparaissent encore avec l’ancienne ouverture, exporte-les depuis **Paramètres**, démarre le lanceur, puis importe le fichier dans Kobra. L’ancienne copie n’est pas effacée.

## Interface de la version 2

- Navigation latérale sur ordinateur et barre de navigation en bas sur petit écran.
- Coffre avec recherche, filtre par catégorie, état vide et cartes d’identifiants.
- Formulaire d’ajout et de modification dans une fenêtre dédiée.
- Générateur avec longueur réglable et choix des catégories de caractères.
- Messages de confirmation intégrés, choix du thème et import/export JSON.
- Les anciennes entrées sans catégorie apparaissent sous « Autre ».

## Limites de sécurité

Cette application pédagogique **ne chiffre pas les données**. Les entrées sont conservées en clair dans le stockage du navigateur, et les sauvegardes JSON le sont aussi. Le masquage à l’écran n’est pas un verrouillage du coffre. N’utilise que des identifiants fictifs et ne publie jamais une sauvegarde contenant des secrets.

## Technologies

- HTML pour la structure
- CSS pour la présentation adaptative
- JavaScript natif pour les interactions et le stockage dans le navigateur
- Python standard pour servir l’application uniquement sur l’ordinateur local
