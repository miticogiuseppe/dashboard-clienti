import { dbGetItem, dbSetItem } from "./indexedDb.js";
import { csvDecode } from "./csvStreams.js";

export async function fetchCsvCached(input, init, user) {
  let key = input + "§" + (user ?? "");
  let cached = await dbGetItem(key);

  if (cached) input += "&lwt=" + encodeURIComponent(cached.lwt);

  const response = await fetch(input, init);
  if (response.status === 204) return cached;

  let json = await csvDecode(response.body);
  await dbSetItem(key, json);
  return json;
}
