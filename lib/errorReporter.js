const axios = require("axios");

function errorReporter(error) {
  console.warn(error);

  process.env.NODE_ENV === "production"
    ? axios
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
        .catch((err) => console.error(err))
    : null;
}

module.exports = errorReporter;
