const db = require('./db');

/* Gestion des comptes */

function getUserByEmailAndPassword(email, motDePasse, callback) {
    db.get('SELECT * FROM compte WHERE email = ? AND mdp = ?', [email, motDePasse], callback);
}

function createUser(email, motDePasse, pseudo, callback) {
    db.run('INSERT INTO compte (email, mdp, pseudo) VALUES (?, ?, ?)', [email, motDePasse, pseudo], callback);
}

function getUserByEmail(email, callback) {
    db.get('SELECT idCompte, pseudo, email FROM compte WHERE email = ?', [email], callback);
}

function getUserById(id, callback) {
    db.get('SELECT idCompte, pseudo, email FROM compte WHERE idCompte = ?', [id], callback);
}

function getIdByEmail(email, callback) {
    db.get('SELECT idCompte FROM compte WHERE email = ?', [email], callback);
}

function getAllUsers(callback) { 
    db.all('SELECT * FROM compte', callback);
}


/* Gestion des documents */

// Requête qui créer un document et le partage avec le créateur
function createFile(titre, idCreateur, callback) {
    db.run(
        `INSERT INTO DOCUMENT (titre, idCreateur)
        SELECT ?, ? 
        WHERE NOT EXISTS (
            SELECT 1 FROM DOCUMENT WHERE titre = ? AND idCreateur = ?
        )`,
        [titre, idCreateur, titre, idCreateur],
        function(err) {
            if (err) {
                callback(err);
            } else {
                if (this.changes === 0) {
                    // Aucune insertion n'a été effectuée car le document existe déjà
                    callback(new Error('Le document existe déjà pour ce créateur avec ce titre.'));
                } else {
                    const lastId = this.lastID; // Récupère l'id du dernier enregistrement inséré
                    db.run('INSERT INTO PARTAGE (idDocument, idCompte) VALUES (?, ?)', [lastId, idCreateur], callback);
                }
            }
        }
    );
}

function modifyFile(idDocument, titre, callback) {
    db.run('UPDATE document SET titre = ? WHERE idDocument = ?', [titre, idDocument], callback);
}

function getFileById(idDocument, callback) {
    db.get('SELECT * FROM document WHERE idDocument = ?', [idDocument], callback);
}

function getLastFile(callback) {
    db.get('SELECT * FROM document ORDER BY idDocument DESC LIMIT 1', callback);
}

function getAllFiles(callback) {
    db.all('SELECT * FROM document', callback);
}

function editFile(id, titre, callback) {
    db.run('UPDATE document SET titre = ? WHERE id = ?', [titre, id], callback);
}

// Requête qui supprime un document et les partages associés
function deleteFile(idDocument, callback) {
    db.run('DELETE FROM DOCUMENT WHERE idDocument = ?', [idDocument], function(err)
     {
        if (err) {
            callback(err);
        } else {
            db.run('DELETE FROM PARTAGE WHERE idDocument = ?', [idDocument], callback);
        }
    });
}

/* Gestion des partages */

function getSharedDocumentsByUser(userId, callback) {
    db.all('SELECT * FROM DOCUMENT WHERE idDocument IN ' +
        '(SELECT idDocument FROM PARTAGE WHERE idCompte = ?);',
        [userId],
        callback);
}

function shareDocument(idDocument, idCompte, callback) {
    db.run('INSERT INTO PARTAGE (idDocument, idCompte) VALUES (?, ?)', [idDocument, idCompte], callback);
}

// Supprimer le partage d'un document pour un utilisateur spécifique
function deleteShare(idDocument, idCompte, callback) {
    db.run('DELETE FROM PARTAGE WHERE idDocument = ? AND idCompte = ?', [idDocument, idCompte], callback);
}

function hasAccess(idDocument, idCompte, callback) {
    db.get('SELECT * FROM PARTAGE WHERE idDocument = ? AND idCompte = ?', [idDocument, idCompte], callback);
}

module.exports = { getUserByEmailAndPassword, createUser, createFile, getFileById, editFile, deleteFile, getIdByEmail, getAllFiles, getUserByEmail, getUserById, getAllUsers, getSharedDocumentsByUser, shareDocument, deleteShare, hasAccess, getLastFile, modifyFile};