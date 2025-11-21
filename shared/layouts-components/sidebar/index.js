import { menuCopral, menuDibartolo } from "./menus";

export function getMenuByUser(user) {
  switch (user) {
    case "Copral":
      return menuCopral;
    case "Dibartolo":
      return menuDibartolo;
    default:
      return [];
  }
}
