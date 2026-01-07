import { Appsicon, Dashboardicon, Pagesicon } from "./icons";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { LuFactory } from "react-icons/lu";

export const menuCopral = [
  { menutitle: "MENU" },
  {
    title: "Dashboard",
    icon: <RiDashboardHorizontalFill className="side-menu__icon" />,
    type: "sub",
    children: [
      {
        path: "/dashboard/copral/generalenew",
        title: "Generale",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/copral/venduto",
        title: "Venduto",
        type: "link",
        ready: true,
      },
    ],
  },
  {
    title: "Macchine",
    icon: <LuFactory className="side-menu__icon" />,
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
        path: "/dashboard/copral/pulitrice",
        title: "Pulitrice",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/copral/intestatrice",
        title: "Intestatrice 90°",
        type: "link",
        ready: true,
      },
    ],
  },
  {
    title: "App",
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
];
