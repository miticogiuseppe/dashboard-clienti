import { filterMenu, getMenu } from "@/menus";
import { getTokenData } from "@/utils/tokenData";
import ClientLayout from "./layout-client";

const ServerLayout = async ({ children }) => {
  const token = await getTokenData();
  let menu = getMenu(token.tenant);
  menu = filterMenu(menu);

  let globalData = { menu, tenant: token.tenant };

  return <ClientLayout globalData={globalData}>{children}</ClientLayout>;
};

export default ServerLayout;
