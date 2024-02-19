const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const mysql = require('mysql2/promise');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = 4000;

app.use(cors());

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use('/api/music-server/music', express.static(path.join(__dirname, '/music')));
app.use('/api/music-server/img/song', express.static(path.join(__dirname, '/img/song')));
app.use('/api/music-server/img/artist', express.static(path.join(__dirname, '/img/artist')));
app.use('/song/', express.static(path.join(__dirname, '/page/song')));

// Main page
app.get('/', (req, res) => {
  const mainPagePath = path.join(__dirname, './page/main.html');
  fs.readFile(mainPagePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }
    res.send(data);
  });
});

// Song page
app.get('/api/music-server', (req, res) => {
  const songPagePath = path.join(__dirname, './page/music_server.html');
  fs.readFile(songPagePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }
    res.send(data);
  });
});

// API routes
app.get('/api/music-server/songs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM songs');
    res.json({ songs: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/music-server/artists', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artists');
    res.json({ artists: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// HTTP server start
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});