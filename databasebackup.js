const express = require("express");
const mysql = require("mysql2");
const md5 = require("js-md5");
const port = "3000";
const app = express();
require("dotenv").config();

console.log(process.env.USER_NAME);
console.log(process.env.PASSWORD);


//............... This function will execute queries in Database.................

function executeQuery(pool, qry) {
  return new Promise((resolve, reject) => {
    let query = qry;
    console.log("query going to execute now = ", query);
    pool.query(query, (error, result) => {
      if (error) {
        console.log("Error executing query: " + query);
        console.log(error);
        resolve('');
        // reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

//...............For creating Database...............

async function createDB(pool,DbName){

  let checkQuery = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${DbName}'`;

    try {
      const checkResult = await executeQuery(pool, checkQuery);
      if (checkResult.length === 0) {
        let createQuery = `CREATE DATABASE ${DbName}`;
        await executeQuery(pool, createQuery);
        console.log(`DB created with name ${DbName}`);
      } else {
        console.log(`Database ${DbName} already exists.`);
      }
     
    } catch (error) {
      console.error("Error creating or updating database:", error);
      pool.end();
    }

}

// ................... This function is to Check Flag and Create Database.....................

async function executeTestcaseExercise(pool, uid, obj, userQuery) {
  const DBflagCheck = obj.flag;
  let DBName;
  if (DBflagCheck) {
     DBName = obj.DBname;
   
  } else {
     DBName = `DB_${md5(uid)}`;
    await createDB(pool,DBName);
  }

  return await executeAllTestCases(pool, DBflagCheck, DBName, obj, userQuery);
}


// ....................This function is to execute all the testcases.........................

async function executeAllTestCases(pool, flag, dbName, obj, query) {
  let testres = [];
  let flagchecker = true; // control userqueryExecution and postQueryExecution

  for (const testCase of obj.testCases) {
    let objects = {};
    console.log(testCase.name);
    objects["TestCaseName"] = testCase.name;
    objects["TableInputs"] = [];

    console.log(flag);
    if (!flag) {
      // .....................Pre Execution .............................//

      for (let i = 0; i < testCase.pre.length; i++) {
        let qry = testCase.pre[i];
        for (let j = 0; j < testCase.tables.length; j++) {
          let tableName = testCase.tables[j];
          const regex = new RegExp(`\\b${tableName}\\b`, "g");
          qry = qry.replace(regex, `${dbName}.${tableName}`);
        }
        const preExe = await executeQuery(pool, qry);
        console.log("preExe DBname= ", preExe);
      }
    }

    if (testCase.preResult.length !== 0) {
      flagchecker = false;
      //......................PreResult Execution.........................//
      for (const preResult of testCase.preResult) {
        const queryBuilder = `SELECT * FROM ${dbName}.${preResult}`;
        const preResExe = await executeQuery(pool, queryBuilder);
        console.log("preResExe = ", preResExe);
        objects["TableInputs"].push({
          [preResult]: preResExe,
        });
      }
    }

    let userQry = query;

    //......................UserQuery Execution..........................//
    
    for (let i = 0; i < testCase.tables.length; i++) {
      let tablename = testCase.tables[i];
      let regex = new RegExp(`\\b${tablename}\\b`, "g");
      userQry = userQry.replace(regex, `${dbName}.${tablename}`);
    }
    const userExe = await executeQuery(pool, userQry);
    console.log("userExe = ", userExe);
    !flagchecker ? (objects["UserQueryResult"] = userExe) : null;

    if (testCase.postQuery !== "") {
      let postQry;
      for (let i = 0; i < testCase.tables.length; i++) {
        let tablename = testCase.tables[i];
        let regex = new RegExp(`\\b${tablename}\\b`, "g");
        postQry = testCase.postQuery.replace(regex, `${dbName}.${tablename}`);
      }
      const postExe = await executeQuery(pool, postQry);
      console.log("postExe = ", postExe);
      if (flagchecker) {
        objects["UserQueryResult"] = postExe;
        objects["PostQueryResult"] = postExe;
      }
    } else {
      objects["PostQueryResult"] = "";
    }

    console.log("objectFinal = ", objects);
    testres.push(objects);
  }

  console.log("testres = ", testres);
  return testres;
}

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  multipleStatements: process.env.MULTIPLE_STATEMENTS,
  connectionLimit: process.env.CONNECTION_LIMIT,
  waitForConnections: process.env.WAIT_FOR_CONNECTIONS,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("error connecting Database", err);
    return;
  }
  console.log("Connected to Database!");
  connection.release();
});

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/execute", async (req, res) => {
  console.log("Received a POST request to /execute");
  let obj = JSON.parse(req.body.testcase);
  let uid = req.body.uid;
  const query = req.body.query;
  console.log("uid = ", uid);

  const finalResult = await executeTestcaseExercise(pool, uid, obj, query);

  console.log("result..... = ", finalResult);

  res.json(finalResult);
});

app.listen(port, () => {
  console.log(`CodeEditor app listening at http://localhost:${port}`);
});
