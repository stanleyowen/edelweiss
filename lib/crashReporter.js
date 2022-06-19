const axios = require("axios");

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  axios
    .post(`${process.env.WEBHOOK_URL}/crashReporter`, {
      statusCode: 500,
      statusMessage: "Internal Server Error",
      originalError: {
        name: "Error",
        message: "Unhandled Rejection",
        reason,
        promise,
      },
    })
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
  axios
    .post(`${process.env.WEBHOOK_URL}/crashReporter`, {
      statusCode: 500,
      statusMessage: "Internal Server Error",
      originalError: {
        name: "Error",
        message: "Uncaught Exception",
        error,
      },
    })
    .then(() => {
      console.warn("Uncaught exception data sent. Exiting app...");
      process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});
