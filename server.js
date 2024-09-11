const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 4000;

const musicRouter = require('./src/music');
const aniRouter = require('./src/ani');
const ytdlRouter = require('./src/ytdl');

app.use(cors());

// 페이지 연결
app.use('/service/', express.static(path.join(__dirname, '/page/service')));
app.use('/document/', express.static(path.join(__dirname, '/page/document')));

// Main page
app.get('/', (req, res) => {
    const mainPagePath = path.join(__dirname, './page/main.html');
    fs.readFile(mainPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send(data);
    });
});

app.use('/api/music-server', musicRouter);
app.use('/api/ani-server', aniRouter);
app.use('/api/ytdl', ytdlRouter);

http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`);
});