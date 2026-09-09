// Sets up a MySQL connection pool using the credentials in the .env file.
// A "pool" lets our app reuse database connections efficiently instead of
// opening a brand new connection for every single query.

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// promise() lets us use async/await instead of callbacks
const promisePool = pool.promise();

module.exports = promisePool;
