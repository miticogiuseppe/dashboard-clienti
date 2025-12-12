import { promises as fs } from "fs";
import path from "path";
import { getTokenData } from "@/utils/tokenData";
import { check } from "@/utils/api";

export async function GET(req) {
  return await check(req, async () => {
    // Ottenere il tenant
    const token = await getTokenData();
    const tenant = token.tenant;

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
  });
}
