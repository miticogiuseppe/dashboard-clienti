// VERSIONE OTTIMIZZATA GRAFICAMENTE — Pagina Tostini
// Layout migliorato, spacing corretto, cards visive più moderne,
// grafica coerente e senza stravolgimenti del codice originale.

"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import dayjs from "dayjs";
import { Fragment, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

// DATI
const tostini = {
  nome: "Tostini",
  fileStorico: "/data/STORICO_TRONCATRICE.zip",
  fileAppmerce: "/api/fetch-resource?id=ANALISI",
  appmerce: {
    ordini: 90,
    produzione: 1450,
    dataConsegna: "2025-12-15",
  },
};

// DATE UTILITIES
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

// COMPONENTE PRINCIPALE
export default function PaginaTostini() {
  // Filtri TS Azienda
  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  // Filtri Produzione Articoli
  const [pickerDateArt, setPickerDateArt] = useState([null, null]);
  const [periodoArt, setPeriodoArt] = useState("mese");
  const { startDate: startDateArt, endDate: endDateArt } =
    calcolaRange(periodoArt);

  return (
    <Fragment>
      <Seo title="Macchina - Tostini" />
      <Pageheader
        title="Macchine"
        currentpage="Tostini"
        activepage="Tostini"
        showActions={false}
      />

      {/* DASHBOARD MACCHINA */}
      <Row className="g-4 mb-4">
        <Col xxl={12}>
          <MacchinaDashboard {...tostini} />
        </Col>
      </Row>

      {/* SEZIONE GRAFICI PRINCIPALI */}
      <Row className="g-4">
        {/* TS AZIENDA */}
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <Card.Title className="mb-0 fw-semibold">TS Azienda</Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted border"
                Toggletext="Periodo"
              >
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoTS("settimana");
                    setPickerDateTS([null, null]);
                  }}
                >
                  Questa settimana
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoTS("mese");
                    setPickerDateTS([null, null]);
                  }}
                >
                  Ultimo mese
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoTS("anno");
                    setPickerDateTS([null, null]);
                  }}
                >
                  Anno corrente
                </Dropdown.Item>
              </SpkDropdown>
            </Card.Header>

            <Card.Body className="pt-2">
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDateTS(date)}
                value={pickerDateTS}
              />
              <p className="text-muted mt-2 mb-3 small">
                ({fmt(pickerDateTS?.[0]) || startDateTS} →{" "}
                {fmt(pickerDateTS?.[1]) || endDateTS})
              </p>

              {/* CHART */}
              <div className="mt-3">
                <AppmerceChart
                  title="TS Azienda"
                  startDate={fmt(pickerDateTS?.[0]) || startDateTS}
                  endDate={fmt(pickerDateTS?.[1]) || endDateTS}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* PRODUZIONE PER ARTICOLO */}
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <Card.Title className="mb-0 fw-semibold">
                Produzione per Articolo
              </Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted border"
                Toggletext="Periodo"
              >
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("settimana");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Questa settimana
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("mese");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Ultimo mese
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("anno");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Anno corrente
                </Dropdown.Item>
              </SpkDropdown>
            </Card.Header>

            <Card.Body className="pt-2">
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDateArt(date)}
                value={pickerDateArt}
              />
              <p className="text-muted mt-2 mb-3 small">
                ({fmt(pickerDateArt?.[0]) || startDateArt} →{" "}
                {fmt(pickerDateArt?.[1]) || endDateArt})
              </p>

              {/* CHART */}
              <div className="mt-3">
                <AppmerceChartByArticolo
                  file={tostini.fileAppmerce}
                  startDate={fmt(pickerDateArt?.[0]) || startDateArt}
                  endDate={fmt(pickerDateArt?.[1]) || endDateArt}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
