// export async function GET() {
//   // 1. leggi filedb.json
//   // 2. ottieni tenant dell'utente loggato
//   // 3. ottieni id della risorse (dai parametri della richiesta)
//   // 4. verifica se la risorsa è presente in filedb
//   // 5. leggi la risorsa dal percorso assoluto (I:\\...)
//   // 6. invia tutto il contenuto del file come risposta

//   return Response.json({ message: "Hello from App Router API" });
// }

import { promises as fs } from "fs";
import path from "path";
import * as XLSX from "xlsx";

export async function GET(req) {
  try {
    const tenant = req.headers.get("x-tenant");
    if (!tenant)
      return new Response(JSON.stringify({ error: "Missing tenant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sheetNameParam = searchParams.get("sheet"); // <--- nome del foglio passato da query

    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const dbContent = await fs.readFile(dbPath, "utf8");
    const db = JSON.parse(dbContent);

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

    const filePath = path.join(
      process.env.NEXT_PUBLIC_DRIVE_PATH,
      resource.path
    );
    const fileBuffer = await fs.readFile(filePath);

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // usa il foglio passato oppure il primo foglio di default
    const sheetName = sheetNameParam || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return new Response(
        JSON.stringify({ error: `Foglio "${sheetName}" non trovato` }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    return new Response(JSON.stringify(jsonData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
