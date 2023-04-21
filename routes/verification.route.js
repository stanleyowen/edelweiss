const { putData } = require("../lib/detaOperation");

const router = require("express").Router();

router.get("/", async (req, res) => {
  putData({ DAILY_1_CF_1: true, DAILY_1_CF_2: true }, (cb) => {
    res
      .status(cb.statusCode)
      .send(
        cb.statusCode === 200
          ? "Success"
          : "Something went wrong. Please try again"
      );
  });
});

module.exports = router;
