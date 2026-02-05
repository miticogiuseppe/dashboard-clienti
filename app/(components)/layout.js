import { filterMenu, getMenu } from "@/menus";
import { getTokenData } from "@/utils/tokenData";
import ClientLayout from "./layout-client";

const ServerLayout = async ({ children }) => {
  const token = await getTokenData();
  let menu = getMenu(token.tenant);
  menu = filterMenu(menu, token.role);

  let globalData = { menu, tenant: token.tenant, role: token.role };

  return <ClientLayout globalData={globalData}>{children}</ClientLayout>;
};

export default ServerLayout;
