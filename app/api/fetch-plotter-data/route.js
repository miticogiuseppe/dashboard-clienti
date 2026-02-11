import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { getTokenData } from "@/utils/tokenData";
import { getFileInfo } from "@/utils/fileTools";
import { check } from "@/utils/api";

export async function GET(req) {
  return await check(req, async () => {
    const token = await getTokenData();
    const tenant = token.tenant;

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    const resource = db[tenant]?.find((r) => r.id === "USAGE-HP");

    if (!resource)
      return new Response(JSON.stringify({ error: "Resource not found" }), {
        status: 404,
      });

    const filePath = path.join(process.env.DRIVE_PATH, resource.path);
    if (!fs.existsSync(filePath))
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
      });

    // 1. Leggiamo il file come testo
    let fileContent = fs.readFileSync(filePath, "utf-8");

    // 2. Pulizia: Cerchiamo la riga dove iniziano i dati veri
    const lines = fileContent.split(/\r?\n/);
    const headerIndex = lines.findIndex((line) =>
      line.startsWith("Nome;Ordina;Ora"),
    );

    if (headerIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Intestazione non trovata" }),
        { status: 500 },
      );
    }

    // Prendiamo solo dalla riga dell'intestazione in poi
    const cleanCsv = lines.slice(headerIndex).join("\n");

    // 3. Parsing con XLSX: ora riconoscerà le colonne correttamente!
    const workbook = XLSX.read(cleanCsv, { type: "string", FS: ";" });
    const jsonSheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { defval: "" },
    );

    const fileInfo = await getFileInfo(filePath);

    return new Response(
      JSON.stringify({
        data: jsonSheet,
        lwt: fileInfo.mtime,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  });
}
