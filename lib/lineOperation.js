const line = require("@line/bot-sdk");
const stickers = require("../lib/sticker.lib.json");
const errorReporter = require("../lib/errorReporter");
const { fetchData, putData } = require("./detaOperation");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

function validateKeywords(category, message) {
  // Get category and save the category keywords to key
  let key = [];
  let isCategory = false;

  if (category === "okay")
    key = ["ya", "sip", "yup", "ok", "ye", "thx", "thank"];
  if (category === "laugh") key = ["wk", "ha", "lol", "yey"];
  if (category === "greetings") key = ["hi", "hello", "hey", "hola"];
  if (category === "goodbye") key = ["bye", "bai", "gn", "sd", "nite"];

  // Loop each keyword in key and check if the message contains the following keywords
  if (message)
    key.forEach((keyword) => {
      if (message.includes(keyword) && message.indexOf(keyword) <= 1)
        // Use OR method to make sure it returns true when the previous state is false
        isCategory = isCategory || true;
    });

  return isCategory ? category : false;
}

function replayMessageReaction(category, body, cb) {
  // Get the category and save the stickers length
  const stickerIndex = Math.floor(Math.random() * stickers[category].length);

  // Send the sticker to the user
  client
    .replyMessage(body.events[0].replyToken, {
      type: "sticker",
      packageId: stickers[category][stickerIndex].packageId,
      stickerId: stickers[category][stickerIndex].stickerId,
    })
    .then(() =>
      // Return the status code and message after the sticker is sent
      cb({
        statusCode: 200,
        statusMessage: "Ok",
        message: "Reply Message sent successfully.",
      })
    )
    .catch((err) => {
      // Return errors if something went wrong
      errorReporter(err);
      cb({
        statusCode: 400,
        ...err,
      });
    });
}

function validateBotCommands(commandType, token, cb) {
  let appEnv = null,
    message = null;

  // Get the list of data from Deta
  fetchData((data) => {
    if (commandType === "/done") appEnv = "DAILY_1";

    // Check whether the message has been replied
    // If the message has been replied once, the second reminder will be sent
    if (data.data[`${appEnv}_CF_1`] === "true") {
      data.data[`${appEnv}_CF_2`] = "true";
      message = process.env[`${appEnv}_CF_MESSAGE_2`];
    } else {
      data.data[`${appEnv}_CF_1`] = "true";
      message = process.env[`${appEnv}_CF_MESSAGE_1`];
    }

    // Update the data
    putData(data.data, () =>
      // Sent confirmation message to the user
      client
        .replyMessage(token, {
          type: "text",
          text: message?.replace(/\\n/g, "\n"),
        })
        .then(() =>
          cb({
            statusCode: 200,
            statusMessage: "Ok",
            message: "Reply Message sent successfully.",
          })
        )
        .catch((err) => {
          errorReporter(err);
          cb({
            statusCode: 400,
            ...err,
          });
        })
    );
  });
}

module.exports = {
  validateKeywords,
  replayMessageReaction,
  validateBotCommands,
};
