// Filtra menu demo
export function filterMenu(items) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
  return items
    .map((item) => {
      const newItem = { ...item };
      if (newItem.children) newItem.children = filterMenu(newItem.children);
      const ok = newItem.ready !== false;
      if (isDemo && !ok) return null;
      return newItem;
    })
    .filter(Boolean);
}
