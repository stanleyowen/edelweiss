const Bluebird = require("bluebird");
const inquirer = require("inquirer");
const router = require("express").Router();
const { IgApiClient, IgCheckpointError } = require("instagram-private-api");
const errorReporter = require("../lib/errorReporter");

const client = new IgApiClient();

// Login function
(async () => {
  // Generate device id's before login
  await client.state.generateDevice(process.env.IG_USERNAME);

  // Login to Instagram
  Bluebird.try(async () => {
    await client.account.login(
      process.env.IG_USERNAME,
      process.env.IG_PASSWORD
    );
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
      await client.account.login(
        process.env.IG_USERNAME,
        process.env.IG_PASSWORD
      );
    })
    .catch((e) => console.log("Could not resolve checkpoint:", e, e.stack));
})();

// Send message to destination user with id params
router.get("/:id", async (req, res) => {
  // Check if the params object in env is not null
  const message = process.env[req.params.id];
  const userId = await client.user.getIdByUsername(
    process.env.IG_USERNAME_DESTINATION
  );
  const thread = await client.entity.directThread([userId.toString()]);

  await thread
    .broadcastText(message.replace(/\\n/g, "\n"))
    .then(() =>
      res.status(200).send(
        JSON.stringify(
          {
            statusCode: 200,
            statusMessage: "Ok",
            message: "Message sent successfully.",
          },
          null,
          2
        )
      )
    )
    .catch((err) => {
      errorReporter(err);
      res.status(err.statusCode ?? 400).send(JSON.stringify(err, null, 2));
    });
});

module.exports = router;
