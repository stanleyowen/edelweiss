const router = require("express").Router();
const line = require("@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
const clientDestination = process.env.LINE_DESTINATION_ID.split(",");

router.post("/webhook", (req, res) => {
  console.log(req.body?.events[0]);
  console.log("hi");
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
