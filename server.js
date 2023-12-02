const express = require('express');
const cors = require('cors');
const path = require('path');

const https = require("https");
const fs = require('fs');

const app = express();
const PORT = 4000;

const options = {
  key: fs.readFileSync(path.join(__dirname, './config/key.pem')),  // Replace with your Cloudflare private key path
  cert: fs.readFileSync(path.join(__dirname, './config/cert.pem')),  // Replace with your Cloudflare certificate path
};

app.use(cors());

// 정적 파일 제공

// /api/music-server/music 로 접속할 경우 /music 폴더를 제공한다.
app.use('/api/music-server/music', express.static(path.join(__dirname, '/music')));

// /api/music-server/img/song 로 접속할 경우 /img/song 폴더를 제공한다.
app.use('/api/music-server/img/song', express.static(path.join(__dirname, '/img/song')));

// /api/music-server/img/artist 로 접속할 경우 /img/artist 폴더를 제공한다.
app.use('/api/music-server/img/artist', express.static(path.join(__dirname, '/img/artist')));

// /song/ 로 접속할 경우 /page/song 폴더를 제공한다.
app.use('/song/', express.static(path.join(__dirname, '/page/song')));

// main page
app.get('/', (req, res) => {
  const songsPath = path.join(__dirname, './page/main.html');

  fs.readFile(songsPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    res.send(data);
  });
});

// SONG PAGE
app.get('/song', (req, res) => {
  const songsPath = path.join(__dirname, './page/song.html');

  fs.readFile(songsPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    res.send(data);
  });
});

// API: 곡 목록 및 정보 제공
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

// 서버 시작
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server started on port ${PORT}`);
});
