import config from "./config";
const mongoose = require("mongoose");
mongoose.connect(
  config.mongo.devHost,
  {
    poolSize: 50,
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
  }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  console.log("We are connected!");
});

export default db;
