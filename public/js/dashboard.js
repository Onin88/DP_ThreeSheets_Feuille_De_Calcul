// On établi une connexion Socket.IO avec le serveur pour la mise à jour en temps réel
let socket = io() // Connexion au serveur Socket.IO

// On écoute les événements de connexion d'un utilisateur au chargement de la page
window.addEventListener('pageshow', (event) => {
    // On notifie le serveur de la connexion d'un utilisateur
    socket.emit('join');
});

// On envoie un événement au serveur pour signaler la déconnexion d'un utilisateur quand il quitte la page ou navigue en arrière
window.addEventListener('beforeunload', function() {
    // Déconnexion du socket lorsque l'utilisateur quitte la page ou navigue en arrière
    socket.emit('leave');
    socket.disconnect();
});

// Si le créateur d'un document le supprime, on recharge les documents
socket.on('changeDocument', () => {
    afficherDocuments();
});

// Fonction pour récupérer et afficher tous les documents
async function afficherDocuments() {
    try {
        // On récupère l'id du créateur
        const id = await getIdUser();

        // Récupération de tous les documents
        const response = await fetch('/getSharedDocumentsByUser/' + id.idUser.idCompte);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des documents');
        }
        // Conversion de la réponse en JSON
        const documents = await response.json();

        // On récupère la balise qui contiendra les documents
        const fichiersContainer = document.querySelector('.fichiers-existants');
        fichiersContainer.innerHTML = ''; // Pour vider le contenu existant

        // On parcourt tous les documents
        documents.forEach((doc) => {
            // On génère le div global
            const newDiv = document.createElement('div');
            newDiv.classList.add("col");
            newDiv.classList.add('btn-new');

            // On génère l'icône
            const iconImg = document.createElement('img');
            iconImg.src = '/img/icon.png'; // Choisir l'icône appropriée
            iconImg.alt = '';
            iconImg.classList.add('btn-icon');
            iconImg.onclick = () => window.location.href = `/feuille/?idDocument=${doc.idDocument}`; // Rediriger vers la page du document

            // On génère le span pour le texte
            const spanText = document.createElement('span');
            spanText.classList.add('btn-text');
            spanText.textContent = doc.titre; // Utiliser le titre du document

            // On génère l'icône pour supprimer le document
            const deleteIcon = document.createElement('span');
            deleteIcon.classList.add('delete-icon');
            deleteIcon.textContent = '❌';
            deleteIcon.onclick = () => supprimerDocument(doc.idDocument); // Fonction pour supprimer le document

            // On ajoute les éléments au div global
            newDiv.appendChild(iconImg);
            newDiv.appendChild(spanText);
            newDiv.appendChild(deleteIcon);
            fichiersContainer.appendChild(newDiv);
        });
    } catch (error) {
        console.error(error);
    }
}

// Fonction pour supprimer un document et le .xlsx associé
async function supprimerDocument(idDocument) {
    try {
        // Suppression du fichier .xlsx du serveur et du document dans la base de données
        const response = await fetch(`/delete/${idDocument}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }

        // On affiche un toast pour confirmer la suppression
        afficherToast('Document supprimé avec succès !', 'success');

        // On actualise la liste des documents pour les utilisateurs connectés
        socket.emit('changeDocument');

        afficherDocuments(); // On actualise la liste des documents après la suppression
    } catch (error) {
        // On affiche un toast avec le message d'erreur
        const modalMessage = error.message || 'Erreur inconnue';
        afficherToast(modalMessage, 'danger');
    }
}

// On récupère l'id de l'utilisateur connecté
async function getIdUser(){
    return fetch('/getIdUser')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }
            return response.json(); // Récupération des données de session au format JSON
        });
}

// Affichage d'un tosat pour les erreus, messages, ...
function afficherToast(message, type) {
    // On récupère le toast et on l'affiche avec le message en paramètre
    const alertDiv = document.getElementById('alert');
    alertDiv.querySelector(".toast-body").textContent = message;

    // On change la couleur de fond du toast en fonction du type de message (success, danger)
    alertDiv.classList.add(`text-bg-${type}`);

    // Création de l'objet Toast à partir de l'élément récupéré
    const alert = new bootstrap.Toast(alertDiv);

    // Affichage du toast
    alert.show();

    // Supprime l'alerte après 3 secondes
    setTimeout(() => {
        alert.hide();
    }, 3000); 
}