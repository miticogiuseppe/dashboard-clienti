// /api/download-resource/route.js

import { promises as fs } from "fs";
import path from "path";

export async function GET(req) {
  try {
    // ... (Logica per ottenere tenant e id omessa per brevità, resta invariata) ...
    const tenant = req.headers.get("x-tenant");
    // ... (lettura e parsa di filedb.json) ...
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    // ... (ricerca della risorsa) ...

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const dbContent = await fs.readFile(dbPath, "utf8");
    const db = JSON.parse(dbContent);
    const tenantResources = db[tenant];
    if (!tenantResources)
      return new Response("Tenant not found", { status: 404 });

    const resource = tenantResources.find((r) => r.id === id);
    if (!resource) return new Response("Resource not found", { status: 404 });

    // 💡 CORREZIONE CHIAVE: Unisce il percorso assoluto dalla ENV con il percorso relativo del DB.
    const driveRoot = process.env.NEXT_PUBLIC_DRIVE_PATH;
    const filePath = path.join(driveRoot, resource.path);

    // 5. Leggi il file dal percorso specificato (ora assoluto)
    // Questo è il percorso che ora punta a I:\Il mio Drive\003_Condivisione\Copral\4.0\...
    const fileBuffer = await fs.readFile(filePath);

    // 6. Restituisci il file per il download
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
    console.error("Errore durante il download del file:", error);
    // Spesso l'errore è ENOENT (File Not Found) se il percorso è sbagliato.
    return new Response("Internal server error", { status: 500 });
  }
}
