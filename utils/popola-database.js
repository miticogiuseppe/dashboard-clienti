import fs from "fs";
import csv from "csv-parser";
import { pool } from "@/utils/db";
import argon2 from "argon2";

export async function caricaAgentiDaCSV() {
  const agenti = [];

  // 1. Leggiamo il file CSV generato da Python
  fs.createReadStream("agenti_per_database.csv")
    .pipe(csv())
    .on("data", (row) => agenti.push(row))
    .on("end", async () => {
      console.log("CSV letto con successo. Inizio inserimento nel database...");

      for (const agente of agenti) {
        // Creiamo uno username semplice: "nome.agente" tutto minuscolo
        const username = agente.nome_agente
          .toLowerCase()
          .replace(/\s+/g, ".")
          .trim();

        // Generiamo una password di default
        const passwordHashed = await argon2.hash("copral123");

        try {
          await pool.query(
            `INSERT INTO users (username, password, role, codice_agente, tenant)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (username) DO NOTHING`,
            [
              username,
              passwordHashed,
              "AGENTE",
              agente.codice_agente,
              "Copral",
            ],
          );
          console.log(
            `Inserito agente: ${username} con codice ${agente.codice_agente}`,
          );
        } catch (err) {
          console.error(`Errore durante l'inserimento di ${username}:`, err);
        }
      }
      console.log("Popolamento completato!");
    });
}
