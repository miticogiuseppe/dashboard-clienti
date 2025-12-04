import { menuCopral } from "./menuCopral";
import { menuDibartolo } from "./menuDibartolo";

export function getMenu(tenant) {
  switch (tenant) {
    case "Copral":
      return menuCopral;
    case "Dibartolo":
      return menuDibartolo;
    default:
      return [];
  }
}
