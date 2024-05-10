const express = require('express');
const cors = require('cors');
const http = require('http');
const musicRouter = require('./src/music');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 4000;


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

// Mount the music routes
app.use('/api/music-server', musicRouter);

http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`);
});
