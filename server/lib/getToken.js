const { fetchData } = require("./detaOperation");

async function getToken(cb) {
  await fetchData((data) => cb(data.data["LINE_CHANNEL_ACCESS_TOKEN"]));
}

module.exports = { getToken };
