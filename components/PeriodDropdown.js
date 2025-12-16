import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Dropdown from "react-bootstrap/Dropdown";

export default function PeriodDropdown({ onChange }) {
  return (
    <SpkDropdown
      toggleas="a"
      Customtoggleclass="btn btn-sm btn-light text-muted"
      Toggletext="Periodo"
    >
      <Dropdown.Item
        onClick={() => {
          onChange("settimana");
        }}
      >
        Questa settimana
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          onChange("mese");
        }}
      >
        Ultimo mese
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          onChange("anno");
        }}
      >
        Anno corrente
      </Dropdown.Item>
    </SpkDropdown>
  );
}
