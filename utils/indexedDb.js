function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MyCache", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbSetItem(key, value) {
  const db = await openDb();

  const tx = db.transaction("cache", "readwrite");
  const store = tx.objectStore("cache");

  store.put(value, key);

  await tx.done;
}

export async function dbGetItem(key) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache", "readonly");
    const store = tx.objectStore("cache");

    const req = store.get(key);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbRemoveItem(key) {
  const db = await openDb();

  const tx = db.transaction("cache", "readwrite");
  const store = tx.objectStore("cache");

  store.delete(key);
}
