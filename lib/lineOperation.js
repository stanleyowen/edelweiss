const line = require("@line/bot-sdk");
const stickers = require("../lib/sticker.lib.json");
const errorReporter = require("../lib/errorReporter");

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

function validateKeywords(category, message) {
  // Get category and save the category keywords to key
  let key = [];
  let isCategory = false;
  if (category === "okay")
    key = ["ya", "sip", "yup", "ok", "ye", "thx", "thank"];
  if (category === "laugh") key = ["wk", "ha", "lol"];
  if (category === "greetings") key = ["hi", "hello", "hey", "hola"];

  // Loop each keyword in key and check if the message contains the following keywords
  if (message)
    key.forEach((keyword) => {
      console.log(category, keyword, message);
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

module.exports = { validateKeywords, replayMessageReaction };
