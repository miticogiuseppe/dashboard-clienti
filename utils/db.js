import pkg from "pg";
const { Pool } = pkg;

// il pool di client Postgre permette alle API
// di ottenere un client Postgre quando è necessario
// effettuare operazioni sul database

const globalForPool = global;

if (!globalForPool.pool) {
  globalForPool.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

const pool = globalForPool.pool;

export { pool };
