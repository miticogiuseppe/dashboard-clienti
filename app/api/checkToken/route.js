import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ username: payload.username }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }
}
