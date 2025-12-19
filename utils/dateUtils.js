import dayjs from "dayjs";

const calcolaRange = (periodo) => {
  const oggi = dayjs();

  const opzioni = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  };

  const inizio = opzioni[periodo] || opzioni["mese"];

  return [inizio.toDate(), oggi.toDate()];
};

const fmt = (value, period, idx) => {
  if (Array.isArray(value) && value[idx]) {
    return value[idx];
  }

  const range = calcolaRange(period);
  return range[idx];
};

const computeDate = (value, period) => {
  if (!value || (Array.isArray(value) && !value[0])) {
    return calcolaRange(period);
  }
  return value;
};

export { calcolaRange, fmt, computeDate };
