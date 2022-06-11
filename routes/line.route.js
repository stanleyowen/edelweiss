const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
const clientDestination = process.env.LINE_DESTINATION_ID.split(",");

router.post("/webhooks", (req, res) => {
  if (req.body) {
    axios.post("https://eo22dsoei0ug3vt.m.pipedream.net", req.body).then(() => {
      return res.status(200).send(
        JSON.stringify(
          {
            statusCode: 200,
            code: "Ok",
          },
          null,
          2
        )
      );
    });
  } else res.send("ok").end();
});

router.get("/:id", (req, res) => {
  const message = process.env[req.params.id];
  if (message) {
    client
      .multicast(clientDestination, {
        type: "text",
        text: message.replace(/\\n/g, "\n"),
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
      });
  }
});

module.exports = router;
