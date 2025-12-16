"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import moment from "moment";
import { useTranslations } from "next-intl";

// Utility Excel
import { filterByRange, sumByKey } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";

// ApexCharts
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function LogTroncatriceChart({ data, startDate, endDate }) {
  const t = useTranslations("Graph");

  const includeList = useMemo(
    () => [
      "BLADE OFF",
      "BLADE ON",
      "CYCLE",
      "END",
      "ERROR",
      "LIST",
      "NO ALARM",
      "SINGLE CUT",
      "START",
      "STEP CUT",
    ],
    []
  );

  let graphData = useMemo(() => {
    let filteredData = data;

    // Filtra per intervallo date
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        "Timestamp",
        moment(startDate),
        moment(endDate)
      );
    }

    // Somma quantità per Articolo
    let counters = sumByKey(
      filteredData,
      "CommandName",
      "Tempo",
      true,
      (value) => value.asMilliseconds()
    );
    // counters = counters.sort((a, b) => b.count - a.count);
    counters = counters.filter((c) => includeList.includes(c.CommandName));
    let total = counters.reduce((acc, item) => acc + item.count, 0);

    // Trasforma per ApexCharts
    const seriesData = [
      {
        name: "Tempo",
        data: counters.map((c) => ({
          x: c.CommandName,
          y: Number(c.count),
        })),
      },
    ];

    // Usa createOptions come AppmerceChart
    const chartOptions = createOptions(counters, "CommandName", null, "bar");

    // Colore verdino più evidente
    chartOptions.colors = ["#4CAF50"];
    chartOptions.fill = {
      ...chartOptions.fill,
      opacity: 1,
    };
    chartOptions.yaxis.labels.formatter = function (s) {
      s = s / 1000;

      const hours = Math.floor(s / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = Math.floor(s % 60);

      let formatted = "";
      if (hours > 0) formatted += hours + "h ";
      if (minutes > 0) formatted += minutes + "m ";
      formatted += seconds + "s";

      return formatted;
    };

    return {
      graphSeries: seriesData,
      graphOptions: chartOptions,
      isEmpty: total === 0,
    };
  }, [data, startDate, endDate, includeList]);

  return (
    <div className="custom-card">
      <div className="card-header justify-content-between"></div>
      <div className="card-body">
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
      </div>
    </div>
  );
}
