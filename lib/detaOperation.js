const { Deta } = require("deta");
const errorReporter = require("../lib/errorReporter");

// Initialize Deta Base
const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base("line");

async function fetchData(cb) {
  let res = await db.fetch();
  let data = res.items;

  // Fetch all the data from the database
  while (res.last) {
    res = await db.fetch({}, { last: res.last });
    data = data.concat(res.items);
  }

  // Combine all the data into one object and remove the "key" property
  data = data.reduce((acc, cur) => {
    delete cur.key;
    return { ...acc, ...cur };
  }, {});

  cb({ statusCode: 200, data });
}

async function putData(data, key, opt, cb) {
  await db
    .put(data, key, opt)
    .then((data) => cb({ statusCode: 200, data }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

async function deleteData(key, cb) {
  await db
    .delete(key)
    .then((data) => cb({ statusCode: 200, data }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

module.exports = { putData, fetchData, deleteData };
