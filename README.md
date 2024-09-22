# ThreeSheets
Projet de DP M1 2023
- Lien du rapport : https://docs.google.com/document/d/1-rmvVEUu07bq_IHPQDr6nb4ojKGN5Bl2FFr5qBcOZUQ/edit?usp=sharing
- Lien de la documentation technique : https://docs.google.com/document/d/1BtZseVBbS6DA_T7FcCcALm9ylb35UAg2LNbuCxUFZ1c/edit?usp=sharing

## Structure du projet
### Architecture
```
/DB
/node_modules
/public
  /css
  /files
  /img
  /js
  /views
app.js
install_database.sh
package.json
route.js
routeBdd.js
routeFichier.js
```
### Contenu
- /DB est un dossier contenant les fichiers sql nécessaires à la base de données et un script pyhton permettant d'installer la base de données.
- /node_modules est un dossier cacher contenant toutes les dépendences installées avec npm dans le serveur.
- /public est un dossier contenant les dossier /css /files /img /js /views contenants respectivement les feuilles de style, les fichiers .xlsx enregistrés, des images et les pages HTML.
- app.js est un fichier JAVASCRIPT contenant la création du serveur node.js.
- package.json est un fichier JSON contenant des informations sur le serveur dont les versions des dépendences utilisées.
- route.js est un fichier JAVASCRIPT contenant toutes les routes pour l'accès aux pages HTML.
- routeBdd.js est un fichier JAVASCRIPT contenant toutes les routes vers des requêtes SQL présentes dans un autre fichier.
- routeFichier.js est un fichier JAVASCRIPT contenant toutes les routes utilisées pour la gestion des fichiers .xlsx.

## Configuration du projet
### Prérequis sous linux :
1. npm
   ```
   sudo apt install npm
   ```
2. Node.js
   ```
   sudo apt install nodejs
   ```
### Sous un environnement linux :
Les manipulations suivantes sont à effectuer à la racine du projet.
1. Installer la base de donnée.
   ```
   ./install_database.sh
   ```
2. Installer les dépendences.
   ```
    npm install
   ```
3. Lancer le serveur node.
   ```
   node app.js
   ```
4. Dans un navigateur, accéder à :
   ```
   http://localhost:8500/index
   ```
