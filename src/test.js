const express = require('express')
const mysql = require('mysql2/promise')
const router = express.Router()
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_test,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

router.get('/db', async (req, res) => {
    try {
        const connection = await pool.getConnection()
        connection.release()
        res.send('DB 연결에 성공했습니다!')
    } catch (error) {
        res.status(500).send('DB 연결에 실패했습니다.')
    }
})

module.exports = router
