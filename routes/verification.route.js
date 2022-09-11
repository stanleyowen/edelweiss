const { updateHerokuEnvVars } = require("../lib/herokuOperation");

const router = require("express").Router();

router.get("/", async (req, res) => {
  let appName =
    (process.env.NODE_ENV === "production" ? "bot" : "dev") + "-edelweiss";

  updateHerokuEnvVars(
    appName,
    { DAILY_1_CF_MESSAGE_1: "true", DAILY_1_CF_MESSAGE_2: "true" },
    (cb) => {
      res
        .status(cb.statusCode)
        .send(
          cb.statusCode === 200
            ? "Success"
            : "Something went wrong. Please try again"
        );
    }
  );
});

module.exports = router;
