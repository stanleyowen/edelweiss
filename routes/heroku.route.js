const { getHerokuEnvVars } = require("../lib/herokuOperation");

const router = require("express").Router();

router.get("/env-vars/:app_name", (req, res) =>
  getHerokuEnvVars(req.params.app_name, (cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb.data, null, 2))
  )
);

router.patch("/env-vars/:app_name", (req, res) => {
  const { body } = req;
  heroku
    .patch(`/apps/${req.params.app_name}/config-vars`, {
      body,
    })
    .then((env) => res.status(200).send(JSON.stringify(env, null, 2)))
    .catch((err) => {
      errorReporter(err);
      res.status(err.statusCode ?? 400).send(JSON.stringify(err, null, 2));
    });
});

module.exports = router;
