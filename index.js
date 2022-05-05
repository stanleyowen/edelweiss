const express = require("express");
const app = express();
const port = 3000;

if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.get("/", (req, res) => {
  res.send("hiii");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
