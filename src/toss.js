const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            bank TEXT NOT NULL,
            accountNo TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    }
});

router.post('/create-user', (req, res) => {
    const { id, bank, accountNo } = req.body;
    if (!id || !bank || !accountNo) {
        return res.status(400).send('Missing required fields.');
    }

    const stmt = db.prepare('INSERT INTO users (id, bank, accountNo) VALUES (?, ?, ?)');
    stmt.run(id, bank, accountNo, (err) => {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(500).send('Failed to create user.');
        }
        res.status(200).send(`User created with ID: ${id}`);
    });
    stmt.finalize();
});

router.get('/generate-toss-url/:id', (req, res) => {
    const userId = req.params.id;

    db.get('SELECT bank, accountNo FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error('Error retrieving user:', err.message);
            return res.status(500).send('Error retrieving user.');
        }
        if (!row) {
            return res.status(404).send('User not found.');
        }

        const { bank, accountNo } = row;
        const tossUrl = `supertoss://send?bank=${encodeURIComponent(bank)}&accountNo=${encodeURIComponent(accountNo)}&origin=qr`;

        res.json({ tossUrl });

        

    });
});

module.exports = router;
