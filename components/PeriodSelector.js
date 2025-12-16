"use client";

import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import { calcolaRange } from "@/utils/dateUtils";
import { Dropdown } from "react-bootstrap";

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
