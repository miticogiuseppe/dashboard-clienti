"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import moment from "moment";

import { loadSheet, parseDates, filterByRange } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function MuliniChartIngrediente({
  file,
  ingrediente,
  colonne,
  startDate,
  endDate,
}) {
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState({});
  const [loading, setLoading] = useState(true);

  // Memoizza le colonne per evitare warning su useEffect
  const colonneMemo = useMemo(() => ({ ...colonne }), [colonne]);

  useEffect(() => {
    let isMounted = true; // evita aggiornamenti su componente smontato
    (async () => {
      try {
        setLoading(true);

        const response = await fetch(file); // file ora è l’endpoint API
        const blob = await response.blob();
        let jsonSheet = await loadSheet(blob, "Foglio1");

        // parsing date
        jsonSheet = parseDates(jsonSheet, [colonneMemo.data]);

        // filtro per range date
        if (startDate && endDate) {
          jsonSheet = filterByRange(
            jsonSheet,
            colonneMemo.data,
            moment(startDate),
            moment(endDate)
          );
        }

        // prepara serie dati
        const setpointData = jsonSheet.map((row) => ({
          x: moment(row[colonneMemo.data]).format("DD/MM/YYYY"),
          y: Number(row[colonneMemo.setpoint] || 0),
        }));

        const consumoData = jsonSheet.map((row) => ({
          x: moment(row[colonneMemo.data]).format("DD/MM/YYYY"),
          y: Number(row[colonneMemo.consumo] || 0),
        }));

        const seriesData = [
          { name: `Setpoint Ingrediente ${ingrediente}`, data: setpointData },
          {
            name: `Consumo Reale Ingrediente ${ingrediente}`,
            data: consumoData,
          },
        ];

        const categories = setpointData.map((d) => d.x);

        // crea opzioni grafico Apex
        const chartOptions = createOptions(
          jsonSheet,
          colonneMemo.data,
          null,
          "line"
        );
        chartOptions.xaxis = {
          ...chartOptions.xaxis,
          type: "category",
          categories,
        };

        if (isMounted) {
          setGraphSeries(seriesData);
          setGraphOptions(chartOptions);
        }
      } catch (err) {
        console.error(`Errore grafico Ingrediente ${ingrediente}:`, err);
        if (isMounted) {
          setGraphSeries([]);
          setGraphOptions({});
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false; // pulizia
    };
  }, [file, ingrediente, colonneMemo, startDate, endDate]);

  return (
    <div className="custom-card">
      <div className="card-body">
        {loading ? (
          <p>Caricamento dati in corso...</p>
        ) : graphSeries.length > 0 ? (
          <Spkapexcharts
            chartOptions={graphOptions}
            chartSeries={graphSeries}
            type="line"
            width="100%"
            height={315}
          />
        ) : (
          <p>Nessun dato disponibile per il range selezionato.</p>
        )}
      </div>
    </div>
  );
}
