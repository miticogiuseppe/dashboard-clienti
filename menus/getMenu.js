import { menuCopral } from "./menuCopral";
import { menuDibartolo } from "./menuDibartolo";
import { menuRica } from "./menuRica";

export function getMenu(tenant) {
  switch (tenant) {
    case "Copral":
      return menuCopral;
    case "Dibartolo":
      return menuDibartolo;
    case "Rica":
      return menuRica;
    default:
      return [];
  }
}
