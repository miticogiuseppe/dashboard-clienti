import { Appsicon, Dashboardicon, Pagesicon } from "./icons";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { LuFactory } from "react-icons/lu";

export const menuRica = [
  { menutitle: "MENU" },
  {
    title: "Dashboard",
    icon: <RiDashboardHorizontalFill className="side-menu__icon" />,
    type: "sub",
    children: [
      {
        path: "/dashboard/rica/generale",
        title: "Generale",
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
        path: "/dashboard/rica/calendario",
        type: "link",
        ready: true,
      },
      {
        title: "Download",
        path: "/dashboard/rica/download",
        type: "link",
        ready: true,
      },
    ],
  },
];
