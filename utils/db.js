import pkg from "pg";
const { Pool } = pkg;

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
