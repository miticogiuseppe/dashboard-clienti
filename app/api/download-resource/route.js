import { promises as fs } from "fs";
import path from "path";

export async function GET(req) {
  try {
    // Ottenere il tenant
    const tenant = req.headers.get("x-tenant");
    // Lettura di filedb.json) ...
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const dbContent = await fs.readFile(dbPath, "utf8");
    const db = JSON.parse(dbContent);
    const tenantResources = db[tenant];
    if (!tenantResources)
      return new Response("Tenant not found", { status: 404 });

    const resource = tenantResources.find((r) => r.id === id);
    if (!resource) return new Response("Resource not found", { status: 404 });

    const driveRoot = process.env.DRIVE_PATH;
    const filePath = path.join(driveRoot, resource.path);

    const fileBuffer = await fs.readFile(filePath);

    // Restituisce il file per il download
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
    return new Response("Internal server error", { status: 500 });
  }
}
