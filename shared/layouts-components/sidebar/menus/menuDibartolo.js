// shared/layouts-components/sidebar/menus/menuDibartolo.js
import { read } from "xlsx";
import { Dashboardicon, Appsicon, Pagesicon } from "../icons";

export const menuDibartolo = [
  { menutitle: "MAIN" },
  {
    title: "Dashboards",
    icon: Dashboardicon,
    type: "sub",
    children: [
      {
        path: "/dashboard/dibartolo/generale",
        title: "Generale",
        type: "link",
        ready: true,
      },
    ],
  },
  //   { menutitle: "WEB APPS" },
  {
    title: "Apps",
    icon: Appsicon,
    type: "sub",
    ready: false,
    children: [
      {
        title: "Calendario",
        path: "/dashboard/dibartolo/calendario",
        type: "link",
        ready: false,
      },
    ],
  },
];
