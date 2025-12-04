import { redirect } from "next/navigation";
import { getTokenData } from "@/utils/tokenData";

export default async function ProtectedLayout({ children }) {
  const token = await getTokenData();

  if (!token || token.tenant != "Copral") {
    // Reindirizza al login
    redirect("/");
  }

  return <>{children}</>;
}
