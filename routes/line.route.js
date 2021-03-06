const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");
const errorReporter = require("../lib/errorReporter");
const {
  validateKeywords,
  validateBotCommands,
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
    // Split words into an array
    const text = removeDuplicates(req.body.events[0].message.text).split(" ");
    let idx = 0,
      isContinue = true;

    if (process.env.NODE_ENV !== "development")
      axios.post(`${process.env.WEBHOOK_URL}/line`, req.body);

    // Check whether its a bot command
    // A bot command is a word that starts with '/'
    if (text[0].includes("/") && text[0].indexOf("/") === 0)
      validateBotCommands(text[0], req.body.events[0].replyToken, (cb) =>
        res.status(cb.statusCode).send(cb)
      );
    else {
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
    }
  }
});

// Send message to destination user with id params
router.get("/:id", (req, res) => {
  // Check if the params object in env is not null
  const message = process.env[req.params.id];

  // Check if the messages have been confirmed
  if (
    message &&
    (!process.env[`${req.params.id}_CF_1`] ||
      !process.env[`${req.params.id}_CF_2`] ||
      process.env[`${req.params.id}_CF_1`] === "false" ||
      process.env[`${req.params.id}_CF_2`] === "false")
  )
    client
      .multicast(clientDestination, {
        type: "text",
        text: message.replace(/\\n/g, "\n"),
      })
      .then(() =>
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
        )
      )
      .catch((err) => {
        errorReporter(err);
        res.status(err.statusCode ?? 400).send(JSON.stringify(err, null, 2));
      });
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
});

module.exports = router;
