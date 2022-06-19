const router = require("express").Router();
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const errorReporter = require("../lib/errorReporter");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

router.get("/env-vars/:app_name", (req, res) => {
  heroku
    .get(`/apps/${req.params.app_name}/config-vars`)
    .then((env) => res.status(200).send(JSON.stringify(env, null, 2)))
    .catch((err) => {
      errorReporter(err);
      res.status(400).send(JSON.stringify(err, null, 2));
    });
});

router.patch("/env-vars/:app_name", (req, res) => {
  const { body } = req;
  heroku
    .patch(`/apps/${req.params.app_name}/config-vars`, {
      body,
    })
    .then((env) => res.status(200).send(JSON.stringify(env, null, 2)))
    .catch((err) => {
      errorReporter(err);
      res.status(400).send(JSON.stringify(err, null, 2));
    });
});

module.exports = router;
