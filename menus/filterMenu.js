import { canSee } from "@/utils/auth";

// Funzione che gestisce sia il flag 'ready' (per la demo) che i 'permission' (per i ruoli)
export function filterMenu(items, role) {
  const isDemo = process.env.IS_DEMO === "true";

  return items
    .map((item) => {
      const newItem = { ...item };

      // Ricorsione per i figli (mantenendo il ruolo)
      if (newItem.children) {
        newItem.children = filterMenu(newItem.children, role);
      }

      // Logica per DEMO
      const ok = newItem.ready !== false;
      if (isDemo && !ok) return null;

      // Se dopo il filtro dei figli una voce "sub" è rimasta vuota, la eliminiamo
      if (
        newItem.type === "sub" &&
        (!newItem.children || newItem.children.length === 0)
      ) {
        return null;
      }

      // RUOLI
      // Se è un titolo di sezione (es. "MENU") lo teniamo sempre
      if (newItem.menutitle) return newItem;

      // Se ha un permesso, controlliamo se il ruolo può vederlo
      if (newItem.permission) {
        const userCanSee = canSee(role, newItem.permission);
        if (!userCanSee) return null;
      }

      return newItem;
    })
    .filter(Boolean);
}
