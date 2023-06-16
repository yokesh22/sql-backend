const md5 = require("js-md5");
const queryExecution = require("./queryExecution");

//............... This function will execute queries in Database.................

// function executeQuery(pool, qry) {
//     return new Promise((resolve, reject) => {
//       let query = qry;
//       console.log("query going to execute now = ", query);
//       pool.query(query, (error, result) => {
//         if (error) {
//           console.log("Error executing query: " + query);
//           console.log(error);
//           resolve('');
//           // reject(error);
//         } else {
//           resolve(result);
//         }
//       });
//     });
// }
  
//...............For creating Database...............
  
  async function createDB(pool,DbName){
  
    let checkQuery = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${DbName}'`;
  
      try {
        // const checkResult = await executeQuery(pool, checkQuery);
        const checkResult = await queryExecution(pool,[checkQuery],"sequential");
        if (checkResult.length === 0) {
          let createQuery = `CREATE DATABASE ${DbName}`;
          await queryExecution(pool,[createQuery],"sequential");
          // await executeQuery(pool, createQuery);
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
  
  async function executeTestcaseExercise(pool, uid, testcase, userQuery) {
    const DBflagCheck = testcase.flag;
    let DBName;
    if (DBflagCheck) {
       DBName = testcase.DBname;
     
    } else {
       DBName = `DB_${md5(uid)}`;
      await createDB(pool,DBName);
    }
  
    return await executeAllTestCases(pool, DBflagCheck, DBName, testcase, userQuery);
  }
  
  
  // ....................This function is to execute all the testcases.........................
  
  async function executeAllTestCases(pool, DBflagCheck, dbName, testcase, userQuery) {
    let testres = [];
  
    for (const testCase of testcase.testCases) {


      let tempResultObject = {};
      // console.log(testCase.name);
      tempResultObject["TestCaseName"] = testCase.name;
      tempResultObject["TableInputs"] = [];
      tempResultObject["PostResult"] = [];
      // console.log(DBflagCheck);


      if (!DBflagCheck) {
        // .....................PreQueries Execution .............................//
        if(testCase.preQueries.length !== 0){
          let preQueryArray = [];
        for (let i = 0; i < testCase.preQueries.length; i++) {
          let qry = testCase.preQueries[i];
          for (let j = 0; j < testCase.tables.length; j++) {
            let tableName = testCase.tables[j];
            const regex = new RegExp(`\\b${tableName}\\b`, "g");
            qry = qry.replace(regex, `${dbName}.${tableName}`);
          }
          preQueryArray.push(qry);
        }
        const res = await queryExecution(pool,preQueryArray,"sequential");
        }
        // console.log("PreQueries Array = ", res);
      }


  
      if (testCase.preResult.length !== 0) {
  
        //......................PreResult Execution.........................//
        let preResultArray = [];
        for (const preResult of testCase.preResult) {
          const queryBuilder = `SELECT * FROM ${dbName}.${preResult}`;
          preResultArray.push(queryBuilder);
        }
        const res = await queryExecution(pool,preResultArray,"parallel");
        // console.log("preResultArray = ",res);
        for(const tablename of testCase.preResult){
            tempResultObject["TableInputs"].push({
                [tablename]: res[testCase.preResult.indexOf(tablename)]
            });
        }
        
  
  
      }   
          //......................UserQuery Execution..........................//
  
          let userQry = userQuery;
          console.log("..",userQry);
          if(userQry !== ""){
            let userQueryArray = [];
          for (let i = 0; i < testCase.tables.length; i++) {
              let tablename = testCase.tables[i];
              let regex = new RegExp(`\\b${tablename}\\b`, "g");
              userQry = userQry.replace(regex, `${dbName}.${tablename}`);
            }
            userQueryArray.push(userQry);
            console.log("UserQueryArray = ",userQueryArray.length);
            const res = await queryExecution(pool,userQueryArray,"sequential");
            console.log(res);
            // res.fieldCount !== 0?tempResultObject["UserQueryResult"] = res:tempResultObject["UserQueryResult"] = "" ;
            tempResultObject["UserQueryResult"] = res
          }else{
            tempResultObject["UserQueryResult"] = "" 
          }
          
  
  
      if (testCase.postResult.length !== 0) {
        let postQry,postResultArray = [];
        for(const postResult of testCase.postResult){
            const query = postResult;
            for (let i = 0; i < testCase.tables.length; i++) {
                let tablename = testCase.tables[i];
                let regex = new RegExp(`\\b${tablename}\\b`, "g");
                postQry = query.replace(regex, `${dbName}.${tablename}`);
              }
            postResultArray.push(postQry);
        }
        const res = await queryExecution(pool,postResultArray,"parallel");
        console.log(res);
        for(const i of res){
          console.log("postqry",i);
          for(const tablename of testCase.tables){
            tempResultObject["PostResult"].push({
                [tablename]: i
            });
        }
        }
        
        // tempResultObject["PostQueryResult"] = res[0];
        
      } else {
        tempResultObject["PostResult"] = [];
      }
  
      console.log("objectFinal = ", tempResultObject);
      testres.push(tempResultObject);
    }
  
    // console.log("testres = ", testres);
    return testres;
  }
  

  module.exports = executeTestcaseExercise;