const router = require("express").Router();
const axios = require("axios");
const errorReporter = require("../lib/errorReporter");

// Retrives pipedream logs
router.get("/", (req, res) => {
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
        // Set headers to attachment
        // The following headers will allow the browser to download the file
        res.set({
          "Content-Disposition": "attachment; filename=pipedream.json",
        });
        res.status(200).send(data);
      } else res.status(200).send(data);
    })
    .catch((err) => {
      errorReporter(err);
      res
        .status(err?.response?.status ?? 400)
        .send(JSON.stringify(err, null, 2));
    });
});

// Delete all pipedream logs
router.delete("/", (_, res) => {
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
            statusMessage: "Ok",
          },
          null,
          2
        )
      )
    )
    .catch((err) => {
      errorReporter(err);
      res
        .status(err?.response?.status ?? 400)
        .send(JSON.stringify(err, null, 2));
    });
});

module.exports = router;
