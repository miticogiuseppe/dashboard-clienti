import { NextResponse } from "next/server";
import { hash } from "argon2";
import { pool } from "@/utils/db";

export async function POST(request) {
  try {
    // Estrazione campi dal corpo della richiesta
    const {
      username,
      password,
      email,
      tenant,
      role,
      codice_agente,
      codice_cliente,
    } = await request.json();

    // Validazione di sicurezza
    if (!username || !password || !tenant) {
      return NextResponse.json(
        { error: "Dati obbligatori mancanti (username, password o tenant)" },
        { status: 400 },
      );
    }

    // Hashing della password
    const hashedPassword = await hash(password);

    // Query di inserimento completa
    const query = `
            INSERT INTO public.users (
                username, 
                password, 
                email, 
                tenant, 
                role, 
                codice_agente, 
                codice_cliente
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, email, tenant, role;
        `;

    // Mappatura dei valori
    const values = [
      username,
      hashedPassword,
      email || null,
      tenant,
      role || null,
      codice_agente || null,
      codice_cliente || null,
    ];

    const result = await pool.query(query, values);

    // 4. Risposta di successo
    return NextResponse.json(
      {
        success: true,
        message: "Utente registrato con tutti i parametri",
        user: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Errore durante l'inserimento:", error);

    // Gestione specifica per violazione di vincoli unici
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Errore: Lo username o l'email sono già registrati." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Errore interno durante il salvataggio dei dati." },
      { status: 500 },
    );
  }
}
