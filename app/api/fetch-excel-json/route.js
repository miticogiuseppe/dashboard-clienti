import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { getTokenData } from "@/utils/tokenData";
import { getFileInfo } from "@/utils/fileTools";
import { check } from "@/utils/api";

export async function GET(req) {
  return await check(req, async () => {
    // Ottenere il tenant
    const token = await getTokenData();
    const tenant = token.tenant;

    if (!tenant)
      return new Response(JSON.stringify({ error: "Missing tenant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sheetNameParam = searchParams.get("sheet"); // il nome del foglio

    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const dbPath = path.join(process.cwd(), "data", "filedb.json");
    const dbContent = fs.readFileSync(dbPath, "utf8");
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

    const filePath = path.join(process.env.DRIVE_PATH, resource.path);
    const jsonFile = path.join(
      process.env.DRIVE_PATH,
      path.parse(resource.path).dir,
      path.parse(resource.path).name + ".json"
    );
    const fileInfo = await getFileInfo(filePath);
    let jsonSheet = undefined;

    if (fs.existsSync(jsonFile)) {
      let data = fs.readFileSync(jsonFile, "utf-8");
      jsonSheet = JSON.parse(data);
    } else {
      console.log(`JSON not found: ${jsonFile}. Reading XLS.`);

      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });

      // se il foglio passato esiste, lo usiamo; altrimenti primo foglio
      const sheetName =
        sheetNameParam && workbook.SheetNames.includes(sheetNameParam)
          ? sheetNameParam
          : workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];
      jsonSheet = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    }

    const jsonData = {
      data: jsonSheet,
      lwt: fileInfo.mtime,
    };

    return new Response(JSON.stringify(jsonData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}
