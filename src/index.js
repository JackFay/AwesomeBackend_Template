import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import db from "./db";
import api from "./api/index";
import config from "./config.json";
import partners from "./api/index/partners";
import { sanitizePhoneNotRequired } from "./api/index/lib/twilio";
import customers from "./api/index/customers";
// import user from "./api/user";

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan("dev"));

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders,
  })
);

app.use(
  bodyParser.json({
    limit: config.bodyLimit,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  // setup routes
  app.use("/", api({ config, db }));
  app.use("/partners", partners({ config, db }));
  app.use("/customers", sanitizePhoneNotRequired, customers({ config, db }));
  // app.use("/user", user());

  app.server.listen(8085, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
})();

export default app;
