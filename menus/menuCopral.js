import { LuFactory } from "react-icons/lu";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { Appsicon } from "./icons";

export const menuCopral = [
  { menutitle: "MENU" },
  {
    title: "Dashboard",
    icon: <RiDashboardHorizontalFill className="side-menu__icon" />,
    type: "sub",
    permission: "dash_generale",
    active: false,
    selected: false,
    children: [
      {
        path: "/dashboard/copral/generalenew",
        title: "Generale",
        type: "link",
        permission: "dash_piena",
        ready: true,
      },
      {
        title: "Statistiche",
        type: "sub",
        permission: "dash_generale",
        active: false,
        selected: false,
        children: [
          {
            path: "/dashboard/copral/venduto",
            title: "Venduto",
            type: "link",
            permission: "venduto_globale",
            ready: true,
          },

          {
            path: "/dashboard/copral/statistiche-venduto",
            title: "Statistiche Venduto",
            type: "link",
            permission: "statistiche_venduto",
            ready: true,
          },
          {
            path: "/dashboard/copral/analisi-famiglia",
            title: "Analisi per Famiglia",
            type: "link",
            permission: "statistiche_venduto", // Usiamo lo stesso permesso per ora
            ready: true,
          },
          {
            //path: "/dashboard/copral/acquistato",
            path: "",
            title: "Acquistato",
            type: "empty",
            permission: "dash_generale",
            //type: "link",
            //permission: "dash_generale",
            ready: true,
          },
        ],
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
        permission: "macchine_imballatrice",
        ready: true,
      },
      {
        path: "/dashboard/copral/troncatrice",
        title: "Troncatrice (Mecal)",
        type: "link",
        permission: "macchine_troncatrice",
        ready: true,
      },

      {
        path: "/dashboard/copral/pulitrice",
        title: "Pulitrice",
        type: "link",
        permission: "macchine_pulitrice",
        ready: true,
      },
      {
        path: "/dashboard/copral/intestatrice",
        title: "Intestatrice 90°",
        type: "link",
        permission: "macchine_intestatrice",
        ready: true,
      },

      {
        path: "/dashboard/copral/plotter",
        title: "Plotter HP T2600",
        type: "link",
        permission: "macchine_plotter",
        ready: true,
      },
    ],
  },
  {
    title: "App",
    icon: Appsicon,
    type: "sub",
    permission: "app_calendario",
    children: [
      {
        title: "Calendario",
        path: "/dashboard/copral/calendario",
        type: "link",
        permission: "app_calendario",
        ready: true,
      },
    ],
  },
];
