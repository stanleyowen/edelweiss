const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;
const limiter = {
  statusCode: 429,
  code: "Too Many Requests",
  message:
    "We're sorry, but you have made too many requests to our servers. Please try again later.",
};

if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=UTF-8");
  return next();
});

app.use(
  rateLimit({
    windowMs: 3600000, // 1 hour
    max: 100,
    handler: (req, res) =>
      res.status(429).send(JSON.stringify(limiter, null, 2)),
  })
);

app.use(
  "/heroku",
  rateLimit({
    windowMs: 60000, // 1 minute
    max: 60,
    handler: (req, res) =>
      res.status(429).send(JSON.stringify(limiter, null, 2)),
  })
);

app.use((req, res, next) => {
  const { HTTP_AUTH_USERNAME, HTTP_AUTH_PASSWORD } = process.env;

  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  if (
    login &&
    password &&
    login === HTTP_AUTH_USERNAME &&
    password === HTTP_AUTH_PASSWORD
  )
    return next();

  res
    .set("WWW-Authenticate", 'Basic realm="401"')
    .status(401)
    .send(
      JSON.stringify(
        {
          statusCode: 401,
          code: "Unauthorized",
          message:
            "The pages you are trying to access requires authentication. Please try again.",
        },
        null,
        2
      )
    );
});

const messagesRouter = require("./routes/messages.route");
const herokuRouter = require("./routes/heroku.route");
const lineRouter = require("./routes/line.route");
app.use("/", messagesRouter);
app.use("/heroku", herokuRouter);
app.use("/line", lineRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
