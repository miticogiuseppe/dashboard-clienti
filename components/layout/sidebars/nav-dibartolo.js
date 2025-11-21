import {
  Dashboardicon,
  Appsicon,
  Pagesicon,
  PerfumeIcon,
  NestedmenuIcon,
  Erroricon,
} from "@/shared/layouts-components/sidebar/nav"; // stessa importazione delle icone

// MENU COMPLETO DIBARTOLO
export const MENUITEMS_DIBARTOLO = [
  { menutitle: "MAIN" },

  {
    title: "Dashboards",
    icon: Dashboardicon,
    type: "sub",
    active: false,
    children: [
      {
        path: "/dashboard/dibartolo/generale",
        type: "link",
        active: false,
        selected: false,
        title: "Generale",
        ready: true,
      },
      {
        title: "Dashboard 4.0",
        type: "link",
        path: "/pages/empty",
        active: false,
        selected: false,
        ready: false,
      },
    ],
  },

  { menutitle: "WEB APPS" },

  {
    title: "Apps",
    icon: Appsicon,
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        title: "Calendario",
        path: "/dashboard/dibartolo/calendario",
        type: "link",
        active: false,
        selected: false,
        ready: true,
      },
    ],
  },

  {
    icon: Pagesicon,
    title: "Pages",
    type: "sub",
    active: false,
    children: [
      {
        path: "/dashboard/dibartolo/imballatrice",
        type: "link",
        active: false,
        selected: false,
        title: "Imballatrice",
        ready: true,
      },
      {
        path: "/dashboard/dibartolo/copral_nas",
        type: "link",
        active: false,
        selected: false,
        title: "Troncatrice (Mecal)",
        ready: true,
      },
      {
        path: "/pages/empty",
        type: "link",
        active: false,
        selected: false,
        title: "Amministrativa",
        ready: false,
      },
      {
        path: "/pages/profilo",
        type: "link",
        active: false,
        selected: false,
        title: "Profilo",
        ready: false,
      },
      {
        path: "/pages/profile",
        type: "link",
        active: false,
        selected: false,
        title: "Profile",
        ready: false,
      },
      {
        path: "/pages/profile-settings",
        type: "link",
        active: false,
        selected: false,
        title: "Profile Settings",
        ready: false,
      },
    ],
  },
];

// FLAG DEMO
const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";

// FILTRO AUTOMATICO
function filterMenu(items) {
  return items
    .map((item) => {
      const newItem = { ...item };
      if (newItem.children) newItem.children = filterMenu(newItem.children);
      const isReady = newItem.ready !== undefined ? newItem.ready : true;
      if (isDemo && !isReady) return null;
      return newItem;
    })
    .filter(Boolean);
}

// EXPORT MENU FILTRATO
export const FILTERED_MENU_DIBARTOLO = filterMenu(MENUITEMS_DIBARTOLO);
