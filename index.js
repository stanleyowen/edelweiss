const express = require("express");
const app = express();
const port = 3000;

if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=UTF-8");

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

app.get("/", (_, res) => {
  const accountSID = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSID, authToken);

  client.messages
    .create({
      to: `whatsapp:${process.env.TWILIO_RECIPIENT_NUMBER}`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      body: process.env.TWILIO_MESSAGE,
    })
    .then(() =>
      res.send(
        JSON.stringify(
          {
            statusCode: 200,
            code: "Ok",
            message: "Message sent successfully.",
          },
          null,
          2
        )
      )
    )
    .catch((err) => {
      res.send(
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

  res.send(process.env.TWILIO_MESSAGE.replace(/\\n/g, "\n"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
