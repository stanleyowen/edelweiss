const router = require("express").Router();
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

router.get("/", (req, res) => {
  heroku
    .get("/apps", { body: { name: process.env.HEROKU_APP_NAME } })
    .then((app) => {
      res.send(app);
    })
    .catch((err) => res.send(err));
});

module.exports = router;
