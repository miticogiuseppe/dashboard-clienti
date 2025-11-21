"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import moment from "moment";

import {
  loadSheet,
  sumByKey,
  parseDates,
  filterByRange,
  orderSheet,
} from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceChartByDate({ startDate, endDate }) {
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const response = await fetch("/data/APPMERCE-000.xlsx");
        const blob = await response.blob();
        let jsonSheet = await loadSheet(blob, "APPMERCE-000_1");

        // Parse date e ordina
        jsonSheet = parseDates(jsonSheet, ["Data ord"]);
        jsonSheet = orderSheet(jsonSheet, ["Data ord"], ["asc"]);

        // Filtra per range di date se definito
        if (startDate && endDate) {
          jsonSheet = filterByRange(
            jsonSheet,
            "Data ord",
            moment(startDate),
            moment(endDate)
          );
        }

        // 🔎 Somma quantità per giorno
        let counters = sumByKey(jsonSheet, "Data ord", "Qta da ev");

        // Ordina per data
        counters = counters.sort(
          (a, b) => new Date(a["Data ord"]) - new Date(b["Data ord"])
        );

        // 🔎 Prepara categorie già formattate
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

        // 🔎 Mantieni lo stile di createOptions e sostituisci le categorie
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

        setGraphSeries(seriesData);
        setGraphOptions(chartOptions);
      } catch (err) {
        console.error("Errore nel caricamento del grafico Appmerce:", err);
        setGraphSeries([]);
        setGraphOptions({});
      } finally {
        setLoading(false);
      }
    })();
  }, [startDate, endDate]);

  return (
    <div className="custom-card">
      <div className="card-header justify-content-between"></div>
      <div className="card-body">
        {loading ? (
          <p>Caricamento dati in corso...</p>
        ) : graphSeries.length > 0 && graphOptions.chart?.type ? (
          <Spkapexcharts
            chartOptions={graphOptions}
            chartSeries={graphSeries}
            type={graphOptions.chart.type}
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
