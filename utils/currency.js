export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "€ 0,00";

  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(",", ".")) : value;

  if (isNaN(numericValue)) return "N/A";

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(numericValue);
};
