import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { pool } from "@/utils/db"; // Usa il tuo helper per il DB
import argon2 from "argon2";

export async function POST(req) {
  try {
    // 1. Percorso del file CSV (nella root del progetto)
    const filePath = path.join(process.cwd(), "agenti_per_database.csv");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File CSV non trovato" },
        { status: 404 },
      );
    }

    const agenti = [];

    // 2. Lettura del CSV tramite Stream
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      agenti.push(row);
    }

    let inseriti = 0;

    // 3. Ciclo di inserimento nel Database
    for (const agente of agenti) {
      const username = agente.nome_agente
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ".");
      const passwordHashed = await argon2.hash("Copral2026!");

      const result = await pool.query(
        `INSERT INTO users (username, password, role, codice_agente, tenant)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO NOTHING`,
        [username, passwordHashed, "AGENTE", agente.codice_agente, "Copral"],
      );

      if (result.rowCount > 0) inseriti++;
    }

    return NextResponse.json({
      message: "Operazione completata",
      totale_letti: agenti.length,
      nuovi_inseriti: inseriti,
    });
  } catch (error) {
    console.error("Errore API Popolamento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
