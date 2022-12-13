const request = require("request");
let env = require("dotenv");
env.config();

class NetworkManager {
  constructor() {}

  getRandomQuote() {
    var category = "happiness";
    request.get(
      {
        url: "https://api.api-ninjas.com/v1/quotes?category=" + category,
        headers: {
          "X-Api-Key": process.env.API_KEY,
        },
      },
      function (err, res, body) {
        let errObj = {
          quote: "No quotes found",
          author: "N/A",
        };

        if (err || res.statusCode != 200) {
          console.log("err:" + body.toString("utf8"));
          return errObj;
        } else {
          let obj = JSON.parse(body);
          if (obj.length == 0) {
            return errObj;
          } else {
            console.log(obj);
            return obj[0];
          }
        }
      }
    );
  }
}

module.exports = NetworkManager;
