import mysql from "promise-mysql";
import config from "./config";

async function getPool() {
  const pool = await mysql.createPool({
    connectionLimit: 10,
    user: config.mysql.user,
    host: config.mysql.devHost,
    password: config.mysql.password,
    database: config.mysql.database,
    port: 3306,
    waitForConnections: true,
    queueLimit: 0,
    debug: false,
    wait_timeout: 28800,
    connect_timeout: 10,
    charset: "utf8mb4",
    typeCast: function castField(field, useDefaultTypeCasting) {
      // We only want to cast bit fields that have a single-bit in them. If the field
      // has more than one bit, then we cannot assume it is supposed to be a Boolean.
      if (field.type === "BIT" && field.length === 1) {
        var bytes = field.buffer();
        return bytes && bytes[0] === 1;
      }

      return useDefaultTypeCasting();
    },
  });

  return pool;
}

export default class db {
  constructor() {
    this.pool = null;
  }
  static async query(sql, values = null) {
    if (!this.pool) this.pool = await getPool();
    try {
      const result = await this.pool.query(sql, values);
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}
