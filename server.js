const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const rootDirectory = '/home/kimrasng/nas';
const protectedFoldersPath = path.join(__dirname, 'key.json');
const usersFilePath = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

function loadProtectedFolders() {
    const data = fs.readFileSync(protectedFoldersPath, 'utf8');
    return JSON.parse(data);
}

function loadUsers() {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
}

function sendDirectoryListing(req, res, requestedPath) {
    fs.readdir(requestedPath, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        let fileListHTML = '<ul>';
        files.forEach(file => {
            const filePath = path.join(requestedPath, file);
            const stats = fs.statSync(filePath);
            const fileTypeIcon = stats.isDirectory() ? '📁' : getFileTypeIcon(file);
            const fileCreationDate = moment(stats.birthtime).fromNow();

            fileListHTML += `<li>${fileTypeIcon} <a href="${path.join(req.params[0] || '', file)}">${file}</a> - Created ${fileCreationDate}</li>`;
        });
        fileListHTML += '</ul>';
        res.send(fileListHTML);
    });
}

function getFileTypeIcon(fileName) {
    const fileExtension = path.extname(fileName).toLowerCase();
    switch (fileExtension) {
        case '':
            return '📄';
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
            return '🖼️';
        case '.mp3':
            return '🎵';
        case '.mp4':
            return '🎥';
        default:
            return '📄';
    }
}

function getContentType(fileExtension) {
    switch (fileExtension) {
        case '.html':
            return 'text/html';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.pdf':
            return 'application/pdf';
        case '.mp3':
            return 'audio/mpeg';
        case '.mp4':
            return 'video/mp4';
        case '.txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
}

function isProtectedFolder(folderPath) {
    const protectedFolders = loadProtectedFolders();
    return Object.keys(protectedFolders).some(protectedPath => folderPath.startsWith(path.join(rootDirectory, protectedPath)));
}

function checkPassword(folderPath, password) {
    const protectedFolders = loadProtectedFolders();
    const relativePath = folderPath.replace(rootDirectory, '');
    return protectedFolders[relativePath] === password;
}

function authenticateUser(username, password) {
    const users = loadUsers();
    return users[username] && users[username].password === password;
}

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session.user) {
        next(); // User is authenticated, continue to the next middleware
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
}

// Middleware to check if access to a protected folder requires password
function requirePassword(req, res, next) {
    const requestedPath = path.join(rootDirectory, req.params[0] || '');

    if (isProtectedFolder(requestedPath)) {
        if (!req.session.user) {
            return res.sendFile(path.join(__dirname, 'password_prompt.html'));
        }
    }
    
    next();
}

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (authenticateUser(username, password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Route to handle accessing protected directories
app.get('*', requireAuth, requirePassword, (req, res, next) => {
    const requestedPath = path.join(rootDirectory, req.params[0] || '');

    if (!fs.existsSync(requestedPath)) {
        return res.status(404).send('404');
    }

    fs.stat(requestedPath, (err, stats) => {
        if (err) {
            console.error(err);
            return res.status(404).send('404');
        }

        if (stats.isDirectory()) {
            sendDirectoryListing(req, res, requestedPath);
        } else {
            const fileExtension = path.extname(requestedPath).toLowerCase();
            const contentType = getContentType(fileExtension);

            if (contentType.startsWith('image') || contentType.startsWith('audio') || contentType.startsWith('video') || contentType === 'application/pdf') {
                res.sendFile(requestedPath);
            } else {
                res.download(requestedPath);
            }
        }
    });
});

// Route to handle checking password for protected folders
app.post('/check-password', (req, res) => {
    const { folderPath, password } = req.body;

    if (checkPassword(folderPath, password)) {
        req.session.user = 'authenticated'; // Mark user as authenticated for session
        res.status(200).send('Access granted');
    } else {
        res.status(403).send('Access denied');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
