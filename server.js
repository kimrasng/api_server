const express = require('express')
const cors = require('cors')
const http = require('http')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const PORT = 4000

const musicRouter = require('./src/music')
const aniRouter = require('./src/ani')

app.use(cors())

app.use('/service/', express.static(path.join(__dirname, '/page/service')))
app.use('/document/', express.static(path.join(__dirname, '/page/document')))

app.get('/', (req, res) => {
    const mainPagePath = path.join(__dirname, './page/main.html')
    fs.readFile(mainPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading main page:', err)
            return res.status(500).send('Internal Server Error')
        }
        res.send(data)
    })
})

app.use('/api/music-server', musicRouter)
app.use('/api/ani-server', aniRouter)

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ code: 500, errorMessage: 'Internal Server Error' })
})

http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`)
})