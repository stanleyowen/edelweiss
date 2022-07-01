const Bluebird = require("bluebird");
const inquirer = require("inquirer");
const router = require("express").Router();
const { IgApiClient, IgCheckpointError } = require("instagram-private-api");
const errorReporter = require("../lib/errorReporter");

const client = new IgApiClient();

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
      await client.challenge.auto(true); // Requesting sms-code or click "It was me" button
      const { code } = await inquirer.prompt([
        {
          type: "input",
          name: "code",
          message: "Enter code",
        },
      ]);
      console.log(await client.challenge.sendSecurityCode(code));
    })
    .catch((e) => console.log("Could not resolve checkpoint:", e, e.stack));
})();

router.get("/", async (req, res) => {
  const userId = await client.user.getIdByUsername(
    process.env.IG_USERNAME_DESTINATION
  );
  const thread = await client.entity.directThread([userId.toString()]);
  await thread
    .broadcastText("Hello world!")
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
