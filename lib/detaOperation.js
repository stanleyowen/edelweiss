const { Deta } = require("deta");
const errorReporter = require("../lib/errorReporter");

// Initialize Deta Base
const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base("line");

// Get specific data from the database based on key
async function getData(key, cb) {
  await db
    .get(key)
    .then((data) => cb({ statusCode: 200, data }))
    .catch((err) => {
      errorReporter(err);
      cb({ statusCode: err.statusCode ?? 400, data: err });
    });
}

// Fetch all the data from the database
async function fetchData(cb) {
  let res = await db.fetch();
  let data = res.items;

  // Fetch all the data from the database
  while (res.last) {
    res = await db.fetch({}, { last: res.last });
    data = data.concat(res.items);
  }

  // Change each object's "key" property to "value"
  data = data.map((item) => {
    return { [item.key]: item.value };
  });

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

async function putData(data, opt, cb) {
  // Check object length
  if (Object.keys(data).length === 1) {
    // Change the first propoerty of the data object to "value"
    data = { key: Object.keys(data)[0], value: data[Object.keys(data)[0]] };
    console.log(data, "hj");

    await db
      .put(data, data.key, opt)
      .then((data) => cb({ statusCode: 200, data }))
      .catch((err) => {
        errorReporter(err);
        cb({ statusCode: err.statusCode ?? 400, data: err });
      });
  } else {
    // seperate every data object into and combine into array
    data = Object.keys(data).map((key) => {
      return { key, value: data[key] };
    });

    await db.putMany(data, opt).then((data) =>
      cb({ statusCode: 200, data }).catch((err) => {
        errorReporter(err);
        cb({ statusCode: err.statusCode ?? 400, data: err });
      })
    );
  }
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

module.exports = { getData, fetchData, putData, deleteData };
