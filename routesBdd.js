/* ######### Gestion des requetes de la base de données ######### */

const express = require('express');
const path = require("path"); // Importe le module 'path' pour gérer les chemins de fichiers
const fs = require('fs'); // Importe le module 'fs' pour gérer les fichiers
const router = express.Router();
const db = require('./public/js/gestionBdd');

 // On défini la toute pour la création d'un document dans la db
 router.post("/createFile", (req, res) => {
    const { titre, id } = req.body;
    db.createFile(titre, id, (err) => {
        if (err) {
            res.status(500).send('Erreur lors de la création du document. ' + err);
        } else {
            res.status(200).send('Document créé avec succès !');
        }
    });
});

// On défini la route pour la modification d'un document dans la db
router.post("/modifyFile", (req, res) => {

    console.log("Document : " + req.body.id + " " + req.body.titre);

    db.modifyFile(req.body.id, req.body.titre, (err) => {
        if (err) {
            res.status(500).send('Erreur lors de la modification du document.');
        } else {
            res.status(200).send('Document modifié avec succès !');
        }
    });
});

// On défini la route pour la récupération des documents dans la db
router.get("/get/:idCreateur", (req, res) => {
    db.getFiles(req.params.idCreateur, (err, rows) => {
        if (err) throw err;
        res.status(200).send(rows);
    });
});

// On défini la route pour la récupération de tout les comptes dans la db
router.get("/getAllUsers", (req, res) => {
    db.getAllUsers((err, rows) => {
        if (err) throw err;
        res.status(200).send(rows);
    });
});

// On défini la route pour la récupération de tout les documents dans la db
router.get("/getAll", (req, res) => {
    db.getAllFiles((err, rows) => {
        if (err) throw err;
        res.status(200).send(rows);
    });
});

// On défini la route pour récuper le dernier document dans la db
router.get("/getLastFile", (req, res) => {
    db.getLastFile((err, file) => {
        if (err) throw err;
        res.status(200).send(file);
    });
});

// On défini la route pour la récupération d'une documents partagés associés à un utilisateur dans la db
router.get("/getSharedDocumentsByUser/:id", (req, res) => {
    db.getSharedDocumentsByUser(req.params.id, (err, file) => {
        if (err) throw err;
        res.status(200).send(file);
    });
});


// On défini la route pour la modification d'un document dans la db
router.post("/edit", (req, res) => {
    db.editFile(req.body.id, req.body.titre, (err) => {
        if (err) throw err;
        res.status(200).send('Document modifié avec succès !');
    });
});

// On défini la route pour la récupération d'un document dans la db par son id
router.get("/getFileById/:id", (req, res) => {
    db.getFileById(req.params.id, (err, file) => {
        if (err) throw err;
        res.status(200).send(file);
    });
});


// On défini la route pour la suppression d'un document dans la db et dans le serveur
router.delete("/delete/:id", (req, res) => {
    db.getFileById(req.params.id, (err, file) => {
        if (err) {
            throw err;
        } else if (!file) {
            res.status(404).send('Document non trouvé !');
        } else {
            // On récupère les données de session puis l'id du compte connecté
            const sessionData = req.session;
            db.getIdByEmail(sessionData.email, (err, compte) => {
                if (err) throw err;
                // Si l'id du créateur du document est différent de l'id du compte connecté alors on peut pas supprimer le document
                if (file.idCreateur !== compte.idCompte) {
                    res.status(403).send('Vous n\'êtes pas autorisé à supprimer ce document');
                } else {
                    // Suppression du fichier .xlsx du serveur
                    const filePath = path.join(__dirname, 'public', 'files', file.titre + '.xlsx');
                    fs.unlink(filePath, (err) => {
                        // Si il y a une erreur lors de la suppression du fichier avec fs.unlink
                        if (err) {
                            console.error(err);
                            res.status(500).send('Erreur lors de la suppression du fichier');
                        } else {
                            // Suppression du document dans la base de données
                            db.deleteFile(req.params.id, (err) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('Erreur lors de la suppression du document dans la base de données');
                                } else {
                                    res.status(200).send('Document et fichier .xlsx supprimés avec succès !');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// On défini la route pour la récupération de l'idUser
router.get('/getIdUser', (req, res) => {
    const sessionData = req.session; // Accès aux données de session

    // On récupère l'id de l'utilisateur avec son email
    db.getIdByEmail(sessionData.email, (err, idUser) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération de l\'ID créateur');
            return;
        }
        res.status(200).json({ idUser: idUser });
    });
});

// On défini la route pour la récupération d'un utilisateur par la session
router.get('/getUser', (req, res) => {
    const sessionData = req.session; // Accès aux données de session

    // FOn récupère l'id du créateur avec son email
    db.getUserByEmail(sessionData.email, (err, user) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
            return;
        }
        res.status(200).json({ user: user });
    });
});

// On défini la route pour la récupération d'un utilisateur par son id
router.get('/getUserById/:id', (req, res) => {
    // FOn récupère l'id du créateur avec son email
    db.getUserById(req.params.id, (err, user) => {
        if (err) {
            res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
            return;
        }
        res.status(200).json({ user: user });
    });
});

// On défini la route pour l"ajout d'un utilisateur dans un document partagé
router.get('/shareDocument/:idDocument/:idCompte', (req, res) => {
    db.shareDocument(req.params.idDocument, req.params.idCompte, (err) => {
        if (err) {
            res.status(500).send('Erreur lors de l\'ajout de l\'utilisateur dans le document partagé');
            return;
        }
        res.status(200).send('Utilisateur ajouté avec succès !');
    });
});

// Route pour retirer un utilisateur d'un partage
router.get('/removeShare/:idDocument/:idCompte', (req, res) => {
    db.deleteShare(req.params.idDocument, req.params.idCompte, (err) => {
        if (err) {
            res.status(500).send('Erreur lors de la suppression de l\'utilisateur du partage');
            return;
        }
        res.status(200).send('Utilisateur retiré avec succès du partage !');
    });
});

// On défini la route pour savoir si un utilisateur a accès à un document
router.get('/hasAccess/:idDocument/:idCompte', (req, res) => {
    db.hasAccess(req.params.idDocument, req.params.idCompte, (err, hasAccess) => {
        if (err) {
            res.status(500).send('Erreur lors de la vérification des accès');
            return;
        }
        res.status(200).json({ hasAccess: hasAccess });
    });
});


// On exporte le module router
module.exports = router;