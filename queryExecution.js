const mysql = require("mysql2");

async function executeQuery(pool, queriesArray, isSequentialorParallelFlag) {
  // console.log("array len = ",queriesArray.length);
  try {
    if (isSequentialorParallelFlag === "sequential") {
      return await sequentialExecution(pool, queriesArray);
    } else if (isSequentialorParallelFlag === "parallel") {
      return await parallelExecution(pool, queriesArray);
    }
    console.log("Execution Completed Successfully");
  } catch (error) {
    console.error("Error occurred:...", error);
    return [];
  }
}

function sequentialExecution(pool, queryArray) {
  // console.log("length of array1 = ",queryArray.length);
  // let counter = 0;
  return new Promise((resolve, reject) => {
    pool.getConnection(async (error, connection) => {
      if (error) {
        console.log("error", error);
        reject(error);
        connection.release();
      } else {
        let resArray = [];
        console.log("length of array5... ", queryArray.length);
        for (let i = 0; i < queryArray.length; i++) {
          let query = queryArray[i];
          console.log("query bef ", query);
          try {
            const rows = await new Promise((resolve, reject) => {
              connection.query(query, (err, rows, field) => {
                if (err) {
                  console.log("error in sequence", err);
                  reject(err);
                } else {
                  console.log(rows);
                  resolve(rows);
                }
              });
            });

            resArray = rows;
            console.log(`query executed was ..... ${i}`, query);
            // counter++;
            // console.log("counter = ", counter);
          } catch (error) {
            console.log("error occurred", error);
          }
        }

        console.log("End sequential");
        connection.release();
        resolve(resArray);
        // if (counter === queryArray.length) {
        //   connection.release();
        //   console.log("before...");
        //   resolve(resArray);
        //   console.log("after....");
        // }
      }
    });
  });
}



function parallelExecution(pool, queryArray) {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    for (let i=0;i<queryArray.length;i++) {
      let query = queryArray[i];
          let queryPromise = new Promise((resolve,reject)=>{
            pool.query(query, (err, rows, field) => {
              if (err) {
                console.log("error in parallel", err);
                reject(err);
              } else {
                console.log("query executed was 1..... ", query);
                resolve(rows);
              }
              });
          });
          promises.push(queryPromise);
          // console.log("promisess bef",promises);
    }
    // console.log("promises aft",promises);
    Promise.all(promises)
    .then(results => {
      console.log("results",results);
      resolve(results);
    })
    .catch(error =>{
      console.log("End Parallel");
      reject(error);
    });
  });
}

module.exports = executeQuery;






























// function parallelExecution(pool, queryArray) {
//   let resArray = [];
//   return new Promise(async (resolve, reject) => {
//       console.log("array len = ",queryArray.length);
//       for(let i=0;i<queryArray.length;i++){
//         let query = queryArray[i];
//         console.log("query bef ",query);
//         try {
//           const rows = await new Promise((resolve,reject)=>{
//           pool.query(query,(err,row,filed)=>{
//             if(err){
//               console.log("error in parallel",err);
//               reject(err);
//             }else{
//               console.log(row);
//               resolve(row);
//             }
//           });
          

//           });
//         } catch (error) {
//           console.log("error occured", error);
//         }
//       }
      
//       resolve(resArray);
    
//   });
// }
