const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_ani,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

router.use('/vidio/ani', express.static(path.join(__dirname, '/../../../../nas/ani/')));

router.get('/', async (req, res) => {
    const mainPagePath = path.join(__dirname, '../page/ani_server.html');
    fs.readFile(mainPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(data);
    });
});

// router.get('/ani', async (req, res) => {
//     const [rows] = await pool.query(`SELECT * FROM ani_vidio`);
//     res.json({ vidio: rows });
// });

module.exports = router;
