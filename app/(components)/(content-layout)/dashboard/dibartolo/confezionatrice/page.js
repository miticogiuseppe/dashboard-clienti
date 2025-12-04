"use client";
import SpkApexcharts from "@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts";
import SpkBreadcrumb from "@/shared/@spk-reusable-components/reusable-uielements/spk-breadcrumb";
import Seo from "@/shared/layouts-components/seo/seo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Card, Col, Row, Table } from "react-bootstrap";

// Importa dynamic per ApexCharts (come nel tuo file originale)
const Apexcharts = dynamic(() => import("react-apexcharts"), { ssr: false });
// -----------------------------------------------------------
// 1. Dati di esempio per il Grafico Sales Overview
// -----------------------------------------------------------
const salesOverviewSeries = [
  // Growth (Colonne Blu)
  {
    name: "Growth",
    type: "column",
    data: [150, 130, 100, 360, 140, 230, 170, 330, 260, 260, 120, 320],
  },
  // Profit (Linea Chiara - Linea 'Profit' nell'immagine non ha dati distinti, la useremo per la linea chiara)
  {
    name: "Profit",
    type: "area",
    data: [200, 600, 300, 450, 550, 680, 500, 400, 630, 650, 500, 450], // Stima per la linea chiara
  },
  // Sales (Linea Rosa)
  {
    name: "Sales",
    type: "line",
    data: [200, 330, 130, 150, 380, 450, 580, 350, 380, 620, 440, 480], // Stima per la linea rosa
  },
];

const salesOverviewOptions = {
  chart: {
    height: 350,
    type: "line",
    stacked: false,
    toolbar: {
      show: false,
    },
  },
  stroke: {
    width: [0, 2, 2], // 0 per le colonne, 2 per le linee
    curve: "smooth",
  },
  plotOptions: {
    bar: {
      columnWidth: "50%",
    },
  },
  colors: ["#91ff00ff", "#003cffff", "#f765b0ff"], // Colori stimati: Blu, Grigio chiaro/Lilla, Rosa
  fill: {
    opacity: [1, 0.2, 1], // Opacità per colonne, area e linea
    type: ["solid", "gradient", "solid"],
  },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  yaxis: [
    {
      seriesName: "Growth",
      axisTicks: { show: true },
      axisBorder: { show: false },
      labels: { formatter: (val) => Math.round(val) },
      title: { text: "Valori (0-800)" }, // Aggiunto titolo asse Y
      min: 0,
      max: 800,
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y) {
        if (typeof y !== "undefined") {
          return y.toFixed(0) + " units";
        }
        return y;
      },
    },
  },
  legend: {
    horizontalAlign: "center",
    offsetX: 0,
  },
};

// -----------------------------------------------------------
// 2. Dati di esempio per la Tabella in Alto (Dati in Tempo Reale)
// -----------------------------------------------------------
const datiOperativiEsempio = [
  {
    indice: 1,
    dataOra: "2025-12-02 17:00:10",
    peso: "15.2 kg",
    bilancia: "B-01",
    riservato: "N",
    descrizione: "Prodotto A",
  },
  {
    indice: 2,
    dataOra: "2025-12-02 17:00:15",
    peso: "22.5 kg",
    bilancia: "B-02",
    riservato: "S",
    descrizione: "Prodotto B",
  },
  {
    indice: 3,
    dataOra: "2025-12-02 17:00:20",
    peso: "8.1 kg",
    bilancia: "B-01",
    riservato: "N",
    descrizione: "Prodotto C",
  },
];

// -----------------------------------------------------------
// 3. Componente Principale della Seconda Pagina
// -----------------------------------------------------------
const DatiOperativi = () => {
  // Stato per il grafico superiore (Esempio: un grafico a linea semplice)
  const [topGraphSeries] = useState([
    { name: "Peso Medio", data: [10, 12, 8, 15, 11, 14, 9] },
  ]);
  const [topGraphOptions] = useState({
    chart: { type: "line", height: 250, toolbar: { show: false } },
    xaxis: { categories: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] },
    title: { text: "Andamento Peso Settimanale" },
  });

  return (
    <Fragment>
      <Seo title="Confezionatrice" />

      {/* */}
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <SpkBreadcrumb Customclass="mb-1">
            <li className="breadcrumb-item">
              <Link scroll={false} href="#!">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Confezionatrice
            </li>
          </SpkBreadcrumb>
          <h1 className="page-title fw-medium fs-18 mb-0">
            Dati Operativi in Tempo Reale
          </h1>
        </div>
      </div>
      {/* */}

      {/* --- */}

      {/* */}
      <Row>
        {/* Colonna per il Grafico Superiore */}
        <Col xl={5} lg={12}>
          <Card className="custom-card h-100">
            <Card.Header>
              <Card.Title>Andamento Peso/Bilancia</Card.Title>
            </Card.Header>
            <Card.Body>
              <Apexcharts
                options={topGraphOptions}
                series={topGraphSeries}
                type="line"
                height={250}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Colonna per la Tabella dei Dati in Tempo Reale */}
        <Col xl={7} lg={12}>
          <Card className="custom-card h-100">
            <Card.Header>
              <Card.Title>Ultimi Dati Registrati</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover className="text-nowrap">
                  <thead>
                    <tr>
                      <th>Indice</th>
                      <th>Data e Ora</th>
                      <th>Peso</th>
                      <th>Bilancia</th>
                      <th>Riservato</th>
                      <th>Descrizione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datiOperativiEsempio.map((data) => (
                      <tr key={data.indice}>
                        <td>{data.indice}</td>
                        <td>{data.dataOra}</td>
                        <td>**{data.peso}**</td>
                        <td>{data.bilancia}</td>
                        <td>{data.riservato}</td>
                        <td>{data.descrizione}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <hr />

      {/* */}
      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <Card.Title>Sales Overview</Card.Title>
            </Card.Header>
            <Card.Body>
              {/* ApexCharts componente per il grafico Sales Overview */}
              <Apexcharts
                options={salesOverviewOptions}
                series={salesOverviewSeries}
                type="line" // Il tipo è definito nelle opzioni (misto) ma ApexCharts vuole un tipo base.
                height={350}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* */}
    </Fragment>
  );
};

export default DatiOperativi;
