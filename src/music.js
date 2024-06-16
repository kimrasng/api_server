const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const router = express.Router();
require('dotenv').config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_music,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
router.use('/img/artist', express.static(path.join(__dirname, '/../../../../nas/music_server/img/artist')));
router.use('/img/song', express.static(path.join(__dirname, '/../../../../nas/music_server/img/song')));
router.use('/music', express.static(path.join(__dirname, '/../../../../nas/music_server/music')));

router.get('/', async (req, res) => {
    const mainPagePath = path.join(__dirname, '../page/music_server.html');
    fs.readFile(mainPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(data);
    });
});

// music-api/songs
router.get('/songs', async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM songs`);
    res.json({ songs: rows });
});

router.get('/songs/:sort/:order', async (req, res) => {
    try {
        const { sort, order } = req.params;
        let query;
        let orderBy;
        
        switch (sort) {
            case 'title':
                orderBy = 'title';
                break;
            case 'artist':
                orderBy = 'artist_name';
                break;
            case 'date':
                orderBy = 'release_date';
                break;
            default:
                return res.status(404).send('Not Found');
        }
        
        switch (order) {
            case 'asc':
                query = `SELECT * FROM songs ORDER BY ${orderBy} ASC`;
                break;
            case 'desc':
                query = `SELECT * FROM songs ORDER BY ${orderBy} DESC`;
                break;
            default:
                return res.status(400).send('Error');
        }
        
        const [rows] = await pool.query(query);
        res.json({ songs: rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

// music-api/artists
router.get('/artists', async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM artists`);
    res.json({ artists: rows });
});

router.get('/artists/:sort/', async (req, res) => {
    const { sort } = req.params;
    let query;
    switch (sort) {
        case 'name':
            query = 'SELECT * FROM artists ORDER BY korean_name ASC';
            break;
        case 'date':
            query = 'SELECT * FROM artists ORDER BY debut_date ASC';
            break;
        case 'foreign':
            query = 'SELECT * FROM artists ORDER BY foreign_name ASC';
            break;
        default:
            return res.status(404).send('Error');
    }
    const [rows] = await pool.query(query);
    res.json({ songs: rows });
});

module.exports = router;
