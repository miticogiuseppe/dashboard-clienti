import { check } from "@/utils/api";
import { createCsvStream, createGzipStream } from "@/utils/csvStreams";
import { readTableInfo } from "@/utils/db";
import { getPool } from "@/utils/db.js";
import { dbReadData, dbReadLwt } from "@/utils/db_utils";
import { getFileInfo, getFileStats } from "@/utils/fileTools";
import { buildTableName } from "@/utils/misc";
import { getTokenData } from "@/utils/tokenData";
import fs, { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";
import * as XLSX from "xlsx";

const pool = getPool();

const agenteCols = ["Agente", "Des. Agente", "Descrizione Agente"];
const clienteCols = [
  "Cliente/Fornitore",
  "Ragione sociale",
  "Descrizione Cliente/Fornitore",
];
const mappingPath = path.join(process.cwd(), "data", "mappatura_agenti.json");
const agentMapping = fs.existsSync(mappingPath)
  ? JSON.parse(fs.readFileSync(mappingPath, "utf8"))
  : {};

// Legge dal file (logica attuale invariata)
async function readFromRes(resource) {
  let jsonSheet, fileDate;

  const filePath = path.join(process.env.DRIVE_PATH, resource.path);
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName =
    resource.sheet && workbook.SheetNames.includes(resource.sheet)
      ? resource.sheet
      : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  jsonSheet = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const fileInfo = await getFileInfo(filePath);
  fileDate = fileInfo.mtime;

  return { jsonSheet, fileDate };
}
async function getResDate(resource) {
  const filePath = path.join(process.env.DRIVE_PATH, resource.path);

  const fileInfo = getFileStats(filePath);
  return fileInfo.mtime;
}

// Applica i filtri agente/cliente
function applyFilters(jsonSheet, role, codice_agente, codice_cliente) {
  if (!jsonSheet || !Array.isArray(jsonSheet) || jsonSheet.length === 0)
    return jsonSheet;

  const columns = Object.keys(jsonSheet[0]);

  const agenteColumn = columns.find((col) => agenteCols.includes(col));
  const clienteColumn = columns.find((col) => clienteCols.includes(col));

  if (role === "AGENTE" && codice_agente && agenteColumn) {
    const normalize = (val) => String(val).replace(/\s+/g, "").toLowerCase();
    const nomeAgente = agentMapping[String(codice_agente)] || null;
    return jsonSheet.filter((row) => {
      const valore = row[agenteColumn];
      if (normalize(valore) === normalize(codice_agente)) return true;
      if (nomeAgente && normalize(valore) === normalize(nomeAgente))
        return true;
      return false;
    });
  }

  if (role === "CLIENTE" && codice_cliente && clienteColumn) {
    return jsonSheet.filter(
      (row) =>
        String(row[clienteColumn]).trim().toLowerCase() ===
        String(codice_cliente).trim().toLowerCase(),
    );
  }

  return jsonSheet;
}

export async function GET(req) {
  return await check(req, async () => {
    const token = await getTokenData();
    const { tenant, role, codice_agente, codice_cliente } = token;

    if (!tenant)
      return new Response(JSON.stringify({ error: "Missing tenant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const lwt = searchParams.get("lwt");

    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    const tenantResources = db[tenant];
    if (!tenantResources)
      return new Response(JSON.stringify({ error: "Tenant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    const resource = tenantResources.find((r) => r.id === id);
    if (!resource)
      return new Response(JSON.stringify({ error: "Resource not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    console.log("--- DEBUG FILTRO ---");
    console.log("Ruolo:", role);
    console.log("Agente:", codice_agente);
    console.log("Cliente:", codice_cliente);
    console.log("--------------------");

    // get lwt
    const cacheLwt = await dbReadLwt(pool, tenant, resource.id);
    const fileLwt = await getResDate(resource);
    const mergeLwt = cacheLwt ?? fileLwt.toISOString();

    // compare lwt
    if (lwt === mergeLwt)
      return new Response(null, {
        status: 204,
      });

    // set variables
    let stream;
    let filtering = false;
    if (role === "AGENTE" && codice_agente) filtering = true;
    if (role === "CLIENTE" && codice_cliente) filtering = true;

    // casistica
    if (cacheLwt) {
      const tableName = buildTableName(tenant, id);
      const csvFn = path.join("csv_cache", tableName + ".csv");

      if (fs.existsSync(csvFn) && !filtering) {
        // 1) preleva dalla cache CSV
        console.log(`Fonte: cache CSV (${csvFn})`);

        const nodeStream = createReadStream(csvFn, {
          highWaterMark: 4 * 1024 * 1024,
        });
        stream = Readable.toWeb(nodeStream);
      } else {
        // 2) preleva dal DB
        console.log(`Fonte: cache DB (${tableName})`);

        // legge info tabella
        const tableColumns = await readTableInfo(pool, tableName);

        // crea clausola WHERE per il filtraggio
        let filters = [],
          params = [];
        let prog = 0;
        if (role === "AGENTE" && codice_agente) {
          for (let col of agenteCols)
            if (tableColumns[col]) {
              let nomeAgente = agentMapping[codice_agente];
              if (nomeAgente && tableColumns[col] === "character varying") {
                filters.push(
                  `("${col}" = $${++prog} OR "${col}" = $${++prog})`,
                );
                params.push(codice_agente);
                params.push(agentMapping[codice_agente]);
              } else {
                filters.push(`"${col}" = $${++prog}`);
                params.push(codice_agente);
              }
              break;
            }
        }
        if (role === "CLIENTE" && codice_cliente) {
          for (let col of clienteCols)
            if (tableColumns[col]) {
              filters.push(`"${col}" = $${++prog}`);
              params.push(codice_cliente);
              break;
            }
        }
        let filter =
          filters.length > 0 ? "WHERE " + filters.join(" AND ") : undefined;

        // ottiene dal db dati e lwt
        const res = await dbReadData(pool, tenant, resource.id, filter, params);

        // manda stream in output
        let jsonSheet = res.rows;
        let source = "db";
        let fileDate = res.lwt;

        let uncompressedStream = createCsvStream(jsonSheet, {
          lwt: fileDate,
          source,
        });
        stream = createGzipStream(uncompressedStream);
      }
    } else {
      // 3) fallback su file
      console.log(`Fonte: file originale (${resource.id})`);

      // legge il file
      const fileResult = await readFromRes(resource);
      let jsonSheet = fileResult.jsonSheet;
      let fileDate = fileResult.fileDate;
      let source = "file";

      // applica filtri
      jsonSheet = applyFilters(jsonSheet, role, codice_agente, codice_cliente);

      // manda stream
      let uncompressedStream = createCsvStream(jsonSheet, {
        lwt: fileDate,
        source,
      });
      stream = createGzipStream(uncompressedStream);
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="export.csv"',
        "Content-Encoding": "gzip",
      },
    });
  });
}
