"use client";
import { filterByRange } from "@/utils/excelUtils";
import moment from "moment";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceIngredientsComparison({
  data,
  startDate,
  endDate,
  dateCol,
}) {
  const graphData = useMemo(() => {
    let filteredData = data || [];

    // 1. Filtro per data (stessa logica del tuo componente)
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        dateCol,
        moment(startDate),
        moment(endDate)
      );
    }

    const ingredienti = [
      {
        label: "Ing 1",
        set: "SETPOINT INGREDIENTE 1 (KG)",
        real: "CONSUMO REALE INGREDIENTE 1 (KG)",
      },
      {
        label: "Ing 2",
        set: "SETPOINT INGREDIENTE 2  (KG)",
        real: "CONSUMO REALE INGREDIENTE 2 (KG",
      },
      {
        label: "Ing 3",
        set: "SETPOINT INGREDIENTE 3 (KG)",
        real: "CONSUMO REALE INGREDIENTE 3 (KG",
      },
      {
        label: "Ing 4",
        set: "SETPOINT INGREDIENTE 4 (KG)",
        real: "CONSUMO REALE INGREDIENTE 4 (KG",
      },
      {
        label: "Ing 5",
        set: "SETPOINT INGREDIENTE 5 (KG)",
        real: "CONSUMO REALE INGREDIENTE 5 (KG",
      },
      {
        label: "Ing 6",
        set: "SETPOINT INGREDIENTE 6 (KG)",
        real: "CONSUMO REALE INGREDIENTE 6 (KG",
      },
    ];

    const setpointTotals = ingredienti.map((ing) =>
      filteredData.reduce((acc, row) => acc + (Number(row[ing.set]) || 0), 0)
    );
    const realTotals = ingredienti.map((ing) =>
      filteredData.reduce((acc, row) => acc + (Number(row[ing.real]) || 0), 0)
    );

    return {
      series: [
        { name: "Setpoint Totale", data: setpointTotals },
        { name: "Consumo Reale", data: realTotals },
      ],
      categories: ingredienti.map((ing) => ing.label),
    };
  }, [data, startDate, endDate, dateCol]);

  const options = {
    chart: { type: "bar", height: 315, toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: graphData.categories },
    yaxis: { title: { text: "Kilogrammi (KG)" } },
    fill: { opacity: 1 },
    colors: ["#3b82f6", "#10b981"], // Blu per Setpoint, Verde per Reale
    tooltip: { y: { formatter: (val) => val.toFixed(2) + " KG" } },
  };

  return (
    <div className="mt-3">
      <Spkapexcharts
        chartOptions={options}
        chartSeries={graphData.series}
        type="bar"
        width={"100%"}
        height={315}
      />
    </div>
  );
}
