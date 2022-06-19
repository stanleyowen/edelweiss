const axios = require("axios");

process.on("unhandledRejection", (reason, promise) => {
  axios
    .post(`${process.env.WEBHOOK_URL}/logs`, {
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
      console.error("Unhandled Rejection Data sent. Exiting App...");
      process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});

process.on("uncaughtException", (error) => {
  axios
    .post(`${process.env.WEBHOOK_URL}/logs`, {
      statusCode: 500,
      statusMessage: "Internal Server Error",
      originalError: {
        name: "Error",
        message: "Uncaught Exception",
        error,
      },
    })
    .then(() => {
      console.warn("Uncaught Exception Data sent. Exiting App...");
      process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});
