const router = require("express").Router();
const fs = require("fs");

router.get("/", (req, res) => {
  // const accountSID = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const client = require("twilio")(accountSID, authToken);
  //
  // client.messages
  // .create({
  //   to: `whatsapp:${process.env.TWILIO_RECIPIENT_NUMBER}`,
  //   from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
  //   body: process.env.TWILIO_MESSAGE.replace(/\\n/g, "\n"),
  // })
  // .then(() => {
  //   return res.status(200).send(
  //     JSON.stringify(
  //       {
  //         statusCode: 200,
  //         code: "Ok",
  //         message: "Message sent successfully.",
  //       },
  //       null,
  //       2
  //     )
  //   );
  // })
  // .catch((err) => {
  //   return res.status(500).send(
  //     JSON.stringify(
  //       {
  //         statusCode: 500,
  //         code: "Internal Server Error",
  //         message: err.message,
  //       },
  //       null,
  //       2
  //     )
  //   );
  // })
  // .done();

  fs.createReadStream("does-not-exist.txt");
  // res.status(410).send(
  //   JSON.stringify(
  //     {
  //       statusCode: 410,
  //       code: "Gone",
  //     },
  //     null,
  //     2
  //   )
  // );
});

module.exports = router;
