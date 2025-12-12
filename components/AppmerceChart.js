"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import moment from "moment";

import { sumByKey, filterByRange } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceChartByDate({ data, startDate, endDate }) {
  const graphData = useMemo(() => {
    let filteredData = data;

    // Filtra per range di date se definito
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        "Data ord",
        moment(startDate),
        moment(endDate)
      );
    }

    // Somma quantità per giorno
    let counters = sumByKey(filteredData, "Data ord", "Qta da ev");

    // Ordina per data
    counters = counters.sort(
      (a, b) => new Date(a["Data ord"]) - new Date(b["Data ord"])
    );

    // Prepara categorie già formattate
    const categories = counters.map((c) =>
      moment(c["Data ord"]).format("DD/MM/YYYY")
    );

    // Serie dati
    const seriesData = [
      {
        name: "Quantità",
        data: counters.map((c) => ({
          x: moment(c["Data ord"]).format("DD/MM/YYYY"),
          y: Number(c.count),
        })),
      },
    ];

    // Mantieni lo stile di createOptions e sostituisci le categorie
    const baseOptions = createOptions(counters, "Data ord", null, "bar");
    const chartOptions = {
      ...baseOptions,
      xaxis: {
        ...baseOptions.xaxis,
        type: "category",
        categories, // 👈 categorie già formattate
        labels: {
          ...baseOptions.xaxis?.labels,
          formatter: (val) => val,
        },
      },
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
        {graphData.graphSeries.length > 0 &&
        graphData.graphOptions.chart?.type ? (
          <Spkapexcharts
            chartOptions={graphData.graphOptions}
            chartSeries={graphData.graphSeries}
            type={graphData.graphOptions.chart.type}
            width={"100%"}
            height={315}
          />
        ) : (
          <p>Nessun dato disponibile per il range selezionato.</p>
        )}
      </div>
    </div>
  );
}
