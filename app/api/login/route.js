// /api/download-resource/route.js

import jwt from "jsonwebtoken";
import pool from "@/utils/db";
import { jsonResponse } from "@/utils/api";

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "720d",
  });
}

export async function POST(req) {
  const body = await req.json();

  if (!body.username) return new Response(null, { status: 422 });
  if (!body.password) return new Response(null, { status: 422 });

  const token = generateAccessToken({
    username: body.username,
    tenant: body.username,
  });

  return new Response("ok", {
    status: 200,
    headers: {
      "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`,
    },
  });
}
