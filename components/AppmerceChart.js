"use client";
import { filterByRange, sumByKey } from "@/utils/excelUtils";
import { createOptions } from "@/utils/graphUtils";
import moment from "moment";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

export default function AppmerceChartByDate({
  data,
  startDate,
  endDate,
  dateCol,
  qtyCol,
}) {
  const t = useTranslations("Graph");

  const graphData = useMemo(() => {
    let filteredData = data;

    // Filtra per range di date se definito
    if (startDate && endDate) {
      filteredData = filterByRange(
        filteredData,
        dateCol,
        moment(startDate),
        moment(endDate)
      );
    }

    // Somma quantità per giorno
    let counters = sumByKey(filteredData, dateCol, qtyCol);
    let total = counters.reduce((acc, item) => acc + item.count, 0);

    // Ordina per data
    counters = counters.sort(
      (a, b) => new Date(a[dateCol]) - new Date(b[dateCol])
    );

    // Prepara categorie già formattate
    const categories = counters.map((c) =>
      moment(c[dateCol]).format("DD/MM/YYYY")
    );

    // Serie dati
    const seriesData = [
      {
        name: "Quantità",
        data: counters.map((c) => ({
          x: moment(c[dateCol]).format("DD/MM/YYYY"),
          y: Number(c.count),
        })),
      },
    ];

    // Mantieni lo stile di createOptions e sostituisci le categorie
    const baseOptions = createOptions(counters, dateCol, null, "bar");
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
      isEmpty: total === 0,
    };
  }, [data, startDate, endDate, dateCol, qtyCol]);

  return (
    <div className="custom-card">
      <div className="card-header justify-content-between"></div>
      <div className="card-body">
        {!graphData.isEmpty ? (
          <Spkapexcharts
            chartOptions={graphData.graphOptions}
            chartSeries={graphData.graphSeries}
            type={graphData.graphOptions.chart.type}
            width={"100%"}
            height={315}
          />
        ) : (
          <div className="no-data text-muted">{t("NoData")}</div>
        )}
      </div>
    </div>
  );
}
