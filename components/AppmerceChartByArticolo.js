"use client";
import { filterByRange, sumByKey } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";
import moment from "moment";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

// ApexCharts
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false },
);

export default function AppmerceChartByArticolo({
  data,
  startDate,
  endDate,
  groupCol,
  valueCol,
  dateCol,
  groupCb,
  noSort,
  seriesName,
}) {
  const t = useTranslations("Graph");

  let graphData = useMemo(() => {
    let filteredData = data;

    // Filtra per intervallo date
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        dateCol,
        moment(startDate),
        moment(endDate),
      );
    }

    // Somma quantità per Articolo
    let counters = sumByKey(
      filteredData,
      groupCol,
      valueCol,
      false,
      undefined,
      groupCb,
    );
    let total = counters.reduce((acc, item) => acc + item.count, 0);
    if (!noSort) counters = counters.sort((a, b) => b.count - a.count);
    counters = counters.filter((c) => c.count > 0);

    // Trasforma per ApexCharts
    const seriesData = [
      {
        name: seriesName,
        data: counters.map((c) => ({
          x: c[groupCol],
          y: Number(c.count),
        })),
      },
    ];

    // Usa createOptions come AppmerceChart
    const chartOptions = createOptions(
      counters,
      groupCol,
      undefined,
      undefined,
      "bar",
    );

    // fix label lunghe
    chartOptions.xaxis = {
      ...chartOptions.xaxis,
      labels: {
        ...chartOptions.xaxis?.labels,
        show: true,
        rotate: -45,
        rotateAlways: true,
        minHeight: 100,
        hideOverlappingLabels: false,
        style: {
          fontSize: "11px",
        },
      },
    };

    // Colore verdino più evidente
    chartOptions.colors = ["#4CAF50"];
    chartOptions.fill = {
      ...chartOptions.fill,
      opacity: 1,
    };

    // --- LOGICA INTELLIGENTE PER DECIMALI E UNITÀ DI MISURA ---
    chartOptions.yaxis = {
      ...chartOptions.yaxis,
      labels: {
        formatter: (val) => {
          // Se sono metri quadri (Plotter), mostra 2 decimali
          return seriesName === "Mq Stampati"
            ? val.toFixed(2)
            : Math.round(val);
        },
      },
    };

    chartOptions.tooltip = {
      ...chartOptions.tooltip,
      y: {
        formatter: (val) => {
          // Se sono metri quadri, aggiungi "mq", altrimenti solo il numero
          return seriesName === "Mq Stampati"
            ? val.toFixed(2) + " mq"
            : Math.round(val).toString();
        },
      },
    };
    // -------------------------------------------------------

    return {
      graphSeries: seriesData,
      graphOptions: chartOptions,
      isEmpty: total === 0,
    };
  }, [
    data,
    startDate,
    endDate,
    dateCol,
    groupCol,
    valueCol,
    groupCb,
    noSort,
    seriesName,
  ]);

  return (
    <>
      {!graphData.isEmpty ? (
        <Spkapexcharts
          chartOptions={graphData.graphOptions}
          chartSeries={graphData.graphSeries}
          type={graphData.graphOptions.chart.type}
          width="100%"
          height={350}
        />
      ) : (
        <div className="no-data text-muted">{t("NoData")}</div>
      )}
    </>
  );
}
