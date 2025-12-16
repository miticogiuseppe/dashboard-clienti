import React from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Spkapexcharts = ({ chartOptions, chartSeries, height, width, type }) => {
  return (
    <ReactApexChart
      options={chartOptions}
      series={chartSeries}
      height={height}
      width={width}
      type={type}
    />
  );
};

export default Spkapexcharts;
