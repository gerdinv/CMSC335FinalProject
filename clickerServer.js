"use strict";
const NetworkManager = require("./NetworkManager.js");
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser"); /* To handle post parameters */
require("dotenv").config({ path: path.resolve(__dirname, "credentials/.env") });
const user = process.env.MONGO_DB_USERNAME;
const pass = process.env.MONGO_DB_PASSWORD;
const database = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};
const { MongoClient, ServerApiVersion } = require("mongodb");
let client = null;
let networkManager = new NetworkManager();
let session = {};

main();

//ROUTES:
app.get("/", (req, res) => {
  res.render("mainPage");
});
app.get("/playPage", (req, res) => {
  res.render("playPage");
});

app.post("/gamePage", async (req, res) => {
  let variables = {
    Name: req.body.name,
    numOfClicks: 0,
  };
  networkManager.getRandomQuote(function (err, quote) {
    variables["quote"] = err ? "Error getting quote" : quote["quote"];
    variables["author"] = err ? "N/A" : quote["author"];

    //Render HTML
    res.render("gamePage", variables);
  });

  const collection = client.db(database.db).collection(database.collection);
  const { name } = req.body;
  const result = await collection.findOne({ name: name });

  //Add userName to the Database
  if (result) {
    //have user should update a session user
    session = result;
    variables["numOfClicks"] = session.numOfClicks;
  } else {
    //user doesn't exist place user
    session = { name: name, numOfClicks: 0 };
    await collection.insertOne({ name: name, numOfClicks: 0 });
  }
});

app.post("/savedSession", async (req, res) => {
  let variables = { totalClicks: 0 };

  const collection = client.db(database.db).collection(database.collection);
  const result = await collection.findOne(session);
  const { numOfClicks } = req.body;

  if (result) {
    const total = result.numOfClicks + Number(numOfClicks);
    collection.updateOne(
      { name: result.name },
      { $set: { numOfClicks: total } }
    );

    variables["totalClicks"] = total;
  } else {
    //user doesn't exist somehow
    console.log("You're not supposed to be here");
  }

  res.render("savedSession", variables);
});

async function main() {
  //1. Setup the express server
  app.set("view engine", "ejs"); //Set app view engine as ejs
  app.set("views", path.resolve(__dirname, "templates")); //Set app setting for views to templates folder
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static("css"));
  const args = process.argv;

  //2. Command Line Parsing
  let portNum = 0;
  if (args.length != 3) {
    console.log("usage: node clickerServer.js [portNumber]");
    process.exit(0);
  } else {
    portNum = args[2];
  }
  app.listen(portNum); //Set app to listen for requests
  console.log(`Webserver started and running at http://localhost:${portNum}`);

  //3. Connect to the mongoDB database
  const uri = `mongodb+srv://${user}:${pass}@cluster0.pd476b3.mongodb.net/?retryWrites=true&w=majority`;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (e) {
    console.error(e);
  }

  //4. Listen for user-shut down command
  console.log("Stop to shutdown the server: ");
  process.stdin.on("data", (dataInput) => {
    if (dataInput !== null) {
      dataInput = dataInput.toString().trim();
      if (dataInput === "stop") {
        console.log("Shutting down the server");
        client.close();
        process.exit(0);
      } else if (dataInput === "quote") {
        let quote = networkMangager.getRandomQuote();
        console.log(quote);
      } else {
        console.log(`Invalid command: ${dataInput}`);
      }
      console.log("Stop to shutdown the server: ");
    }
  });
}
