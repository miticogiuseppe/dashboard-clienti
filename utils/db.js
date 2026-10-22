import pkg from "pg";
const { Pool, types } = pkg;

types.setTypeParser(1700, (val) => parseFloat(val));

let pool;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pool;
}

export async function poolConnect(pool) {
  let client = await pool.connect();
  if (client.listenerCount("error") === 0)
    client.on("error", (err) => {
      console.log("PG client error:");
      console.log(err.stack || err);
    });
  return client;
}

export async function doTransaction(pool, func) {
  let client = await poolConnect(pool);
  let tryCount = 0;

  try {
    do {
      try {
        tryCount++;
        if (tryCount > 1) console.log(`Retrying transaction. ${tryCount}`);
        await client.query("BEGIN");
        let ret = await func(client);
        await client.query("COMMIT");
        return ret;
      } catch (e) {
        await client.query("ROLLBACK");
        if (e.code != "40001") {
          console.error(e.stack || e);
          throw e;
        }
      }
    } while (tryCount < 7);
  } finally {
    client.release();
  }

  console.error("Failed after max retries.");
  throw new Error("Failed after max retries.");
}

export async function doQuery(pool, query, args) {
  let client = await poolConnect(pool);
  let tryCount = 0;
  try {
    do {
      try {
        tryCount++;
        if (tryCount > 1) console.log(`Retrying query. ${tryCount}`);
        let res = await client.query(query, args);
        return res;
      } catch (e) {
        if (e.code != "40001") throw e;
      }
    } while (tryCount < 7);
  } finally {
    client.release();
  }
  throw new Error("Failed after max retries.");
}

export async function readTableInfo(pool, tableName) {
  let query2 = await doQuery(
    pool,
    `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `,
    [],
  );

  if (query2.rows.length === 0) return undefined;
  return query2.rows.reduce((acc, x) => {
    acc[x.column_name] = x.data_type;
    return acc;
  }, {});
}
