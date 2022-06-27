const router = require("express").Router();
const {
  getHerokuEnvVars,
  updateHerokuEnvVars,
} = require("../lib/herokuOperation");

router.get("/env-vars/:app_name", (req, res) =>
  getHerokuEnvVars(req.params.app_name, (cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb.data, null, 2))
  )
);

router.patch("/env-vars/:app_name", (req, res) =>
  updateHerokuEnvVars(req.params.app_name, req.body, (cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb.data, null, 2))
  )
);

module.exports = router;
