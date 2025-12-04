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

export { jsonResponse };
