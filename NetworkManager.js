const request = require("request");
let env = require("dotenv");
env.config();

class NetworkManager {
  constructor() {}

  getRandomQuote(callback) {
    console.log("Random quote called");
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
          callback(errObj);
        } else {
          console.log("Response received");
          let obj = JSON.parse(body);
          if (obj.length == 0) {
            callback(errObj);
          } else {
            console.log(obj[0]);
            callback(null, obj[0]);
          }
        }
      }
    );
  }

}

module.exports = NetworkManager;
