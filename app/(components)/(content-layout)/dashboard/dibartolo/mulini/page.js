"use client";

import { Fragment, useState, useEffect } from "react";
import dayjs from "dayjs";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";

import MuliniChart from "@/components/MuliniChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const muliniData = {
  fileExcel: "/api/download-resource?id=Dibartolo_Condivisione",
};

const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const inizio = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];

  return {
    startDate: inizio.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
};

// Grafico colonne con dati reali per un set di ingredienti
const MuliniBarChartGroup = ({ file, ingredienti, startDate, endDate }) => {
  const [dataChart, setDataChart] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Filtra per range date
        const filtered = jsonData.filter((row) => {
          const rowDate = dayjs(row["DATA"]);
          return (
            rowDate.isAfter(dayjs(startDate).subtract(1, "day")) &&
            rowDate.isBefore(dayjs(endDate).add(1, "day"))
          );
        });

        const labels = filtered.map((row) => row["DATA"]);
        const datasets = [];

        const colorsSetpoint = ["#1f77b4", "#ff7f0e", "#2ca02c"];
        const colorsConsumo = ["#aec7e8", "#ffbb78", "#98df8a"];

        ingredienti.forEach((ingrediente, i) => {
          datasets.push({
            label: `Setpoint ${ingrediente}`,
            data: filtered.map(
              (row) => row[`SETPOINT INGREDIENTE ${ingrediente} (KG)`] || 0
            ),
            backgroundColor: colorsSetpoint[i],
          });
          datasets.push({
            label: `Consumo ${ingrediente}`,
            data: filtered.map(
              (row) => row[`CONSUMO REALE INGREDIENTE ${ingrediente} (KG)`] || 0
            ),
            backgroundColor: colorsConsumo[i],
          });
        });

        setDataChart({ labels, datasets });
      } catch (error) {
        console.error("Errore lettura Excel:", error);
      }
    };

    fetchData();
  }, [file, ingredienti, startDate, endDate]);

  if (!dataChart) return <p>Caricamento dati...</p>;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", maxHeight: 100 },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} kg`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "KG" } },
      x: { stacked: false, title: { display: true, text: "Data" } },
    },
  };

  return <Bar data={dataChart} options={options} />;
};

export default function PaginaMulini() {
  const [pickerDate, setPickerDate] = useState([null, null]);
  const [periodo, setPeriodo] = useState("mese");
  const { startDate, endDate } = calcolaRange(periodo);

  return (
    <Fragment>
      <Seo title="Mulini" />
      <Pageheader
        title="Macchine"
        currentpage="Mulini"
        activepage="Mulini"
        showActions={false}
      />

      {/* FILTRO DATE */}
      <Row className="g-4 mb-4">
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <Card.Title className="mb-0 fw-semibold">
                Seleziona Date
              </Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted border"
                Toggletext="Periodo"
              >
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("settimana");
                    setPickerDate([null, null]);
                  }}
                >
                  Questa settimana
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("mese");
                    setPickerDate([null, null]);
                  }}
                >
                  Ultimo mese
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("anno");
                    setPickerDate([null, null]);
                  }}
                >
                  Anno corrente
                </Dropdown.Item>
              </SpkDropdown>
            </Card.Header>
            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDate(date)}
                value={pickerDate}
              />
              <p className="text-muted mt-2 mb-3 small">
                ({fmt(pickerDate?.[0]) || startDate} →{" "}
                {fmt(pickerDate?.[1]) || endDate})
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* DUE GRAFICI SEPARATI AFFIANCATI */}
      <Row className="g-4">
        <Col xl={6} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Ingredienti 1-3
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <MuliniBarChartGroup
                file={muliniData.fileExcel}
                ingredienti={[1, 2, 3]}
                startDate={fmt(pickerDate?.[0]) || startDate}
                endDate={fmt(pickerDate?.[1]) || endDate}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Ingredienti 4-6
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <MuliniBarChartGroup
                file={muliniData.fileExcel}
                ingredienti={[4, 5, 6]}
                startDate={fmt(pickerDate?.[0]) || startDate}
                endDate={fmt(pickerDate?.[1]) || endDate}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* GRAFICO TEMPI LAVORO / STOP */}
        <Col xl={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Tempo Lavorato / Tempo Stop / Tempo Stop Allarme
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <MuliniChart
                file={muliniData.fileExcel}
                colonne={{
                  data: "DATA",
                  orario: "ORARIO",
                  tempoLavorato: "TEMPO LAVORATO  (MINUTI)",
                  tempoStop: "TEMPO STOP (MINUTI)",
                  tempoStopAllarme: "TEMPO STOP PER ALLARME (MINUTI)",
                }}
                startDate={fmt(pickerDate?.[0]) || startDate}
                endDate={fmt(pickerDate?.[1]) || endDate}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
