import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getTokenData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return undefined;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    return undefined;
  }
}

export { getTokenData };
