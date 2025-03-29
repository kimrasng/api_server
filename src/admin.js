const express = require('express')
const mysql = require('mysql2')

const router = express.Router()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// 로그인 여부를 확인하는 미들웨어
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) { // 세션에 사용자 정보가 있는지 확인
        return next()
    } else {
        res.status(401).send('Unauthorized')
    }
}

router.get('/', (req, res) => {
    res.send('Admin API')
})

// CRUD 예제: 로그인한 사용자만 접근 가능
router.get('/data', isAuthenticated, (req, res) => {
    pool.query('SELECT * FROM some_table', (err, results) => {
        if (err) {
            return res.status(500).send('Database error')
        }
        res.json(results)
    })
})

router.post('/data', isAuthenticated, (req, res) => {
    const { field1, field2 } = req.body
    pool.query('INSERT INTO some_table (field1, field2) VALUES (?, ?)', [field1, field2], (err, results) => {
        if (err) {
            return res.status(500).send('Database error')
        }
        res.status(201).send('Data inserted')
    })
})

router.put('/data/:id', isAuthenticated, (req, res) => {
    const { id } = req.params
    const { field1, field2 } = req.body
    pool.query('UPDATE some_table SET field1 = ?, field2 = ? WHERE id = ?', [field1, field2, id], (err, results) => {
        if (err) {
            return res.status(500).send('Database error')
        }
        res.send('Data updated')
    })
})

router.delete('/data/:id', isAuthenticated, (req, res) => {
    const { id } = req.params
    pool.query('DELETE FROM some_table WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send('Database error')
        }
        res.send('Data deleted')
    })
})

module.exports = router