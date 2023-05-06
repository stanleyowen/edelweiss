const axios = require("axios");

// These following functions sent errors to the webhook endpoint
function errorReporter(error) {
  console.warn(error);

  // Only send the error to the webhook endpoint on "staging" amd "production" environment
  if (
    process.env.NODE_ENV === "staging" ||
    process.env.NODE_ENV === "production"
  ) {
    axios
      .post(
        `${process.env.WEBHOOK_URL}?thread_id=${process.env.ERROR_THREAD_ID}`,
        {
          content:
            "**Error Reporter** :x:\n```json\n" +
            JSON.stringify(error, null, 2) +
            "```",
        }
      )
      .then(() => console.info("Error data sent"))
      .catch((err) => console.error(err));
  }
}

module.exports = errorReporter;
