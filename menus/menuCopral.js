import { Appsicon, Dashboardicon, Pagesicon } from "./icons";

export const menuCopral = [
  { menutitle: "MAIN" },
  {
    title: "Dashboards",
    icon: Dashboardicon,
    type: "sub",
    children: [
      {
        path: "/dashboard/copral/generalenew",
        title: "Generale",
        type: "link",
        ready: true,
      },
    ],
  },
  { menutitle: "WEB APPS" },
  {
    title: "Apps",
    icon: Appsicon,
    type: "sub",
    children: [
      {
        title: "Calendario",
        path: "/dashboard/copral/calendario",
        type: "link",
        ready: true,
      },
    ],
  },
  {
    title: "Pages",
    icon: Pagesicon,
    type: "sub",
    children: [
      {
        path: "/dashboard/copral/imballatrice",
        title: "Imballatrice",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/copral/troncatrice",
        title: "Troncatrice (Mecal)",
        type: "link",
        ready: true,
      },

      {
        path: "#",
        title: "Pulitrice",
        type: "link",
        ready: true,
      },
      {
        path: "#",
        title: "Intestatrice 90°",
        type: "link",
        ready: true,
      },
    ],
  },
];
