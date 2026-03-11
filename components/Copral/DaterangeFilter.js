"use client";
import React from "react";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";

const DateRangeFilter = ({ startDate, endDate, onDateChange }) => {
  return (
    <div
      className="input-group input-group-sm"
      style={{ width: "auto", minWidth: "210px" }}
    >
      <div
        className="input-group-text bg-white border-end-0 py-0 d-flex align-items-center"
        style={{ height: "31px" }}
      >
        <i className="ri-calendar-line text-muted"></i>
      </div>

      <SpkFlatpickr
        inputClass="form-control form-control-sm border"
        value={[startDate, endDate]}
        options={{
          mode: "range",
          dateFormat: "d-m-Y",
          showMonths: 1,
          static: true,
        }}
        onfunChange={onDateChange}
        placeholder="Seleziona periodo..."
      />
    </div>
  );
};

export default DateRangeFilter;
