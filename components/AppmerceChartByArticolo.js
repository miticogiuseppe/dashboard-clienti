"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import moment from "moment";

// Utility Excel
import { filterByRange, sumByKey } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

// ApexCharts
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceChartByArticolo({ data, startDate, endDate }) {
  let graphData = useMemo(() => {
    let filteredData = data;

    // Filtra per intervallo date
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        "Data",
        moment(startDate),
        moment(endDate)
      );
    }

    // Somma quantità per Articolo
    let counters = sumByKey(filteredData, "Descrizione", "Numero");
    counters = counters.sort((a, b) => b.count - a.count);

    // Trasforma per ApexCharts
    const seriesData = [
      {
        name: "Quantità",
        data: counters.map((c) => ({
          x: c.Descrizione,
          y: Number(c.count),
        })),
      },
    ];

    // Usa createOptions come AppmerceChart
    const chartOptions = createOptions(counters, "Descrizione", null, "bar");

    // Colore verdino più evidente
    chartOptions.colors = ["#4CAF50"];
    chartOptions.fill = {
      ...chartOptions.fill,
      opacity: 1,
    };

    return {
      graphSeries: seriesData,
      graphOptions: chartOptions,
    };
  }, [data, startDate, endDate]);

  return (
    <div className="custom-card">
      <div className="card-header justify-content-between"></div>
      <div className="card-body">
        <Spkapexcharts
          chartOptions={graphData.graphOptions}
          chartSeries={graphData.graphSeries}
          type={graphData.graphOptions.chart.type}
          width="100%"
          height={350}
        />
      </div>
    </div>
  );
}
