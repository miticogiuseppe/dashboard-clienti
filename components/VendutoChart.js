"use client";
import React from "react";
import { Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/utils/currency";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const VendutoChart = ({ data }) => {
  const categories = data.map((item) => item["CLIENTI"]);

  const series = [
    {
      name: "2023",
      data: data.map((item) => Number(item["2023"]) || 0),
    },
    {
      name: "2024",
      data: data.map((item) => Number(item["2024"]) || 0),
    },
    {
      name: "2025",
      data: data.map((item) => Number(item["2025"]) || 0),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 450,
      toolbar: { show: false },
      events: {
        mounted: (chart) => {
          chart.windowResizeHandler();
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 4,
      },
    },
    grid: { borderColor: "#f2f5f7" },
    dataLabels: { enabled: false },
    colors: ["#5c67f7", "#e354d4", "#ff8e6f"],
    xaxis: {
      categories: categories,
      labels: {
        show: true,
        rotate: -50,
        rotateAlways: true,
        minHeight: 100,
        maxHeight: 150,
        style: {
          colors: "#8c9097",
          fontSize: "9px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      title: {
        text: "Importo (€)",
        style: { color: "#8c9097" },
      },
      labels: {
        formatter: (val) => `${(val / 1000).toFixed(0)}k`, // Mostra in migliaia per pulizia
        style: { colors: "#8c9097" },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
  };

  return (
    <Card className="custom-card">
      <Card.Header>
        <Card.Title>Venduto ultimi 3 anni</Card.Title>
      </Card.Header>
      <Card.Body>
        <div id="column-chart">
          <Spkapexcharts
            chartOptions={options}
            chartSeries={series}
            type="bar"
            height={350}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default VendutoChart;
