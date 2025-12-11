import fs from "fs";
import crypto from "crypto";

async function getFileInfo(filePath, algorithm = "md5") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => {
      fs.stat(filePath, (err, stats) => {
        if (err) return reject(err);
        resolve({
          hash: hash.digest("hex"),
          size: stats.size,
          mtime: stats.mtime,
        });
      });
    });
  });
}

export { getFileInfo };
