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

export default function PaginaTostini() {
  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

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

      <Row>
        <Col xxl={12}>
          <MacchinaDashboard {...tostini} />
        </Col>
      </Row>

      {/* TS Azienda */}
      <Row className="mt-4">
        <Col xl={6}>
          <Card className="custom-card h-100">
            <Card.Header className="justify-content-between">
              <Card.Title>TS Azienda</Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted"
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
            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDateTS(date)}
                value={pickerDateTS}
              />
              <p className="text-muted mb-2">
                ({fmt(pickerDateTS?.[0]) || startDateTS} →{" "}
                {fmt(pickerDateTS?.[1]) || endDateTS})
              </p>
              <AppmerceChart
                title="TS Azienda"
                startDate={fmt(pickerDateTS?.[0]) || startDateTS}
                endDate={fmt(pickerDateTS?.[1]) || endDateTS}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Produzione per Articolo */}
        <Col xl={6}>
          <Card className="custom-card h-100">
            <Card.Header className="justify-content-between">
              <Card.Title>Produzione per Articolo</Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted"
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
            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDateArt(date)}
                value={pickerDateArt}
              />
              <p className="text-muted mb-2">
                {periodoArt} ({fmt(pickerDateArt?.[0]) || startDateArt} →{" "}
                {fmt(pickerDateArt?.[1]) || endDateArt})
              </p>
              <AppmerceChartByArticolo
                file={tostini.fileAppmerce}
                startDate={fmt(pickerDateArt?.[0]) || startDateArt}
                endDate={fmt(pickerDateArt?.[1]) || endDateArt}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
