import { getTokenData } from "@/utils/tokenData";
import { NextResponse } from "next/server";

export async function GET() {
  // Recupera i dati decodificati dal token tramite la tua utility
  const data = await getTokenData();

  // Se il token non esiste o è scaduto, restituisci un errore 401
  if (!data) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Restituisci i dati (incluso il nuovo campo 'nominativo' che hai aggiunto alla login)
  return NextResponse.json(data);
}
