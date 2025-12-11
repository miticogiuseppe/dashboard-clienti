// crea un oggetto Response contenente dati JSON
// funzione di utilità perfetta da usare nelle API
function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function check(req, cb) {
  try {
    return await cb();
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { jsonResponse, check };
