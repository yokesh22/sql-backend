const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    multipleStatements: process.env.MULTIPLE_STATEMENTS,
    connectionLimit: process.env.CONNECTION_LIMIT,
    waitForConnections: process.env.WAIT_FOR_CONNECTIONS,
  });

module.exports = pool;