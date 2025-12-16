import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import { calcolaRange } from "@/utils/dateUtils";
import { useMemo } from "react";

export default function CustomDateComponent({ onfunChange, value, period }) {
  // Stato per TS Azienda
  const computedDate = useMemo(() => {
    if (value) return value;
    return calcolaRange(period);
  }, [value, period]);

  return (
    <SpkFlatpickr
      options={{ mode: "range", dateFormat: "d/m/Y" }}
      onfunChange={onfunChange}
      value={computedDate}
    />
  );
}
