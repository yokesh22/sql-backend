
try {
    const rows = await connection.query(query);
    console.log(rows);
    const rows = await connection.query(query,async (err, rows, field) => {
      if (err) {
        console.log("error in sequence", err);
        reject(err);
      }
      console.log(rows);
      resolve(rows);
    });

    resArray = rows;
    console.log(`query executed was ..... ${i}`, query);
    // counter++;
    // console.log("counter = ", counter);
  } catch (error) {
    console.log("error occurred", error);
  }

  try {
    const rows = await new Promise((resolve, reject) => {
      connection.query(query, (err, rows, field) => {
        if (err) {
          console.log("error in sequence", err);
          reject(err);
        }
        console.log(rows);
        resolve(rows);
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
console.log("......");
connection.release();
resolve(resArray);
// if (counter === queryArray.length) {
//   connection.release();
//   console.log("before...");
//   resolve(resArray);
//   console.log("after....");
// }
}