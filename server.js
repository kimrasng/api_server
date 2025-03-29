const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const PORT = 3000

const musicRouter = require('./src/music')
const test = require('./src/test')
const admin = require('./src/admin')
const login = require('./src/login')
// const aniRouter = require('./src/ani')

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
// app.use('/api/ani-server', aniRouter)
app.use('/api/test', test)
app.use('/api/admin', admin)
app.use('/account/login', login)

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ code: 500, errorMessage: 'Internal Server Error' })
})

// app.listen을 사용하여 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})