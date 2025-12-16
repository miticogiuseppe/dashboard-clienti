import dayjs from "dayjs";

// Utility per calcolare range date da periodo
const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const inizio = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];

  return {
    startDate: inizio.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

// Utility per formattare sempre le date
const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
};

export { calcolaRange, fmt };
