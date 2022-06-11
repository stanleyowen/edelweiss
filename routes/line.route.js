const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");
const stickers = require("../lib/sticker.lib.json");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
const clientDestination = process.env.LINE_DESTINATION_ID.split(",");

router.post("/webhooks", (req, res) => {
  const { text } = req.body.events[0].message;
  if (req.body) {
    axios.post(process.env.LINE_WEBHOOK_URL, req.body);
    if (
      text.toLowerCase().includes("ok") ||
      text.toLowerCase().includes("ya") ||
      text.toLowerCase().includes("yea") ||
      text.toLowerCase().includes("sip")
    ) {
      const stickerIndex = Math.floor(Math.random() * stickers.okay.length);
      client
        .replyMessage(req.body.events[0].replyToken, {
          type: "sticker",
          packageId: stickers.okay[stickerIndex].packageId,
          stickerId: stickers.okay[stickerIndex].stickerId,
        })
        .then(() => {
          return res.status(200).send(
            JSON.stringify(
              {
                statusCode: 200,
                code: "Ok",
                message: "Reply Message sent successfully.",
              },
              null,
              2
            )
          );
        });
    }
  } else
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

router.get("/:id", (req, res) => {
  const message = process.env[req.params.id];
  message
    ? client
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
        })
    : res.status(404).send(
        JSON.stringify(
          {
            statusCode: 404,
            code: "Not Found",
          },
          null,
          2
        )
      );
});

module.exports = router;
