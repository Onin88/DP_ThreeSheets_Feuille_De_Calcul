const sqlite3 = require('sqlite3').verbose();

// Ouvrir la base de données (si elle n'existe pas, elle sera créée)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

module.exports = db;
