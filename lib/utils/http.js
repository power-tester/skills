const https = require("node:https");
const { PKG_NAME } = require("../config");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": PKG_NAME } }, (res) => {
        if (res.statusCode >= 301 && res.statusCode <= 303 && res.headers.location) {
          return fetchUrl(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          }
        });
      })
      .on("error", reject);
  });
}

module.exports = { fetchUrl };
