const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const rateLimit = require("express-rate-limit");

if (
  process.env.NODE_ENV !== "production" &&
  process.env.NODE_ENV !== "staging"
) {
  require("dotenv").config();
} else require("./lib/crashReporter");

const app = express();
const PORT = process.env.PORT || 5000;
const limiter = {
  statusCode: 429,
  code: "Too Many Requests",
  message:
    "We're sorry, but you have made too many requests to our servers. Please try again later.",
};

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || process.env.CORS_ORIGIN.split(",").indexOf(origin) !== -1)
        cb(null, true);
      else
        cb(
          JSON.stringify(
            {
              statusCode: 401,
              code: "Unauthorized",
              message:
                "Connnection has been blocked by CORS Policy: The origin header(s) is not equal to the supplied origin.",
            },
            null,
            2
          )
        );
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((_, res, next) => {
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
    req.path === "/" ||
    (req.path === "/line/webhooks" && req.method === "POST") ||
    (login &&
      password &&
      login === HTTP_AUTH_USERNAME &&
      password === HTTP_AUTH_PASSWORD)
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

const mainRouter = require("./routes/main.route");
const lineRouter = require("./routes/line.route");
const herokuRouter = require("./routes/heroku.route");
const whatsAppRouter = require("./routes/whatsapp.route");
const pipedreamRouter = require("./routes/pipedream.route");
app.use("/", mainRouter);
app.use("/line", lineRouter);
app.use("/whatsapp", whatsAppRouter);
app.use("/heroku", herokuRouter);
app.use("/pipedream", pipedreamRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
