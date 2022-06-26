const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const errorReporter = require("../lib/errorReporter");

function getHerokuEnvVars(appName, cb) {
  heroku
    .get(`/apps/${appName}/config-vars`)
    .then((env) => cb({ statusCode: 200, data: env }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

function updateHerokuEnvVars(appName, body, cb) {
  heroku
    .patch(`/apps/${appName}/config-vars`, {
      body,
    })
    .then((env) => cb({ statusCode: 200, data: env }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

module.exports = { getHerokuEnvVars, updateHerokuEnvVars };
