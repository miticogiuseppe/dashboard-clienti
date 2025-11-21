// import React from 'react';
// import dynamic from 'next/dynamic';
// const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// const Spkapexcharts = ({ chartOptions, chartSeries, height, width, type }) => {

//   return (
//     <ReactApexChart options={chartOptions} series={chartSeries} height={height} width={width} type={type} />
//   );

// };

// export default Spkapexcharts;

"use client";

import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Spkapexcharts = ({
  chartOptions,
  chartSeries,
  height = 350,
  width = "100%",
  type = "bar",
}) => {
  // Fallback se chartOptions o chartSeries non sono pronti
  const safeOptions = {
    ...chartOptions,
    chart: chartOptions?.chart || { type },
    xaxis: chartOptions?.xaxis || { categories: [] },
    noData: {
      text: "Nessun dato disponibile",
      align: "center",
      verticalAlign: "middle",
      style: { color: "#999", fontSize: "14px" },
    },
  };

  const safeSeries = Array.isArray(chartSeries)
    ? chartSeries.map((s) => ({
        ...s,
        data: Array.isArray(s.data)
          ? s.data.filter((p) => p && p.x !== undefined && p.y !== undefined)
          : [],
      }))
    : [];
  console.log("chartSeries:", chartSeries);
  console.log("safeSeries:", safeSeries);

  return (
    <ReactApexChart
      options={safeOptions}
      series={safeSeries}
      type={type}
      height={height}
      width={width}
    />
  );
};

export default Spkapexcharts;
