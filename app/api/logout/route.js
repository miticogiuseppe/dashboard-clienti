import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("token", { path: "/" });
  return new Response("ok", {
    status: 200,
  });
}
