const axios = require("axios");

// These following functions sent errors to the webhook endpoint
function errorReporter(error) {
  console.warn(error);

  // Only send the error to the webhook endpoint on "staging" amd "production" environment
  if (
    process.env.NODE_ENV === "staging" ||
    process.env.NODE_ENV === "production"
  ) {
    const data = {
      statusCode: error?.response?.status ?? 500,
      statusMessage: error?.response?.statusText ?? "Internal Server Error",
      originalError: {
        name: error?.response?.data?.name ?? "Error",
        message: error?.response?.data?.message ?? "Unknown Error",
        error: error?.response?.data?.error ?? error,
      },
    };

    axios
      .post(`${process.env.WEBHOOK_URL}`, {
        content:
          "**Error Reporter** :x:\n```json\n" +
          JSON.stringify(data, null, 2) +
          "```",
      })
      .then(() => console.info("Error data sent"))
      .catch((err) => console.error(err));
  }
}

module.exports = errorReporter;
