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

export async function GET(req) {
  try {
    // tenant passato nell’header
    const tenant = req.headers.get("x-tenant");

    if (!tenant) {
      return new Response("Missing tenant", { status: 400 });
    }

    // ottieni id
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    // leggi filedb.json
    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const dbContent = await fs.readFile(dbPath, "utf8");
    const db = JSON.parse(dbContent);

    // ottieni risorse del tenant
    const tenantResources = db[tenant];
    if (!tenantResources) {
      return new Response("Tenant not found", { status: 404 });
    }

    const resource = tenantResources.find((r) => r.id === id);
    if (!resource) {
      return new Response("Resource not found", { status: 404 });
    }

    // 5. leggi file su disco
    const fileBuffer = await fs.readFile(resource.path);

    // 6. restituisci file
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(
          resource.path
        )}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
