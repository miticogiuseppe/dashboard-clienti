import { getTokenData } from "@/utils/tokenData";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // getTokenData leggerà il cookie 'token' e lo decodificherà
    const user = await getTokenData();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Restituiamo i dati dell'utente (username, role, codice_agente, ecc.)
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Errore recupero sessione:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
