/* Créer un nouveau fichier */
function nouveauFichier() {
    // Recharge la page
    window.location.reload();
}

// Ouverture d'un fichier .xlsx avec ExcelJS
async function ouvrirFichier() {
    // On simule un click sur le bouton d'upload de fichier
    document.getElementById('fileInput').click();

    // Écouteur pour le changement de fichier
    document.getElementById('fileInput').addEventListener('change', function (event) {
        // On récupère le fichier
        const file = event.target.files[0];
        
        // On charge le fichier dans notre tableau
        chargerFichier(file);
    });
}

// Charger un fichier .xlsx avec ExcelJS
function chargerFichier(file) {
    // On crée un nouveau lecteur de fichier
    const reader = new FileReader();

    // Lorsque le fichier est chargé
    reader.onload = function (e) {
        // On récupère le contenu du fichier
        const data = new Uint8Array(e.target.result);
        
        // Créer un nouveau classeur ExcelJS
        const workbook = new ExcelJS.Workbook();

        // Charger le fichier Excel
        workbook.xlsx.load(data.buffer)
            .then(() => {
                const fileName = document.getElementById('file-name'); // Nom du fichier
                fileName.textContent = file.name.replace(".xlsx", ""); // On change le nom du fichier
                fileNameText = file.name.replace(".xlsx", ""); // On change le nom du fichier de base

                console.log('Fichier chargé avec ExcelJS');
                
                // On récupère la première feuille du classeur
                const firstSheet = workbook.getWorksheet(1);
                
                 // On parcrout chaque cellule
                 firstSheet.eachRow({ includeEmpty: false }, function (row, rowIndex) {
                    row.eachCell(function (cell, cellIndex) {
                        // On récupère la cellule equivalente à la cellule du fichier XLSX (id => cell_rowIndex_cellIndex )
                        const newCell = document.getElementById("cell_" + (rowIndex).toString().replace(/\s/g, "") + "_" + (cellIndex).toString().replace(/\s/g, ""));

                        // On remplit la cellule avec les styles de la cellule du fichier XLSX correspondante
                        newCell.textContent = cell.value;
                        newCell.style.fontWeight = cell.font.bold ? 'bold' : 'normal';
                        newCell.style.fontStyle = cell.font.italic ? 'italic' : 'normal';
                        newCell.style.textDecoration = cell.font.underline ? 'underline' : 'none';
                        newCell.style.color = cell.font.color ? argbToHex(cell.font.color.argb) : '#000000';
                        newCell.style.backgroundColor = cell.fill.fgColor.argb ? argbToHex(cell.fill.fgColor.argb) : '#FFFFFF';
                        newCell.classList.add(cell.alignment.horizontal === 'center' ? 'text-center' : cell.alignment.horizontal === 'right' ? 'text-end' : 'text-start');
                    });
                });

                // Afficher une alerte de succès
                afficherToast("Fichier chargé avec succès !", 'success');
            })
            .catch(error => {
                console.error('Erreur lors du chargement du fichier avec ExcelJS :', error);
                // Afficher une alerte de succès
                afficherToast(error, 'danger');
            });
    };

    // Lire le contenu du fichier
    reader.readAsArrayBuffer(file);
}

// Conversion de notre tableau en fichier .xlsx
async function createXLSXFile() {
    return new Promise(async (resolve, reject) => {
        try {
            const workbook = new ExcelJS.Workbook();

            // On crée une feuille de calcul
            const sheet = workbook.addWorksheet('Feuille 1');

            // On récupère le tableau
            const rows = document.querySelectorAll('#myTable tbody tr');

            // On parcourt chaque cellule
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, cellIndex) => {
                    // On récupère la cellule equivalente à la cellule du fichier XLSX
                    const currentCell = sheet.getCell(rowIndex + 1, cellIndex + 1);

                    // On change le texte de la cellule du fichier XLSX
                    currentCell.value = cell.innerText;

                    // On change la police de la cellule du fichier XLSX
                    currentCell.font = {
                        name: 'Arial',
                        size: 12,
                        color: { argb: (cell.style.color != "") ? rgbToHex(cell.style.color.toString()) : "FF000000" }, // si vide => Noir
                        bold: cell.style.fontWeight === 'bold',
                        italic: cell.style.fontStyle === 'italic',
                        underline: cell.style.textDecoration === 'underline'
                    };

                    // On change l'alignement du texte de la cellule du fichier XLSX
                    currentCell.alignment = {
                        vertical: 'middle',
                        horizontal: cell.classList.contains('text-center') ? 'center' : cell.classList.contains('text-end') ? 'right' : 'left'
                    };

                    // On change la couleur de fond de la cellule si elle n'est pas blanche sinon on la met en blanc dans le fichier XLSX
                    currentCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: (cell.style.backgroundColor != "") ? rgbToHex(cell.style.backgroundColor.toString()) : "FFFFFFFF" }, // si vide => Blanc
                    };
                });
            });

            // On met le fichier dans un buffer et on le convertit en blob
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            resolve(blob);
        } catch (error) {
            reject(error);
        }
    });
}

/* Télécharge le fichier en format .xlsx */
async function telechargerFichier() {
    // On crée le fichier
    const blob = await createXLSXFile();

    fileNameText = document.getElementById('file-name').textContent; // On récupère le nom du fichier
    
    // On enregistre le fichier sur notre pc
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileNameText,'.xlsx'; // Nom du fichier
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/* Enregistre le fichier sur le serveur et dans la db */
async function enregistrerFichier(){
    // On crée le fichier et on l'enregistre sur le serveur
    const blob = await createXLSXFile();

    // On enregistre le fichier sur le serveur
    await enregistrerSurServeur(blob);
}

/* Ferme le fichier et redirige vers le dashboard */
async function fermerFichier(){
    window.location.href = "/dashboard";
}

// Enregistre le fichier sur le serveur
async function enregistrerSurServeur(blob) {
    try {
        fileNameText = document.getElementById('file-name').textContent; // On récupère le nom du fichier

        // Si le titre est "Nouvelle Feuille", on génére un identifiant aléatoire de 7 caractères
        if (fileNameText === "Nouvelle feuille") {
            const randomId = Math.random().toString(36).substring(7);

            // On change le nom du fichier
            fileNameText = fileNameText + `-${randomId}`;
            fileName.textContent = fileNameText;
        }

        // On crée un objet FormData avec le fichier xlsx
        const formData = new FormData();
        formData.append('file', blob, fileNameText+'.xlsx');
        const oldFileName = document.getElementById('old-file-name').value;
        formData.append('oldFileName', oldFileName);

        // Envoi du fichier au serveur
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('Fichier enregistré sur le serveur !');

            // On récupère l'id du créateur
            const idCreateur = document.getElementById('idUser').value;

            // On crée le document dans la db
            await createDocumentInDb(fileNameText, idCreateur);
        } else {
            // Afficher une alerte d'erreur
            afficherToast("Erreur lors de l\'enregistrement du fichier sur le serveur.", 'danger');

            throw new Error('Erreur lors de l\'enregistrement du fichier sur le serveur');
        }
    } catch (error) {
        // Afficher une alerte d'erreur
        afficherToast(error.message, 'danger');
    }
}

// On recupère le dernier fichier dans la db
async function getLastFile() {
    // On récupère le dernier fichier dans la db
    await fetch('/getLastFile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }

            // Récupération des données JSON renvoyées par le serveur
            return response.json();
        })
        .then(data => {
            // On récupère le titre du dernier fichier
            const idDocument = data.idDocument;

            // On rajouter l'id du document dans l'url
            window.history.pushState(null, null, `?idDocument=${idDocument}`);

            // On set l'id du créateur du document
            document.getElementById('idCreateur').value = data.idCreateur;
        })
        .catch(error => {
            console.error(error); // Gestion des erreurs

            // Afficher une alerte d'erreur
            afficherToast("Erreur lors de la récupération du dernier fichier.", 'danger');
        });
}

// Affichage d'un tosat pour les erreus, messages, ...
function afficherToast(message, type) {
    // On récupère le toast et on l'affiche avec le message en paramètre
    const alertDiv = document.getElementById('alert');
    alertDiv.querySelector(".toast-body").textContent = message;

    // On change la couleur de fond du toast en fonction du type de message (success, danger)
    alertDiv.classList.remove('text-bg-success', 'text-bg-danger');
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

// Créer un document dans la base de données
async function createDocumentInDb(titre, idCreateur) {
    // On crée un objet avec les données à envoyer
    let requestData = {
        titre: titre,
        id: idCreateur
    };

    // On crée les options de la requête
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    };

    // On récupère l'id du document dans l'url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idDocument = urlParams.get('idDocument');

    // Si il y a un id dans l'url, on modifie le document
    let requestUrl = '/createFile';
    if (idDocument) {
        // On modifie le document dans la db
        requestUrl = `/modifyFile`;

        // On change les données à envoyer
        requestData = {
            titre: titre,
            id: idDocument
        };
    }

    // On crée la requête
    try {
        // On envoie la requête au serveur
        const response = await fetch(requestUrl, requestOptions);
        if (!response.ok) {
            throw new Error('Erreur lors de la création du document');
        }

        // On récupère les données renvoyées par le serveur
        const responseData = await response.text();

        // On actualise la liste des documents pour les utilisateurs connectés
        socket.emit('changeDocument');
        
        // Afficher une alerte de succès
        afficherToast(responseData, 'success');

        // On récupère le dernier fichier dans la db et on met à jour l'url avec l'id du document
        await getLastFile();
    } catch (error) {
        // Afficher une alerte d'erreur
        afficherAlerte(error.message || 'Erreur inconnue', 'danger');
    }
}

// On récupère le nom du fichier par son id
async function loadNameFile() {
    // On récupère l'id du document dans l'url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idDocument = urlParams.get('idDocument');

    // On récupère le titre du document si il y a un id en paramètre
    if (idDocument) {
        try {
            const response = await fetch(`/getFileById/${idDocument}`);
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }

            // Récupération des données JSON renvoyées par le serveur
            const data = await response.json();
            const titre = data.titre;
            const url = `/files/${titre}.xlsx`;

            // On set l'id du créateur du document
            document.getElementById('idCreateur').value = data.idCreateur;

            // Effectuer une requête pour récupérer le fichier
            const fileResponse = await fetch(url);
            if (!fileResponse.ok) {
                // On affiche une alerte d'erreur
                afficherToast("Erreur lors de la récupération du fichier.", 'danger');

                throw new Error('Erreur lors de la récupération du fichier');
            }

            // Récupération du blob
            const blob = await fileResponse.blob();
            const file = new File([blob], titre + '.xlsx', { type: blob.type });
            
            // Appel de la fonction pour charger le fichier
            chargerFichier(file);

            // Affichage du titre du document
            const titreElement = document.getElementById('file-name');
            titreElement.textContent = titre;
        } catch (error) {
            console.error(error); // Gestion des erreurs

            // Afficher une alerte d'erreur
            afficherToast("Erreur lors de la récupération du fichier.", 'danger');
        }
    }
}

// Convertit une valeur de couleur ARGB en hexadécimal
function argbToHex(argbValue) {
    // On extrait les valeurs de rouge, vert et bleu de l'ARGB
    const red = parseInt(argbValue.substr(2, 2), 16);
    const green = parseInt(argbValue.substr(4, 2), 16);
    const blue = parseInt(argbValue.substr(6, 2), 16);

    // On combine les valeurs RVB pour obtenir une couleur hexadécimale
    const hexColor = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
    return hexColor;
}

// Convertit une valeur de couleur RGB en hexadécimal
function rgbToHex(rgb) {
    // Sépare les valeurs de couleur (R, G, B) de la chaîne rgb()
    const [r, g, b] = rgb.match(/\d+/g);

    // Convertit les valeurs de couleur en hexadécimal
    const hex = `FF${(+r).toString(16).padStart(2, '0')}${(+g).toString(16).padStart(2, '0')}${(+b).toString(16).padStart(2, '0')}`;

    return hex.toUpperCase(); // Retourne la valeur en majuscules
}