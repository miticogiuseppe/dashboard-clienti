import dayjs from "dayjs";

// Utility per calcolare range date da periodo
const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const inizio = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];

  return [inizio.toDate(), oggi.toDate()];
};

// Utility per formattare sempre le date
const fmt = (value, period, idx) => {
  if (!value) value = calcolaRange(period);
  return value[idx];
};
const computeDate = (value, period) => {
  if (!value) value = calcolaRange(period);
  return value;
};

export { calcolaRange, fmt, computeDate };
