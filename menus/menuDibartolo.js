import { Appsicon, Dashboardicon, Pagesicon } from "./icons";

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

  {
    title: "Pages",
    icon: Pagesicon,
    type: "sub",
    children: [
      {
        path: "/dashboard/dibartolo/tostini",
        title: "Tostini",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/copral/copral_nas",
        title: "Troncatrice (Mecal)",
        type: "link",
        ready: false,
      },
    ],
  },
];
