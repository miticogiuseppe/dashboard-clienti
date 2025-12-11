import jwt from "jsonwebtoken";
import { pool } from "@/utils/db";
import { jsonResponse } from "@/utils/api";
import argon2 from "argon2";

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "720d",
  });
}

export async function POST(req) {
  const body = await req.json();

  if (!body.username) return new Response(null, { status: 422 });
  if (!body.password) return new Response(null, { status: 422 });

  // preleva utente
  let result = await pool.query("SELECT * FROM users WHERE username=$1", [
    body.username,
  ]);
  if (result.rows.length < 1)
    return new Response(undefined, {
      status: 404,
    });

  // check della password
  const valid = await argon2.verify(result.rows[0].password, body.password);
  if (!valid)
    return new Response(undefined, {
      status: 404,
    });

  const token = generateAccessToken({
    username: body.username,
    tenant: result.rows[0].tenant,
  });

  return new Response("ok", {
    status: 200,
    headers: {
      "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
    },
  });
}
