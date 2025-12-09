"use client";

import { Dropdown } from "react-bootstrap";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import dayjs from "dayjs";

const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const start = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

export default function PeriodSelectorSimple({ onChange }) {
  const handleClick = (type) => {
    const range = calcolaRange(type);
    if (onChange) onChange({ ...range, type });
  };

  return (
    <SpkDropdown
      toggleas="a"
      Customtoggleclass="btn btn-sm btn-light text-muted"
      Toggletext="Periodo"
    >
      <Dropdown.Item onClick={() => handleClick("settimana")}>
        Questa settimana
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleClick("mese")}>
        Ultimo mese
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleClick("anno")}>
        Anno corrente
      </Dropdown.Item>
    </SpkDropdown>
  );
}
