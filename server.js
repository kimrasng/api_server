const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');  // Changed from https to http

const fs = require('fs');

const app = express();
const PORT = 4000;

app.use(cors());

// Static file serving

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
app.get('/song', (req, res) => {
  const songPagePath = path.join(__dirname, './page/song.html');

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

app.get('/api/music-server/songs', (req, res) => {
  const songsPath = path.join(__dirname, './songs.json');

  fs.readFile(songsPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    const songs = JSON.parse(data).songs;
    res.json({ songs });
  });
});

app.get('/api/music-server/artist', (req, res) => {
  const artistPath = path.join(__dirname, './artist.json');

  fs.readFile(artistPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    const artist = JSON.parse(data).artist;
    res.json({ artist });
  });
});

// HTTP server start
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});
