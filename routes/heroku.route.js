const router = require("express").Router();
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

router.get("/env-vars", (req, res) => {
  heroku
    .get(`/apps/${process.env.HEROKU_APP_NAME}/config-vars`)
    .then((app) => res.status(200).send(JSON.stringify(app, null, 2)))
    .catch((err) => res.status(400).send(JSON.stringify(err, null, 2)));
});

router.patch("/env-vars", (req, res) => {
  const { body } = req;
  heroku
    .patch(`/apps/${process.env.HEROKU_APP_NAME}/config-vars`, {
      body: {
        ...body,
      },
    })
    .then((app) => res.status(200).send(JSON.stringify(app, null, 2)))
    .catch((err) => res.status(400).send(JSON.stringify(err, null, 2)));
});

module.exports = router;
