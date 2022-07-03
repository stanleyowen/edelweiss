const axios = require("axios");

function errorReporter(error) {
  console.warn(error);

  // Only send the error to the webhook on "staging" amd "production" environment
  if (
    process.env.NODE_ENV === "staging" ||
    process.env.NODE_ENV === "production"
  )
    axios
      .post(`${process.env.WEBHOOK_URL}/errorReporter`, {
        statusCode: error?.response?.status ?? 500,
        statusMessage: error?.response?.statusText ?? "Internal Server Error",
        originalError: {
          name: error?.response?.data?.name ?? "Error",
          message: error?.response?.data?.message ?? "Unknown Error",
          error: error?.response?.data?.error ?? error,
        },
      })
      .then(() => console.info("Error data sent"))
      .catch((err) => console.error(err));
}

module.exports = errorReporter;
