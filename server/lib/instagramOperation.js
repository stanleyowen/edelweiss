const Bluebird = require("bluebird");
const inquirer = require("inquirer");
const { IgApiClient, IgCheckpointError } = require("instagram-private-api");
const errorReporter = require("../lib/errorReporter");

const client = new IgApiClient();

let loginState = false;
let loginError = false;

// Instagram login workflow
// Perform the login process when the browser is loaded
(async () => {
  // Generate device id's before login
  await client.state.generateDevice(process.env.IG_USERNAME);

  // Login to Instagram
  Bluebird.try(async () => {
    await client.account
      .login(process.env.IG_USERNAME, process.env.IG_PASSWORD)
      .then(() => (loginState = true)); // Set login state to true
  })
    .catch(IgCheckpointError, async () => {
      console.log(ig.state.checkpoint); // Checkpoint info here
      await client.challenge.auto(true); // Requesting sms-code or click "It was me" button
      console.log(ig.state.checkpoint); // Challenge info here
      const { code } = await inquirer.prompt([
        {
          type: "input",
          name: "code",
          message: "Enter code",
        },
      ]);

      await client.challenge.sendSecurityCode(code);
      await client.account
        .login(process.env.IG_USERNAME, process.env.IG_PASSWORD)
        .then(() => (loginState = true)) // Set login state to true
        .catch((err) => {
          errorReporter(err);
          loginError = true;
        });
    })
    .catch((err) => {
      errorReporter(err);
      loginError = true;
      console.log("Could not resolve checkpoint:", err, err.stack);
    });
})();

async function sendDirectMessage(messageId, cb) {
  // Send 400 status code when login error
  if (loginError)
    return cb({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message:
        "Unexpected error occurred while logging in. Please try again later.",
    });

  // Send 401 status code while logging in
  if (!loginState)
    return cb({
      statusCode: 401,
      statusMessage: "Not Found",
      message: "Loading...",
    });

  // Check if the params object in env is not null
  const message = process.env[messageId];
  const userId = await client.user.getIdByUsername(
    process.env.IG_USERNAME_DESTINATION
  );
  const thread = await client.entity.directThread([userId.toString()]);

  // Check if the messages have been confirmed
  if (
    message &&
    (!process.env[`${messageId}_CF_1`] ||
      !process.env[`${messageId}_CF_2`] ||
      process.env[`${messageId}_CF_1`] === false ||
      process.env[`${messageId}_CF_2`] === false)
  )
    await thread
      .broadcastText(
        `${message}\n\nNote: For Instagram, please refer to the following link to confirm the task: ${process.env.SERVER_URL}/verification`.replace(
          /\\n/g,
          "\n"
        )
      )
      .then(() =>
        cb({
          statusCode: 200,
          statusMessage: "Ok",
          message: "Message sent successfully.",
        })
      )
      .catch((err) => {
        errorReporter(err);
        cb({ statusCode: err.statusCode ?? 400, data: err });
      });
  else
    cb({
      statusCode: 200,
      statusMessage: "Ok",
    });
}

module.exports = { sendDirectMessage };
