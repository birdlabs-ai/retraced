

const pg = require('pg');

const config = require('../config/getConfig')();

let pgPool;

function getPgPool() {
  if (!pgPool) {
    pgPool = new pg.Pool({
      user: config.Postgres.User,
      database: config.Postgres.Database,
      password: config.Postgres.Password,
      host: config.Postgres.Endpoint,
      port: config.Postgres.Port,
      max: 100, // max number of clients in the pool
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    });
  }

  return pgPool;
}

module.exports = getPgPool;
