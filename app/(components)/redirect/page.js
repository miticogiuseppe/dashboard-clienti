import { redirect } from "next/navigation";
import { getTokenData } from "@/utils/tokenData";

export default async function Page() {
  const token = await getTokenData();

  if (!token) redirect("/");
  else
    switch (token.tenant) {
      case "Copral":
        redirect("/dashboard/copral/generalenew");
      case "Dibartolo":
        redirect("/dashboard/dibartolo/generale");
      case "Rica":
        redirect("/dashboard/rica/generale");
    }

  redirect("/");
}
