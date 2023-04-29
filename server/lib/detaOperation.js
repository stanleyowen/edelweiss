const { Deta } = require("deta");
const axios = require("axios");
const errorReporter = require("../lib/errorReporter");

const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base("line");

// Fetch all the data from the database
async function fetchData(cb) {
  let res = await db.fetch();
  let data = res.items;

  // Fetch all the data from the database when limit is reached
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

async function putData(data, cb) {
  // Check object length
  if (Object.keys(data).length === 1) {
    // Change the first propoerty of the data object to "value"
    data = { key: Object.keys(data)[0], value: data[Object.keys(data)[0]] };

    await db
      .put(data, data.key)
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

    await db
      .putMany(data.slice(0, 25))
      .then(async (res) => {
        // send the second request if the length of data is larger than 25
        if (data.length > 25) {
          let res = {};
          data.slice(25).forEach((item) => {
            res[item.key] = item.value;
          });

          await axios.put(`${process.env.SERVER_URL}/deta`, res, {
            auth: {
              username: process.env.HTTP_AUTH_USERNAME,
              password: process.env.HTTP_AUTH_PASSWORD,
            },
          });
        }
        cb({ statusCode: 200, res });
      })
      .catch((err) => {
        errorReporter(err);
        cb({ statusCode: err.statusCode ?? 400, data: err });
      });
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

module.exports = { fetchData, putData, deleteData };
