require("dotenv").config();

const pool = require("./connection");
const executeTestcaseExercise = require("./testCaseExecutionExercise");

const express = require("express");
const port = "3000";
const app = express();


app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/execute", async (req, res) => {
  console.log("Received a POST request to /execute");
  let testcase = JSON.parse(req.body.testcase);
  let uid = req.body.uid;
  const userQuery = req.body.query;
  console.log("uid = ", uid);

  const finalResult = await executeTestcaseExercise(pool, uid, testcase, userQuery);

  console.log("Final result = ", finalResult);

  res.json(finalResult);
});

app.listen(port, () => {
  // console.log(`CodeEditor app listening at http://localhost:${port}`);
});
