const router = require("express").Router();

router.get("/", (_, res) => {
  return res.status(200).send(
    JSON.stringify(
      {
        statusCode: 200,
        statusMessage: "Ok",
        environment: process.env.NODE_ENV,
        message: "Server is up and running",
      },
      null,
      2
    )
  );
});

module.exports = router;
