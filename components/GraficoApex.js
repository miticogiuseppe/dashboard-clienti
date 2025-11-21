"use client";
import React from "react";
import Spkapexcharts from "@/shared/components/Spkapexcharts"; // o il path corretto

const GraficoApex = ({ titolo, chartOptions, chartSeries }) => {
  return (
    <div className="custom-card">
      <h5>{titolo}</h5>
      <Spkapexcharts
        chartOptions={chartOptions}
        chartSeries={chartSeries}
        type={chartOptions.chart.type}
        width="100%"
        height={315}
      />
    </div>
  );
};

export default GraficoApex;
