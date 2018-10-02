import mysql from "promise-mysql";
import config from "./config";
let db;

function connectToMysql() {
  if (!db) {
    db = mysql.createPool({
      connectionLimit: 10,
      host: config.database.devHost,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      port: 3306,
      waitForConnections: true,
      queueLimit: 0,
      debug: true,
      wait_timeout: 28800,
      connect_timeout: 10
    });

    db.getConnection(function(err, connection) {
      if (err) {
        console.error("error connecting: " + err.stack);
        return;
      }

      console.log("connected as id " + connection.threadId);
    });
  }
  return db;
}

export default connectToMysql();
