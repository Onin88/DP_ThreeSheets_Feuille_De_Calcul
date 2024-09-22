const gestionBdd = require('./public/js/gestionBdd.js');
const express = require('express');
const router = express.Router();
let session = require('express-session');
let fs = require('fs');

// Crée des sessions avec des identifiants uniques pour chaque utilisateur
router.use(session({secret: "C'est notre secret !"}));

// Route pour la page d'accueil
router.use("/index", (req, res) => { 
    res.sendFile(__dirname + `/public/views/index.html`);
});

// Route pour la page d'accueil
router.use("/feuille", (req, res) => {
    // Si l'utilisateur est connecté
    if(req.session.log){

        // On affiche la page de la feuille de calcul
        res.sendFile(__dirname + `/public/views/feuille.html`);

    } else{
        // Sinon redirige vers la page de connexion
        res.redirect('/connexion');
    }
    
});

// Route pour la page de connexion
router.use("/connexion", (req, res) => { 
    res.sendFile(__dirname + `/public/views/connexion.html`);
});

// Route quand on soumet le formulaire de connexion
router.post("/submit_connexion", (req, res) => {
    gestionBdd.getUserByEmailAndPassword(req.body.email, req.body.password, (err, row) => {

        // Si une erreur est survenue lors de la récupération des données
        if (err) {
            console.log(err);
            res.status(500).send("Erreur lors de la récupération des données");

        // Si l'email et le mot de passe correspondent
        } else if (row) {
            req.session.log = true;
            req.session.pseudo = row.pseudo;
            req.session.email = row.email;
            res.redirect('/dashboard');
        
        // Si l'email et/ou le mot de passe ne correspondent pas
        } else {
            fs.readFile(__dirname + `/public/views/connexion.html`, 'utf8', function(err, data){
                    
                // Si une erreur est survenue lors de la lecture du fichier HTML
                if (err) {
                    return console.log(err);
                }

                // Insère du texte dans la page HTML pour indiquer que la connexion a échoué
                let result = data.replace(/<p id="erreur">/g, '<p id="erreur">Erreur lors de la connexion');
                
                // Envoie la page HTML modifiée
                res.send(result);
            });
        }
    });
});


// Route pour le dashboard du compte
router.get("/dashboard", (req, res) => {

    // Si l'utilisateur est connecté
    if(req.session.log){

        // Récupère les données de l'utilisateur
        console.log(req.session);

        fs.readFile(__dirname + `/public/views/dashboard.html`, 'utf8', function(err, data){
                        
                // Si une erreur est survenue lors de la lecture du fichier HTML
                if (err) {
                    return console.log(err);
                }
    
                // Insère du texte dans la page HTML pour indiquer que la connexion a échoué
                let result = data.replace(/<p id="pseudo">/g, '<p id="pseudo">' + req.session.pseudo);
                
                // Envoie la page HTML modifiée
                res.send(result);
            });
    } else{
        
        // Sinon redirige vers la page de connexion
        res.redirect('/connexion');
    }});


    
// Route pour se déconnecter
router.get("/logout", (req, res) => {

    // Détruit la session
    req.session.destroy();

    // Redirige vers la page d'accueil
    res.redirect('/index');
});



// Route pour la page de création de compte
router.use("/inscription", (req, res) => { 
    res.sendFile(__dirname + `/public/views/inscription.html`);
});




// Route quand on soumet le formulaire de création de compte
router.post("/submit_inscription", (req, res) => {
    console.log(req.body);
    gestionBdd.createUser(req.body.email, req.body.password, req.body.pseudo, (err, row) => {
        // Si une erreur est survenue quand on essaye d'insérer les données
        if (err) {
            console.log(err);

            // Lit le fichier HTML de la page d'inscription
            fs.readFile(__dirname + `/public/views/inscription.html`, 'utf8', function(err, data){

                // Si une erreur est survenue lors de la lecture du fichier HTML
                if (err) {
                    return console.log(err);
                }

                // Insère du texte dans la page HTML pour indiquer que l'inscription a échoué
                let result = data.replace(/<p id="erreur">/g, '<p id="erreur">Erreur lors de l\'inscription');
                
                // Envoie la page HTML modifiée
                res.send(result);
            });
        }

        // Si les données ont bien été insérées
        else {
            req.session.log = true;
            req.session.pseudo = req.body.pseudo;
            req.session.email = req.body.email;
            res.redirect('/dashboard');
        }


    });
});

module.exports = router;