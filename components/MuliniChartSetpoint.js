"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function MuliniChartSetpoint({ file, startDate, endDate }) {
  // Simulazione dei dati (sostituire con parsing del file Excel)
  const labels = ["01/12", "02/12", "03/12", "04/12", "05/12"]; // Date
  const data = {
    labels,
    datasets: Array.from({ length: 6 }, (_, i) => ({
      label: `Setpoint Ingrediente ${i + 1}`,
      data: labels.map(() => Math.floor(Math.random() * 6) + 1),
      borderColor: `hsl(${i * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${i * 60}, 70%, 50%, 0.2)`,
      tension: 0.4,
    })).concat(
      Array.from({ length: 6 }, (_, i) => ({
        label: `Consumo Ingrediente ${i + 1}`,
        data: labels.map(() => Math.floor(Math.random() * 6) + 1),
        borderColor: `hsl(${i * 60}, 90%, 30%)`,
        borderDash: [5, 5],
        backgroundColor: "transparent",
        tension: 0.4,
      }))
    ),
  };

  const options = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      y: {
        title: { display: true, text: "KG" },
        beginAtZero: true,
      },
      x: {
        title: { display: true, text: "Data" },
      },
    },
  };

  return <Line data={data} options={options} />;
}
