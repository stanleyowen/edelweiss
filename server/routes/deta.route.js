const router = require("express").Router();
const { putData, fetchData, deleteData } = require("../lib/detaOperation");

router.get("/", (req, res) =>
  fetchData((cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb.data, null, 2))
  )
);

router.put("/", (req, res) =>
  // Get the key from the first property of the body object
  putData(req.body, (cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb.data, null, 2))
  )
);

router.delete("/:key", (req, res) =>
  deleteData(req.params.key, (cb) =>
    res.status(cb.statusCode).send(JSON.stringify(cb, null, 2))
  )
);

module.exports = router;
