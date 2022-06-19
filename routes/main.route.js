const router = require("express").Router();
const axios = require("axios");

router.get("/", (_, res) => {
  return res.status(200).send(
    JSON.stringify(
      {
        statusCode: 200,
        code: "Ok",
        environment: process.env.NODE_ENV,
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
    .then((logs) => {
      const data = JSON.stringify(logs.data?.data, null, 2);
      if (req.query.download) {
        res.set({
          "Content-Disposition": "attachment; filename=pipedream.json",
        });
        res.status(200).send(data);
      } else res.status(200).send(data);
    })
    .catch((err) => {
      errorReporter(err);
      res.status(400).send(JSON.stringify(err, null, 2));
    })
    .catch((err) => res.status(400).send(JSON.stringify(err, null, 2)));
});

router.delete("/pipedream", (req, res) => {
  axios
    .delete("https://api.pipedream.com/v1/sources/dc_zqu8VnW/events", {
      headers: {
        Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
      },
    })
    .then(() =>
      res.status(200).send(
        JSON.stringify(
          {
            statusCode: 200,
            code: "Ok",
          },
          null,
          2
        )
      )
    )
    .catch((err) => {
      errorReporter(err);
      res.status(400).send(JSON.stringify(err, null, 2));
    });
});

module.exports = router;
