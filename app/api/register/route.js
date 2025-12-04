import argon2 from "argon2";
import { pool } from "@/utils/db";

export async function POST(req) {
  const body = await req.json();

  if (!body.username) return new Response(null, { status: 422 });
  if (!body.password) return new Response(null, { status: 422 });

  const hashedPassword = await argon2.hash(body.password, {
    type: argon2.argon2id,
  });

  await pool.query("INSERT INTO users VALUES($1,$2,$3,$4)", [
    body.username,
    hashedPassword,
    undefined,
    undefined,
  ]);

  return new Response("ok", {
    status: 200,
  });
}
