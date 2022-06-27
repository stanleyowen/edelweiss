const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
const errorReporter = require("../lib/errorReporter");

// Get the environment variables from Heroku
function getHerokuEnvVars(appName, cb) {
  heroku
    .get(`/apps/${appName}/config-vars`)
    .then((env) => cb({ statusCode: 200, data: env }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

// Update the environment variables on Heroku
// Using the vallue of null to delete variable(s)
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
