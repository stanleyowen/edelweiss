const line = require("@line/bot-sdk");
const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
const clientDestination = process.env.LINE_DESTINATION_ID.split(",");

function validateKeywords(category, message) {
  // Get category and save the category keywords to key
  let key = [];
  let isCategory = false;
  if (category === "okay") key = ["ya", "sip", "yup", "ok", "ye"];
  if (category === "laugh") key = ["wk", "ha", "lol"];

  // Loop each keyword in key and check if the message contains the following keywords
  key.forEach((keyword) => {
    if (message.includes(keyword) && message.indexOf(keyword) <= 1)
      // Use OR method to make sure it returns true when the previous state is false
      isCategory = isCategory || true;
  });

  return isCategory;
}

function replayMessageReaction(category, body, cb) {
  // Get the category and save the stickers length
  const stickerIndex = Math.floor(Math.random() * stickers[category].length);

  client
    .replyMessage(body.events[0].replyToken, {
      type: "sticker",
      packageId: stickers[category][stickerIndex].packageId,
      stickerId: stickers[category][stickerIndex].stickerId,
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
    });
}

module.exports = { validateKeywords, replayMessageReaction };
