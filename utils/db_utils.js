import { buildTableName } from "./misc.js";
import { doQuery, doTransaction } from "./db.js";

export async function dbReadLwt(pool, tenant, resource) {
  const result = await doQuery(
    pool,
    `SELECT * FROM resource_lwt WHERE tenant=$1 AND resource=$2`,
    [tenant, resource],
  );
  return result.rows[0]?.lwt;
}

export async function dbReadData(pool, tenant, resource, filter, params) {
  let tableName = buildTableName(tenant, resource);

  return await doTransaction(pool, async (client) => {
    const query1 = await client.query(
      `SELECT * FROM "${tableName}" ${filter ?? ""}`,
      params ?? [],
    );
    const query2 = await client.query(
      `SELECT * FROM resource_lwt WHERE tenant=$1 AND resource=$2`,
      [tenant, resource],
    );

    return {
      rows: query1.rows,
      lwt: query2.rows[0]?.lwt,
    };
  });
}
