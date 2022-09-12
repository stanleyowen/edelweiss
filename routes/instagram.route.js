const router = require("express").Router();
const { sendDirectMessage } = require("../lib/instagramOperation");

// Send message to destination user with id params
router.get("/:id", async (req, res) => {
  async function sendMessage() {
    sendDirectMessage(req.params.id, (cb) => {
      // Retry the request if the status code is 401
      // Which means the login process is not yet completed
      if (cb.statusCode === 401) setTimeout(() => sendMessage(), 1000);
      else res.status(cb.statusCode).send(JSON.stringify(cb, null, 2));
    });
  }

  sendMessage();
});

module.exports = router;
