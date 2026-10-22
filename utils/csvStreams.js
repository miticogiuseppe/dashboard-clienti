import { createGzip } from "zlib";

class CsvBuffer {
  constructor() {
    this.parts = [];
    this.length = 0;
  }

  push(s) {
    this.parts.push(s);
    this.length += s.length;
  }

  flush() {
    const out = this.parts.join("");
    this.parts = [];
    this.length = 0;
    return out;
  }
}

// codifica

/*
function escapeCsv(value) {
  if (value == null) return "";

  const str = String(value);

  let needsQuotes = false;

  // scan manuale (più veloce di regex)
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 34 || c === 10 || c === 44) {
      // " \n ,
      needsQuotes = true;
      break;
    }
  }

  if (!needsQuotes) return str;

  let out = '"';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"') out += '""';
    else out += c;
  }

  out += '"';

  return out;
}
*/
function escapeCsv(value) {
  if (value == null) return "";

  // numeri: output diretto, senza quote
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  const str = String(value);

  // stringhe: sempre tra virgolette
  let out = '"';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"')
      out += '""'; // escape CSV
    else out += c;
  }

  out += '"';

  return out;
}
export function createCsvStream(sheet, jsonData) {
  const isArray = Array.isArray(sheet[0]);
  const keys = Object.keys(sheet[0] || []);

  return new ReadableStream({
    async start(controller) {
      let buffer = new CsvBuffer();
      const MIN = 1024 * 1024;

      {
        if (jsonData) buffer.push(JSON.stringify(jsonData) + "\n");
      }
      if (!isArray) {
        const parts = new Array(keys.length);
        for (let k = 0; k < keys.length; k++) parts[k] = escapeCsv(keys[k]);
        buffer.push(parts.join(",") + "\n");
      }
      for (const row of sheet) {
        const parts = new Array(keys.length);
        for (let k = 0; k < keys.length; k++)
          parts[k] = escapeCsv(row[keys[k]]);
        buffer.push(parts.join(",") + "\n");
        if (buffer.length >= MIN) controller.enqueue(buffer.flush());
      }

      if (buffer.length) controller.enqueue(buffer.flush());

      controller.close();
    },
  });
}

// decodifica

function convert(value, quoted) {
  if (quoted) return value; // stringa SEMPRE

  // numero se possibile
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}
function parseHead(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let isQuoted = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        isQuoted = true; // 👈 segna che questa cella era quoted
      }
    } else if (c === "," && !inQuotes) {
      result.push(convert(current, isQuoted));
      current = "";
      isQuoted = false;
    } else {
      current += c;
    }
  }

  result.push(convert(current, isQuoted));

  return result;
}
function parseLine(line, headers) {
  const result = {};
  let current = "";
  let inQuotes = false;
  let isQuoted = false;
  let idx = 0;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        isQuoted = true; // 👈 segna che questa cella era quoted
      }
    } else if (c === "," && !inQuotes) {
      result[headers[idx++]] = convert(current, isQuoted);
      current = "";
      isQuoted = false;
    } else {
      current += c;
    }
  }

  result[headers[idx++]] = convert(current, isQuoted);

  return result;
}
function splitLines(buffer) {
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < buffer.length; i++) {
    const c = buffer[i];

    if (c === '"') {
      // gestisce escape ""
      if (inQuotes && buffer[i + 1] === '"') {
        current += '"';
        i++;
        continue;
      }

      inQuotes = !inQuotes;
      current += c;
      continue;
    }

    if (c === "\n" && !inQuotes) {
      lines.push(current.replace(/\r$/, ""));
      current = "";
    } else {
      current += c;
    }
  }

  return { lines, rest: current };
}

export async function csvDecode(webStream) {
  const reader = webStream.getReader();
  const decoder = new TextDecoder();

  let outp = {};
  const result = [];
  let buffer = "";
  let headLine = true;
  let firstLine = true;
  let headers;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const { lines, rest } = splitLines(buffer);
    buffer = rest;

    if (firstLine) {
      let line = lines.shift();
      outp = JSON.parse(line);
      firstLine = false;
    }
    if (headLine) {
      let line = lines.shift();
      headers = parseHead(line);
      headLine = false;
    }

    for (const line of lines) {
      result.push(parseLine(line, headers));
    }
  }

  buffer += decoder.decode();
  if (buffer) result.push(parseLine(buffer));

  return { ...outp, data: result };
}

// compressione

export function createGzipStream(sourceStream, level = 2) {
  const gzip = createGzip({ level, chunkSize: 1024 * 1024 });

  return new ReadableStream({
    start(controller) {
      gzip.on("data", (chunk) => controller.enqueue(chunk));
      gzip.on("end", () => controller.close());
      gzip.on("error", (err) => controller.error(err));

      const reader = sourceStream.getReader();

      async function pump() {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            gzip.end();
            break;
          }
          const ok = gzip.write(value);
          if (!ok) {
            // buffer pieno, aspetta che si svuoti
            await new Promise((r) => gzip.once("drain", r));
          }
        }
      }

      pump().catch((err) => controller.error(err));
    },
  });
}
