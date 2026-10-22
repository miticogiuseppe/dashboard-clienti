import React from "react";
import Flatpickr from "react-flatpickr";

const SpkFlatpickr = ({
  value,
  onfunChange,
  inputClass,
  placeholder,
  dataEnableTime = false,
  disable = false,
  options,
}) => {
  return (
    <Flatpickr
      className={inputClass}
      value={value}
      onChange={onfunChange}
      disabled={disable}
      options={options}
      placeholder={placeholder}
      data-enable-time={dataEnableTime}
    />
  );
};

export default SpkFlatpickr;
