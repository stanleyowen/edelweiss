const axios = require("axios");

// These following functions catch unexpected errors which cause server to crash
// Errors occurred will be sent to the webhook endpoint
// Exits the process with the error code

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  const data = {
    statusCode: 500,
    statusMessage: "Internal Server Error",
    originalError: {
      name: "Error",
      message: "Unhandled Rejection",
      reason: reason
        ? {
            name: reason.name,
            message: reason.message,
            stack: reason.stack,
          }
        : reason,
      promise: promise
        ? {
            name: promise.name,
            message: promise.message,
            stack: promise.stack,
          }
        : promise,
    },
  };

  axios
    .post(
      `${process.env.WEBHOOK_URL}?thread_id=${process.env.ERROR_THREAD_ID}`,
      {
        content:
          "**Unhandled Rejection** :x:\n```json\n" +
          JSON.stringify(data, null, 2) +
          "```",
      }
    )
    .then(() => {
      console.error("Unhandled rejection data sent. Exiting app...");
      process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});

process.on("uncaughtException", (error) => {
  console.error(error);
  const data = {
    statusCode: 500,
    statusMessage: "Internal Server Error",
    originalError: {
      name: "Error",
      message: "Uncaught Exception",
      error,
    },
  };

  axios
    .post(
      `${process.env.WEBHOOK_URL}?thread_id=${process.env.ERROR_THREAD_ID}`,
      {
        content:
          "**Uncaught Exception** :x:\n```json\n" +
          JSON.stringify(data, null, 2) +
          "```",
      }
    )
    .then(() => {
      console.warn("Uncaught exception data sent. Exiting app...");
      process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});
