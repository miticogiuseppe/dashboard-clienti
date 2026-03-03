import { filterMenu, getMenu } from "@/menus";
import { getTokenData } from "@/utils/tokenData";
import ClientLayout from "./layout-client";
import { redirect } from "next/navigation";

const ServerLayout = async ({ children }) => {
  const token = await getTokenData();

  if (!token) {
    redirect("/"); // torna alla login
  }

  let menu = getMenu(token.tenant);
  menu = filterMenu(menu, token.role);

  let globalData = { menu, tenant: token.tenant, role: token.role };

  return <ClientLayout globalData={globalData}>{children}</ClientLayout>;
};

export default ServerLayout;
