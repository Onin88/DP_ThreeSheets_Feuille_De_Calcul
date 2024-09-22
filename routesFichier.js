//* ######### Gestion des fichiers .xlsx ######### */

const express = require('express');
const path = require("path"); // Importe le module 'path' pour gérer les chemins de fichiers
const fs = require('fs'); // Importe le module 'fs' pour gérer les fichiers
const router = express.Router();
const iconv = require('iconv-lite');
const multer = require("multer");

// On définit le chemin du dossier contenant les .xlsx
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'files');
        // Vérifier si le dossier de destination existe, sinon le créer
        fs.access(uploadDir, (error) => {
            if (error) {
                // Le dossier n'existe pas, on le crée
                fs.mkdir(uploadDir, { recursive: true }, (err) => {
                    if (err) {
                        console.error('Erreur lors de la création du dossier :', err);
                        cb(err, null);
                    } else {
                        // Dossier créé, on indique à Multer le chemin
                        cb(null, uploadDir);
                    }
                });
            } else {
                // Le dossier existe déjà
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        const fileName = iconv.decode(file.originalname, 'utf-8'); // On décode le nom du fichier pour éviter les problèmes d'encodage
        cb(null, fileName);
    }
});

// On définit le type de fichier accepté
const upload = multer({ storage: storage });

// On définit la route pour l'upload du fichier .xlsx
router.post("/upload", upload.single('file'), (req, res) => {
    const oldFileName = req.body.oldFileName;

    if (oldFileName !== "") {
        // Supprimer le fichier existant
        fs.unlink(path.join(__dirname, 'public', 'files', oldFileName), (err) => {
            res.status(200).send('Fichier enregistré avec succès !');
        });
    } else {
        res.status(200).send('Fichier enregistré avec succès !');
    }
});

// On défini la route pour le téléchargement du fichier .xlsx
router.get("/download/:filename", (req, res) => {
    res.download(path.join(__dirname, 'public', 'files', req.params.filename));
});

// On défini la route pour la suppression du fichier .xlsx
router.get("/delete/:filename", (req, res) => {
    fs.unlink(path.join(__dirname, 'public', 'files', req.params.filename), (err) => {
        if (err) throw err;
        res.status(200).send('Fichier supprimé avec succès !');
    });
});

// On défini la route pour la modification du fichier .xlsx
router.post("/edit", (req, res) => {
    const workbook = xlsx.readFile(path.join(__dirname, 'public', 'files', req.body.filename));
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    worksheet['A1'].v = req.body.titre;
    xlsx.writeFile(workbook, path.join(__dirname, 'public', 'files', req.body.filename));
    res.status(200).send('Fichier modifié avec succès !');
});

// On exporte le module
module.exports = router;