const router = require("express").Router();
const axios = require("axios");

router.get("/", (_, res) => {
  return res.status(200).send(
    JSON.stringify(
      {
        statusCode: 200,
        code: "Ok",
        message: "Server is up and running",
      },
      null,
      2
    )
  );
});

router.get("/pipedream", (req, res) => {
  axios
    .get(
      "https://api.pipedream.com/v1/sources/dc_zqu8VnW/event_summaries?expand=event",
      {
        headers: {
          Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
        },
      }
    )
    .then((logs) =>
      res.status(200).send(JSON.stringify(logs.data?.data, null, 2))
    )
    .catch((err) => res.status(400).send(JSON.stringify(err, null, 2)));
});

module.exports = router;
