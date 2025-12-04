"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import moment from "moment";

// Utility Excel
import {
  loadSheet,
  parseDates,
  filterByRange,
  sumByKey,
  orderSheet,
} from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

// ApexCharts
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceChartByArticolo({ startDate, endDate }) {
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Carica il file Excel
        const response = await fetch("/data/imballatrice_a.xlsx");
        const blob = await response.blob();
        let jsonSheet = await loadSheet(blob, "Foglio1");

        // Prepara i dati
        jsonSheet = parseDates(jsonSheet, ["Data"]);
        jsonSheet = orderSheet(jsonSheet, ["Data"], ["asc"]);

        // Filtra per intervallo date
        if (startDate && endDate) {
          jsonSheet = filterByRange(
            jsonSheet,
            "Data",
            moment(startDate),
            moment(endDate)
          );
        }

        // Somma quantità per Articolo
        let counters = sumByKey(jsonSheet, "Descrizione", "Numero");
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
        const chartOptions = createOptions(
          counters,
          "Descrizione",
          null,
          "bar"
        );

        // Colore verdino più evidente
        chartOptions.colors = ["#4CAF50"];
        chartOptions.fill = {
          ...chartOptions.fill,
          opacity: 1,
        };

        setGraphSeries(seriesData);
        setGraphOptions(chartOptions);
      } catch (err) {
        console.error("Errore nel caricamento di Produzione Macchina:", err);
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
            width="100%"
            height={350}
          />
        ) : (
          <p>Nessun dato disponibile per il range selezionato.</p>
        )}
      </div>
    </div>
  );
}
