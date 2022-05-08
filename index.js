const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

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
    max: 10,
    handler: (req, res) =>
      res.status(429).send(
        JSON.stringify(
          {
            statusCode: 429,
            code: "Too Many Requests",
            message:
              "We're sorry, but you have made too many requests to our servers. Please try again later.",
          },
          null,
          2
        )
      ),
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

app.get("/", (req, res) => {
  const accountSID = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSID, authToken);

  client.messages
    .create({
      to: `whatsapp:${process.env.TWILIO_RECIPIENT_NUMBER}`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      body: process.env.TWILIO_MESSAGE.replace(/\\n/g, "\n"),
    })
    .then(() => {
      return res.status(200).send(
        JSON.stringify(
          {
            statusCode: 200,
            code: "Ok",
            message: "Message sent successfully.",
          },
          null,
          2
        )
      );
    })
    .catch((err) => {
      return res.status(500).send(
        JSON.stringify(
          {
            statusCode: 500,
            code: "Internal Server Error",
            message: err.message,
          },
          null,
          2
        )
      );
    })
    .done();
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
