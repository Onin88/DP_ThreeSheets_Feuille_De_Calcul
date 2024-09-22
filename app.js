const express = require("express"); // Importe le module 'express' pour créer le serveur
const path = require("path"); // Importe le module 'path' pour gérer les chemins de fichiers
const app = express(); // Crée une application express
const routes = require("./routes"); // Importe le module 'routes'
const routesBdd = require("./routesBdd"); // Importe le module 'routesBdd' ou se trouve les requêtes SQL
const routesFichier = require("./routesFichier"); // Importe le module 'routesFichier' ou se trouve les requêtes de gestion de fichiers .xlsx
const bodyParser = require("body-parser"); // Importe le module 'body-parser' pour pouvoir récupérer les données des requêtes HTTP POST
const { log } = require("console");
const http = require('http').Server(app); // Importe le module 'http' pour créer le serveur
const io = require('socket.io')(http); // Importe le module 'socket.io' pour gérer les sockets
const port = 8500;

// Créer un objet pour stocker les identifiants des utilisateurs par document
const connectedUsersPerDocument = {};

app.get('/', (req, res) => {
    res.send('Hello World!');
});


// On récupère la liste des utilisateurs connectés à un document
function getConnectedUsers(documentId) {
    return Array.from(connectedUsersPerDocument[documentId] || []); // Convertit l'ensemble en tableau pour l'envoyer au client
}

// On défini la route pour la récupération des données de session
app.get('/infos-session', (req, res) => {
    const sessionData = req.session; // Accès aux données de session

    // Faites quelque chose avec les informations de session
    res.send(sessionData);
});



/* ######### Gestion des sockets ######### */

// On gere les sockets
io.on('connection', (socket) => {
    // Gestionnaire d'événements pour la connexion d'un utilisateur au serveur
    socket.on('join', (userId) => {
        // Si l'utilisateur n'est pas déjà connecté, on l'ajoute à l'ensemble
        console.log(`Utilisateur ${userId} connecté au serveur`);
    });

    // Gestionnaire d'événements pour la déconnexion d'un utilisateur au serveur
    socket.on('leave', (userId) => {
        console.log(`Utilisateur déconnecté : ${userId}`);
    });

    // Gestionnaire d'événements pour la connexion d'un utilisateur à un document
    socket.on('joinDocument', (documentId, userId) => {
        // Vérifier si le document existe dans connectedUsersPerDocument
        if (!connectedUsersPerDocument[documentId]) {
            connectedUsersPerDocument[documentId] = new Set();
        }

        // Si l'utilisateur n'est pas déjà connecté au document, l'ajouter à l'ensemble correspondant
        if (!connectedUsersPerDocument[documentId].has(userId.toString())) {
            connectedUsersPerDocument[documentId].add(userId.toString());
            console.log(`Utilisateur ${userId} connecté au document ${documentId}`);
        }
        
        // Envoi d'un événement à tous les clients du document pour informer de la nouvelle connexion à un document
        io.to(documentId).emit('newUser', { userId: userId, connectedUsers: getConnectedUsers(documentId) });
        socket.join(documentId); // Rejoindre la "room" du document avec l'ID correspondant
    });

    // Gestionnaire d'événements pour la déconnexion d'un utilisateur d'un document
    socket.on('leaveDocument', (documentId, userId) => {
        // Vérifier si le document existe dans connectedUsersPerDocument
        if (connectedUsersPerDocument[documentId] && connectedUsersPerDocument[documentId].has(userId.toString())) {
            connectedUsersPerDocument[documentId].delete(userId.toString());
            console.log(`Utilisateur ${userId} déconnecté du document ${documentId}`);
        }
        
        // Envoi d'un événement à tous les clients du document pour informer de la déconnexion à un document
        io.to(documentId).emit('leavingUser', { userId: userId, connectedUsers: getConnectedUsers(documentId) });
        socket.leave(documentId); // Quitter la "room" du document avec l'ID correspondant
    });

    // Gestionnaire d'événements pour la modification de texte dans une cellule d'un document
    socket.on('modificationTexte', (documentId, data) => {
        // Émettre la modification à tous les clients du document sauf à l'émetteur
        socket.to(documentId).emit('modificationTexte', data);
    });

    // Gestionnaire d'événements pour la modification du titre du fichier d'un document
    socket.on('modificationTitre', (documentId, data) => {
        // Émettre la modification à tous les clients du document sauf à l'émetteur
        socket.to(documentId).emit('modificationTitre', data);
    });

    // Gestionnaire d'événements pour la modification de style dans une cellule d'un document
    socket.on('modificationStyle', (documentId, data) => {
        // Émettre la modification à tous les clients du document sauf à l'émetteur
        socket.to(documentId).emit('modificationStyle', data);
    });

    // Gestionnaire d'événements pour la suppression d'un document
    socket.on('changeDocument', () => {
        // Émettre la suppression à tous les clients du document sauf à l'émetteur
        socket.broadcast.emit('changeDocument');
    });
})
  
// On lance le serveur sur le port 8500 avec socket.io
http.listen(port, () => {
    console.log(`Serveur lancé à l'adresse http://localhost:${port}/index`);
});



/* ######### Definition des routes ######### */

// Définissez votre chemin pour servir les fichiers statiques depuis node_modules
app.use(express.static(path.join(__dirname , "node_modules")));

// Définit le dossier 'public' comme dossier statique pour que l'on puisse accéder aux fichiers qu'il contient
app.use(express.static(path.join(__dirname, "public"))); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Utilise le module 'routes' pour gérer les routes
app.use("/", routes); 

// Utilise le module 'routesBdd' pour gérer les routes de la base de données
app.use("/", routesBdd);

// Utilise le module 'routesFichier' pour gérer les routes des fichiers .xlsx
app.use("/", routesFichier);