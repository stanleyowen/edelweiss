const express = require("express");
const app = express();
const port = 3000;

if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.use((req, res, next) => {
  const auth = { login: "yourlogins", password: "yourpassword" };

  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  if (login && password && login === auth.login && password === auth.password)
    return next();

  res
    .header("Content-Type", "application/json; charset=UTF-8")
    .set("WWW-Authenticate", 'Basic realm="401"')
    .status(401)
    .send(
      JSON.stringify(
        {
          errorCode: 401,
          error: "Unauthorized",
          message:
            "The pages you are trying to access requires authentication. Please try again.",
        },
        null,
        2
      )
    );
});

app.get("/", (req, res) => {
  res.send("hiii");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
