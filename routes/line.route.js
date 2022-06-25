const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");
const stickers = require("../lib/sticker.lib.json");
const errorReporter = require("../lib/errorReporter");
const {
  validateKeywords,
  replayMessageReaction,
} = require("../lib/lineOperation");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
const clientDestination = process.env.LINE_DESTINATION_ID.split(",");

function removeDuplicates(str) {
  // Split words into an array
  // Remove duplicates from each word and push to sentences
  // Remove punctuation from each word and push to sentences except for the '/'
  const sentences = [];
  const words = str.replace(/[^\w\s\/]/gi, "").split(" ");

  words.forEach((word) =>
    sentences.push([...new Set(word.split(""))].join(""))
  );

  return sentences.join(" ");
}

router.post("/webhooks", (req, res) => {
  // Check if request body object is not null
  if (Object.keys(req.body).length > 0) {
    // Removes duplicate characters from the string
    // Split words into an array including punctuation
    const text = removeDuplicates(req.body.events[0].message.text).split(" ");
    let idx = 0;

    if (process.env.NODE_ENV !== "development")
      axios.post(`${process.env.WEBHOOK_URL}/line`, req.body);

    while (
      (validateKeywords("okay", text[idx]) ||
        validateKeywords("laugh", text[idx])) &&
      idx < text.length
    ) {
      if (validateKeywords("okay", text[idx]))
        replayMessageReaction("okay", req.body, (cb) =>
          res.status(cb.statusCode).send(JSON.stringify(cb, null, 2)).end()
        );
      else if (validateKeywords("laugh", text[idx]))
        replayMessageReaction("laugh", req.body, (cb) =>
          res.status(cb.statusCode).send(JSON.stringify(cb, null, 2)).end()
        );
      idx++;
    }
    return res.status(200).send(
      JSON.stringify(
        {
          statusCode: 200,
          statusMessage: "Ok",
        },
        null,
        2
      )
    );
});

router.post("/webhookss", (req, res) => {
  const text = removeDuplicates(req.body.events[0].message.text);
  // stickers.okay.forEach((sticker) => {
  //   client
  //     .multicast(clientDestination, {
  //       type: "sticker",
  //       packageId: sticker.packageId,
  //       stickerId: sticker.stickerId,
  //     })
  //     .then(() => console.log("done"))
  //     .catch((err) => {
  //       // errorReporter(err);
  //       res.status(err.statusCode ?? 400).send(JSON.stringify(err, null, 2));
  //     });
  // });
  // replayMessageReaction(validateKeywords("okay", text), req.body, (cb) => {
  //   res.status(cb.statusCode).send(JSON.stringify(cb, null, 2));
  console.log(validateKeywords("laugh", text));
  // });
  // } else
  //   return res.status(200).send(
  //     JSON.stringify(
  //       {
  //         statusCode: 200,
  //         statusMessage: "Ok",
  //         isOkay: validateKeywords("okay", text),
  //         isLaught: validateKeywords("laugh", text),
  //       },
  //       null,
  //       2
  //     )
  //   );
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
          res.status(200).send(
            JSON.stringify(
              {
                statusCode: 200,
                statusMessage: "Ok",
                message: "Message sent successfully.",
              },
              null,
              2
            )
          );
        })
        .catch((err) => {
          errorReporter(err);
          res.status(err.statusCode ?? 400).send(JSON.stringify(err, null, 2));
        })
    : res.status(404).send(
        JSON.stringify(
          {
            statusCode: 404,
            statusMessage: "Not Found",
          },
          null,
          2
        )
      );
});

module.exports = router;
