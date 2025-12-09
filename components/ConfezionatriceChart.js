"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

// IMPORTAZIONI DEI PLUGIN DAY.JS
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Estendi Day.js con i plugin
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Funzione mock di loadSheet (se non è già importata, usala così)
const loadSheet = async (blob, sheetName) => {
  const workbook = XLSX.read(await blob.arrayBuffer(), { type: "array" });
  const sheet =
    workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
  // !!! Essenziale: usiamo {raw: true} per ottenere i numeri seriali di Excel !!!
  return XLSX.utils.sheet_to_json(sheet, { raw: true });
};

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ComponentChart = ({ file, colonne, startDate, endDate }) => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        setDataChart(null);

        // 1. TROVARE IL FILE (Se il componente gestisce il fetch da filedb.json)
        // NOTA: Se il prop 'file' passato è già il percorso, ignora le 5 righe seguenti.
        const resDb = await fetch("/api/filedb");
        const filedb = await resDb.json();
        const fileInfo = filedb.Dibartolo.find(
          (f) => f.id === "Dibartolo_Confezionatrice" // <-- Cerca l'ID corretto
        );
        const filePath = fileInfo ? fileInfo.path : file; // Usa il percorso trovato o il prop 'file'

        // 2. FETCH DATI
        const response = await fetch(filePath);
        const blob = await response.blob();
        let jsonSheet = await loadSheet(blob, "Foglio1");

        // 3. PREPARAZIONE E FILTRAGGIO ROBUSTO
        const startFilter = dayjs(startDate).startOf("day");
        const endFilter = dayjs(endDate).endOf("day");

        const filtered = jsonSheet.filter((row) => {
          let rawDateValue = row[colonne.dataOra];
          let dateString;

          // Conversione del seriale Excel in una stringa data/ora
          if (typeof rawDateValue === "number" && rawDateValue > 1) {
            dateString = XLSX.SSF.format("yyyy-mm-dd HH:mm:ss", rawDateValue);
          } else {
            dateString = rawDateValue;
          }

          const rowDate = dayjs(dateString);

          if (!rowDate.isValid()) {
            // Se la data non è valida, scarta la riga
            return false;
          }

          // Filtro: inclusivo all'inizio (startFilter) e alla fine (endFilter)
          return (
            rowDate.isSameOrAfter(startFilter) &&
            rowDate.isSameOrBefore(endFilter)
          );
        });

        // 4. PREPARAZIONE DATI PER CHART.JS

        const bilance = [...new Set(filtered.map((r) => r[colonne.bilancia]))];
        const labels = filtered.map((r) => {
          let rawDateValue = r[colonne.dataOra];
          if (typeof rawDateValue === "number" && rawDateValue > 1) {
            // Formatta il seriale Excel per l'etichetta del grafico
            return XLSX.SSF.format("DD/MM HH:mm", rawDateValue);
          }
          // Altrimenti usa dayjs per formattare la stringa data/ora
          return dayjs(rawDateValue).format("DD/MM HH:mm");
        });

        const datasets = bilance.map((b, i) => {
          const color = `hsl(${(i * 70) % 360}, 70%, 50%)`;
          const data = filtered
            .filter((r) => r[colonne.bilancia] === b)
            .map((r) => Number(r[colonne.valore]) || 0);

          return {
            label: `Bilancia ${b}`,
            data,
            backgroundColor: color,
          };
        });

        if (isMounted) {
          setDataChart({ labels, datasets });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Errore lettura o elaborazione dati:", error);
          setDataChart(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [file, colonne, startDate, endDate]);

  // Visualizzazione condizionale
  if (loading) return <p>Caricamento dati...</p>;
  if (!dataChart || dataChart.datasets.every((d) => d.data.length === 0))
    return <p>Nessun dato disponibile per il periodo selezionato.</p>;

  // Opzioni del grafico
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} kg`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Kg" } },
      x: { title: { display: true, text: "Data e Ora" } },
    },
  };

  return <Bar data={dataChart} options={options} />;
};

export default ComponentChart;
