const { putData, fetchData } = require("../lib/detaOperation");

const router = require("express").Router();

router.get("/", async (req, res) => {
  fetchData((data) => {
    // Get the properties of the data object which contains "_CF_" in the key
    const keys = Object.keys(data.data);
    const resetData = keys.filter(
      (key) => key.includes("_CF_") && !key.includes("MESSAGE")
    );

    // Set the value of the data object to false
    let restData = {};
    resetData.forEach((key) => (restData[key] = false));

    putData(restData, (data) => {
      res.status(data.statusCode).send(JSON.stringify(data.data, null, 2));
    });
  });
});

module.exports = router;
