const fileName = document.getElementById('file-name'); // Nom du fichier
const oldFileName = document.getElementById('old-file-name'); // Ancien nom du fichier
const editButton = document.querySelector('.edit-button'); // Bouton d'édition du nom du fichier
let fileNameText = fileName.textContent; // Texte du nom du fichier
let idCell = 0; // Identifiant de la cellule cliquée

// On selectionne la première cellule
selectCellContents(document.getElementById('cell_1_1'));

// On écoute les événements de modification de texte
socket.on('modificationTexte', (data) => {
    const cell = document.getElementById(data.idCellule); // Récupérer la cellule modifiée

    cell.textContent = data.nouveauTexte; // Modifier le texte de la cellule
    console.log("Recoit Cell : " + data.idCellule + " -- Modif : " + data.nouveauTexte);
});

// On écoute les événements de modification de texte
socket.on('modificationTitre', (data) => {
    fileName.textContent = data.nouveauTitre; // Modifier le titre du fichier

    // On actualise la liste des documents pour les utilisateurs connectés
    socket.emit('modificationTitre');
});

// On écoute les événements de modification de style
socket.on('modificationStyle', (data) => {
    const cell = document.getElementById(data.idCellule); // Récupérer la cellule modifiée
    
    // Modifier le style de la cellule
    cell.style.fontWeight = data.fontWeight;
    cell.style.fontStyle = data.fontStyle;
    cell.style.textDecoration = data.textDecoration;
    cell.style.color = data.color;
    cell.style.backgroundColor = data.backgroundColor;
    cell.classList.remove('text-start', 'text-center', 'text-end');
    cell.classList.add(data.textAlign);
});

// Si le créateur d'un document le supprime, on redirige vers le dashboard
socket.on('changeDocument', () => {
    window.location.href = '/dashboard';
});

// On ecoute le click sur le bouton d'edition du nom du fichier
editButton.addEventListener('click', function() {
    fileName.contentEditable = 'true'; // On active l'édition du nom du fichier
    fileName.focus();

    // On récupère l'ancien nom du fichier
    oldFileName.value = fileName.textContent + ".xlsx";
});

// On regarde si on appuie sur la touche entrée ou echap
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        // On désactive l'édition du nom du fichier
        fileName.contentEditable = 'false';
        fileNameText = fileName.textContent; // On récupère le nouveau nom du fichier

        // On récupère l'id du document dans l'url
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const idDocument = urlParams.get('idDocument');

        // On notifie le serveur de la modification du titre pour l'autre utilisateur
        socket.emit('modificationTitre', idDocument, { nouveauTitre: fileNameText });
    } else if (event.key === 'Escape') {
        // On désactive l'édition du nom du fichier
        fileName.contentEditable = 'false';

        // Annuler les modifications et restaurer l'ancien texte
        fileName.textContent = fileNameText; // Remplacer 'oldText' par le texte d'origine
    }
});

// On notifie le serveur de la modification de texte pour l'autre utilisateur
function onTextChange(id) {
    // On récupère la cellule modifiée
    const cell = document.getElementById(id);
    console.log("Envoi Cell : " + id + " -- Modif : " + cell.textContent);

    // On récupère l'id du document dans l'url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idDocument = urlParams.get('idDocument');

    // Émettre un événement pour signaler la modification de texte
    socket.emit('modificationTexte', idDocument, { idCellule: id, nouveauTexte: cell.textContent });
}


// Écouteurs d'événements pour les boutons de la barre d'outils
document.addEventListener('DOMContentLoaded', function () {
    const boldButton = document.querySelector('.toolbar .btn:nth-of-type(1)');
    const italicButton = document.querySelector('.toolbar .btn:nth-of-type(2)');
    const underlineButton = document.querySelector('.toolbar .btn:nth-of-type(3)');
    const textAlignmentLeftButton = document.querySelector('.toolbar .btn:nth-of-type(4)');
    const textAlignmentCenterButton = document.querySelector('.toolbar .btn:nth-of-type(5)');
    const textAlignmentRightButton = document.querySelector('.toolbar .btn:nth-of-type(6)');
    const backgroundColorText = document.querySelector('.toolbar .btn:nth-of-type(8)');
    const backgroundColorCell = document.querySelector('.toolbar .btn:nth-of-type(7)');


    // On gère le click sur le colorpicker du texte
    backgroundColorText.addEventListener('click', function () {
        backgroundColorText.click();
    });

    // On gère le click sur le colorpicker du fond
    backgroundColorCell.addEventListener('click', function () {
        backgroundColorCell.click();
    });


    // On gere le click sur une cellule
    const cells = document.querySelectorAll('.spreadsheet td[contenteditable="false"]');

    cells.forEach(cell => {
        let clicks = 0;
        cell.addEventListener('click', function(event) {
            cell.contentEditable = false; // On désactive l'édition de la cellule pour un simple clic
            clicks++;
            if (clicks === 1) {
                setTimeout(function() {
                     // Supprime la classe 'selected-cell' des cellules précédemment sélectionnées
                    const previouslySelectedCells = document.querySelectorAll('.selected-cell');
                    previouslySelectedCells.forEach(prevCell => {
                        prevCell.classList.remove('selected-cell');
                    });

                    if (clicks === 1) {
                        // Sélection simple
                        selectCellContents(event.target);
                    } else {
                        // Double-clic, entrer dans la cellule
                        enterCell(event.target);
                    }
                    clicks = 0;
                }, 250); // Délai pour distinguer le simple-clic du double-clic
            }
        });
    });

    function enterCell(cell) {
        // On active l'édition de la cellule
        cell.contentEditable = true;
        cell.focus();
    }

    // Gras
    boldButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On met en gras la cellule cliquée si elle ne l'est pas sinon on enlève le gras
        (cell.style.fontWeight === 'bold') ? cell.style.fontWeight = 'normal' : cell.style.fontWeight = 'bold';

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    //  Italique
    italicButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On met en italique la cellule cliquée si elle ne l'est pas sinon on enlève l'italique
        (cell.style.fontStyle === 'italic') ? cell.style.fontStyle = 'normal' : cell.style.fontStyle = 'italic';

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Souligner
    underlineButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On souligne la cellule cliquée si elle ne l'est pas sinon on enlève le soulignement
        (cell.style.textDecoration === 'underline') ? cell.style.textDecoration = 'none' : cell.style.textDecoration = 'underline';

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Aligner à gauche
    textAlignmentLeftButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On aligne à gauche la cellule cliquée si elle ne l'est pas sinon on enlève l'alignement
        if (!cell.classList.contains("text-start")) {
            cell.classList.add("text-start");
            cell.classList.remove("text-center", "text-end");
        }

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Aligner au centre
    textAlignmentCenterButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On aligne au centre la cellule cliquée si elle ne l'est pas sinon on enlève l'alignement
        if (!cell.classList.contains("text-center")) {
            cell.classList.add("text-center");
            cell.classList.remove("text-start", "text-end");
        }

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Aligner à droite
    textAlignmentRightButton.addEventListener('click', function () {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On aligne à droite la cellule cliquée si elle ne l'est pas sinon on enlève l'alignement
        if (!cell.classList.contains("text-end")) {
            cell.classList.add("text-end");
            cell.classList.remove("text-start", "text-center");
        }

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Changer la couleur de fond par rapport au colorpicker
    backgroundColorText.addEventListener('change', function (event) {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On recupere la couleur selectionnée
        const selectedColor = event.target.value;

        // On change la couleur de fond de la cellule cliquée si elle est blanche sinon on la met en blanc
        (cell.style.backgroundColor != "white") ? cell.style.backgroundColor = selectedColor : cell.style.backgroundColor = "white";

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });

    // Changer la couleur de texte par rapport au colorpicker
    backgroundColorCell.addEventListener('change', function (event) {
        // On récupère la cellule cliquée
        const cell = document.getElementById(idCell);

        // On recupere la couleur selectionnée
        const selectedColor = event.target.value;

        // On change la couleur de fond de la cellule cliquée si elle est blanche sinon on la met en blanc
        (cell.style.color != "white") ? cell.style.color = selectedColor : cell.style.color = "white";

        // On notifie le serveur de la modification de style pour l'autre utilisateur
        notifyServer(idCell);
    });
});

// Fonction pour selectionner une cellule
function selectCellContents(cell) {
    // On remet la couleur de fond de la ligne et de la colonne de la cellule cliquée à table-secondary
    let elements = document.querySelectorAll('.table-secondary');
    elements.forEach(element => {
        element.style.backgroundColor = 'lightgray';
    });

    // Ajoute la classe 'selected-cell' à la cellule actuelle
    cell.classList.add('selected-cell');

    // On récupère l'identifiant de la cellule cliquée
    idCell = cell.id;

    const rowIndex = (cell.parentNode.rowIndex) -1; // Indice de colonne de la cellule cliquée
    const columnIndex = cell.cellIndex; // Indice de la colonne de la cellule cliquée
    
    // On change la couleur de fond de la colonne de la cellule cliquée
    document.getElementById("cell_" + rowIndex.toString().replace(/\s/g, "") + "_0").style.backgroundColor = 'lightblue';

    // On change la couleur de fond de la ligne de la cellule cliquée
    document.getElementById("cell_0_" + columnIndex.toString().replace(/\s/g, "")).style.backgroundColor = 'lightblue';
}

// On notifie le serveur de la modification de style pour l'autre utilisateur
function notifyServer(idCell) {
    // On récupère la cellule modifiée
    const cell = document.getElementById(idCell);

    // On récupère l'alignement de la cellule
    let textAlign = "";
    if (cell.classList.contains("text-end") && !cell.classList.contains("text-center") && !cell.classList.contains("text-start")) { 
        textAlign = "text-end";
    } else if (cell.classList.contains("text-center") && !cell.classList.contains("text-end") && !cell.classList.contains("text-start")) {
        textAlign = "text-center";
    } else if (cell.classList.contains("text-start") && !cell.classList.contains("text-end") && !cell.classList.contains("text-center")) {
        textAlign = "text-start";
    }

    // On récupère l'id du document dans l'url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idDocument = urlParams.get('idDocument');

    // Émettre un événement pour signaler la modification de style
    socket.emit('modificationStyle', idDocument, { idCellule: idCell, fontWeight: cell.style.fontWeight, fontStyle: cell.style.fontStyle, textDecoration: cell.style.textDecoration, color: cell.style.color, backgroundColor: cell.style.backgroundColor, textAlign: textAlign });
}