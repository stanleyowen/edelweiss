const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");
const errorReporter = require("../lib/errorReporter");
const {
  validateKeywords,
  replayMessageReaction,
  validateBotCommands,
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
    // Split words into an array
    const text = removeDuplicates(req.body.events[0].message.text).split(" ");
    let idx = 0,
      isContinue = true;

    if (process.env.NODE_ENV !== "development")
      axios.post(`${process.env.WEBHOOK_URL}/line`, req.body);

    // Check whether its a bot command
    // A bot command is a word that starts with '/'
    if (text[0].includes("/") && text[0].indexOf("/") === 0) {
      validateBotCommands(text[0], req.body.events[0].replyToken, (cb) => {
        res.status(cb.statusCode).send(cb);
      });
    } else {
      // Loop each word while the index is less than the length of the text and isContinue is true
      while (isContinue && idx < text.length) {
        // Stop the loop if the word is included in the keywords
        if (
          validateKeywords("okay", text[idx]) ||
          validateKeywords("laugh", text[idx])
        )
          isContinue = false;

        if (validateKeywords("okay", text[idx]))
          replayMessageReaction("okay", req.body, (cb) =>
            res.status(cb.statusCode).send(JSON.stringify(cb, null, 2))
          );
        else if (validateKeywords("laugh", text[idx]))
          replayMessageReaction("laugh", req.body, (cb) =>
            res.status(cb.statusCode).send(JSON.stringify(cb, null, 2))
          );

        idx++;
      }

      // If the index is greater than the length of the text and isContinue is still true,
      // returns no category message
      if (isContinue)
        res.status(200).send(
          JSON.stringify(
            {
              statusCode: 200,
              statusMessage: "Ok",
            },
            null,
            2
          )
        );
      else
        res.status(200).send(
          JSON.stringify(
            {
              statusCode: 200,
              statusMessage: "Ok",
            },
            null,
            2
          )
        );
    }
  }
});

router.get("/:id", (req, res) => {
  const message = process.env[req.params.id];
  if (
    message &&
    (!process.env[`${req.params.id}_CF_MESSAGE_1`] ||
      !process.env[`${req.params.id}_CF_MESSAGE_2`])
  )
    client
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
      });
  else
    res.status(404).send(
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

module.exports = router;
