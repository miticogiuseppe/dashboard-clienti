import { Appsicon, Dashboardicon, Pagesicon } from "./icons";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { LuFactory } from "react-icons/lu";

export const menuDibartolo = [
  { menutitle: "MAIN" },
  {
    title: "Dashboards",
    icon: <RiDashboardHorizontalFill className="side-menu__icon" />,
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

  {
    title: "Macchine",
    icon: <LuFactory className="side-menu__icon" />,
    type: "sub",
    children: [
      {
        path: "/dashboard/dibartolo/tostini",
        title: "Tostini",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/dibartolo/confezionatrice",
        title: "Confezionatrice",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/dibartolo/variegati",
        title: "Variegati",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/dibartolo/mulini",
        title: "Mulini",
        type: "link",
        ready: true,
      },
      {
        path: "/dashboard/dibartolo/ribus",
        title: "Ribus",
        type: "link",
        ready: true,
      },
    ],
  },

  {
    title: "Apps",
    icon: Appsicon,
    type: "sub",
    ready: true,
    children: [
      {
        title: "Calendario",
        path: "/dashboard/dibartolo/calendario",
        type: "link",
        ready: true,
      },
    ],
  },
];
