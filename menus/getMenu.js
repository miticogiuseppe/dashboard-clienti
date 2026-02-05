import { menuCopral } from "./menuCopral";
import { menuDibartolo } from "./menuDibartolo";
import { menuRica } from "./menuRica";

import { filterMenu } from "./index";

export function getMenu(tenant) {
  let menuBase = [];

  switch (tenant) {
    case "Copral":
      menuBase = menuCopral;
      break;
    case "Dibartolo":
      menuBase = menuDibartolo;
      break;
    case "Rica":
      menuBase = menuRica;
      break;
    default:
      menuBase = [];
  }
  return menuBase;
}
