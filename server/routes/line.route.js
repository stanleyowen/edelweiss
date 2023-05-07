const router = require("express").Router();
const axios = require("axios");
const line = require("@line/bot-sdk");
const errorReporter = require("../lib/errorReporter");
const {
  validateKeywords,
  validateBotCommands,
  replayMessageReaction,
} = require("../lib/lineOperation");
const { fetchData } = require("../lib/detaOperation");
const { getToken } = require("../lib/getToken");

let client = null;
getToken(
  (token) =>
    (client = new line.Client({ channelAccessToken: process.env[token] }))
);

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

router.post("/webhooks", async (req, res) => {
  // Check if request body object is not null
  if (Object.keys(req.body).length > 0) {
    // Removes duplicate characters from the string
    // Split words into an array
    let type = req.body.events[0]?.type,
      text = null;
    if (type === "message")
      text = String(req.body.events[0].message.text).toLowerCase().split(" ");
    const { userId } = req.body.events[0].source;

    let idx = 0,
      isContinue = true;

    if (process.env.NODE_ENV !== "development")
      await axios.post(
        `${process.env.WEBHOOK_URL}?thread_id=${process.env.INCOMING_MESSAGE_THREAD_ID}`,
        {
          content:
            "**Info** :information_source:\n```json\n" +
            JSON.stringify(req.body, null, 2) +
            "```",
        }
      );

    // Check whether its a bot command
    // A bot command is a word that starts with '/'
    if (userId && text && text[0].includes("/") && text[0].indexOf("/") === 0)
      validateBotCommands(userId, text, req.body.events[0].replyToken, (cb) =>
        res.status(cb.statusCode).send(cb)
      );
    else if (text) {
      text = removeDuplicates(text.join(" ")).split(" ");
      // Loop each word while the index is less than the length of the text and isContinue is true
      while (isContinue && idx < text.length) {
        // Stop the loop if the word is included in the keywords
        if (
          validateKeywords("okay", text[idx]) ||
          validateKeywords("laugh", text[idx]) ||
          validateKeywords("greetings", text[idx]) ||
          validateKeywords("goodbye", text[idx])
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
        else if (validateKeywords("greetings", text[idx]))
          replayMessageReaction("greetings", req.body, (cb) =>
            res.status(cb.statusCode).send(JSON.stringify(cb, null, 2))
          );
        else if (validateKeywords("goodbye", text[idx]))
          replayMessageReaction("goodbye", req.body, (cb) =>
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
router.get("/:id/:uid", (req, res) => {
  const { uid, id } = req.params;
  fetchData((data) => {
    const message = data.data[id],
      nickname = data.data[`NICKNAME_${uid}`];

    // Check if the messages have been confirmed
    if (
      message &&
      nickname &&
      (!data.data[`${uid}_${id}_CF_1`] || !data.data[`${uid}_${id}_CF_2`])
    )
      client
        .pushMessage(uid, {
          type: "text",
          text: message.replace("{nickname}", nickname).replace(/\\n/g, "\n"),
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
        .catch(async (err) => {
          await errorReporter(err);

          // If the error status code is 429, change the channel access token
          if (err.statusCode === 429) {
            fetchData((data) => {
              let channelAccessToken = data.data["LINE_CHANNEL_ACCESS_TOKEN"];
              if (channelAccessToken === "LINE_CHANNEL_ACCESS_TOKEN")
                channelAccessToken = "LINE_CHANNEL_ACCESS_TOKEN_BACKUP";
              else channelAccessToken = "LINE_CHANNEL_ACCESS_TOKEN";

              putData({ LINE_CHANNEL_ACCESS_TOKEN: channelAccessToken }, () =>
                res.status(err.statusCode).send(JSON.stringify(err, null, 2))
              );
            });
          } else
            res
              .status(err.statusCode ?? 400)
              .send(JSON.stringify(err, null, 2));
        });
    else
      res.status(200).send(
        JSON.stringify(
          {
            statusCode: 200,
            statusMessage: "Done",
          },
          null,
          2
        )
      );
  });
});

module.exports = router;
