// Nombre de colonnes
const numberOfColumns = 26;
// Nombre de lignes
const numberOfRows = 26;

// On récupère le thead
const thead = document.querySelector('table#myTable thead');

// On génère la première ligne du tableau avec les lettres de A à Z
const row = document.createElement('tr');
for (let i = 0; i <= numberOfColumns; i++) {
    const cell = document.createElement('th');

    if (i === 0) { // Première cellule vide
        cell.textContent = '';
        cell.id = "uselessCell"
    } else { // Les autres cellules avec les lettres de A à Z
        cell.textContent = String.fromCharCode(65 + i - 1);
        cell.id = `cell_0_${i}`;
    }
    
    // On assigne un identifiant unique à chaque cellule
    cell.classList.add('table-secondary');
    cell.classList.add('text-center');

    row.appendChild(cell);
}

// On ajoute la ligne au thead
thead.appendChild(row);

// On récupère le tbody
const tbody = document.querySelector('table#myTable tbody');

// On génère la colonne de gauche avec les numéros de ligne
for (let i = 0; i < numberOfRows; i++) {

    // On génère une ligne
    const row = document.createElement('tr');

    // Pour chaque colonne, on génère les cellules
    for (let j = 0; j <= numberOfColumns; j++) {

        // Si c'est la première colonne, on génère une cellule avec le numéro de ligne
        const cell = (j === 0) ? document.createElement('th') : document.createElement('td');
        
        // On assigne un identifiant unique à chaque cellule
        cell.id = `cell_${i + 1}_${j}`;
        cell.style.minWidth = '100px';

        // Première colonne avec les chiffres
        if (j === 0) {
            cell.textContent = i;
            cell.classList.add('table-secondary');
            cell.classList.add('text-center');

            // Les autres cellules
        } else {
            cell.contentEditable = false;

            // On ajoute un event listener sur chaque cellule
            cell.addEventListener('input', function(event) {
                const modifiedCell = event.target;
                const cellId = modifiedCell.id;
                
                // On appel la fonction onTextChange pour mettre à jour la cellule avec le socket
                onTextChange(cellId);
            });
        }

        // On ajoute la cellule à la ligne
        row.appendChild(cell);
    }

    tbody.appendChild(row);
}