const mysql = require("mysql2");
const queryExecution = require("./queryExecution")


const pool = mysql.createPool({
    host: "localhost",
    user: "yokesh",
    password: "Yokesh123@",
    database: "sqlEditor",
    multipleStatements: true,
    connectionLimit: 10,
    waitForConnections: true,
});

const array = [
    "DO SLEEP (3)",
    "CREATE TABLE Students (id INT,name VARCHAR(50),age INT,grade VARCHAR(10));",
    "DO SLEEP (2)",
    "DELETE FROM Students",
    "DO SLEEP (5)",
    "INSERT INTO Students (id, name, age, grade) VALUES (1, 'John Doe', 18, 'A'),(2, 'Jane Smith', 17, 'B'),(3, 'Michael Johnson', 19, 'A'); ;",
    
];

async function mainTest(){
    const response = await queryExecution(pool,array,"parallel");
console.log("response = ",response)
}

mainTest();