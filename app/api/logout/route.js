import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("token", { path: "/" });

  return new Response("ok", {
    status: 200,
  });
}
