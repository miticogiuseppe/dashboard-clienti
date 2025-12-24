"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import CustomDateComponent from "@/components/CustomDateComponent";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import PeriodDropdown from "@/components/PeriodDropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { computeDate, fmt } from "@/utils/dateUtils";
import { orderSheet, parseDates } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

const tostini = {
  nome: "Tostini",
  fileStorico: "/api/download-resource?id=TOSTINI",
  fileAppmerce: "/api/download-resource?id=ANALISI",
  appmerce: {
    ordini: 90,
    produzione: 1450,
    dataConsegna: "2025-12-15",
  },
};

// COMPONENTE PRINCIPALE
export default function PaginaTostini() {
  // Filtri TS Azienda
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");

  // Filtri Produzione Articoli
  const [pickerDateArt, setPickerDateArt] = useState(undefined);
  const [periodoArt, setPeriodoArt] = useState("mese");

  const [data, setData] = useState(undefined);
  const [data2, setData2] = useState(undefined);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=appmerce_db"
      );
      const json = await response.json();
      let data = json.data;
      data = parseDates(data, ["Data ordine", "Data cons. rich."]);
      data = orderSheet(data, ["Data ordine"], ["asc"]);

      setData(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "/api/fetch-excel-json?id=TOSTINI&sheet=Foglio1"
      );
      const json = await response.json();
      let data = json.data;
      data = parseDates(data, ["Data"]);
      data = orderSheet(data, ["Data"], ["asc"]);

      setData2(data);
    }

    fetchData();
  }, []);

  const isLoading = useMemo(() => {
    return !data || !data2;
  }, [data, data2]);

  return (
    <>
      <Seo title="Macchina - Tostini" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
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
                  <Card.Title className="mb-0 fw-semibold">
                    TS Azienda
                  </Card.Title>
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoTS(period);
                      setPickerDateTS(undefined);
                    }}
                  />
                </Card.Header>

                <Card.Body className="pt-2">
                  <CustomDateComponent
                    onfunChange={(date) => setPickerDateTS(date)}
                    value={pickerDateTS}
                    period={periodoTS}
                  />

                  {/* CHART */}
                  <AppmerceChart
                    data={data}
                    startDate={fmt(pickerDateTS, periodoTS, 0)}
                    endDate={fmt(pickerDateTS, periodoTS, 1)}
                    dateCol="Data ordine"
                    qtyCol="Qta/kg da ev."
                  />
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
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoArt(period);
                      setPickerDateArt(undefined);
                    }}
                  />
                </Card.Header>

                <Card.Body className="pt-2">
                  <CustomDateComponent
                    onfunChange={(date) => setPickerDateArt(date)}
                    value={pickerDateArt}
                    period={periodoArt}
                  />

                  <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(pickerDateArt, periodoArt, 0)}
                    endDate={fmt(pickerDateArt, periodoArt, 1)}
                    dateCol="Data"
                    groupCol="Macchina_"
                    valueCol="Quantità Caricata Kg"
                    seriesName="Quantità"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xl={6}>
              <AppmerceTable
                data={data}
                title="Produzione"
                fileExcel="ANALISI"
                dateColumn="Data ordine"
                filterDate={computeDate(pickerDateTS, periodoTS)}
                tableHeaders={[
                  { title: "Data ord.", column: "Data ordine" },
                  { title: "Num. ord.", column: "Nr. ord.", type: "number" },
                  { title: "Ser.", column: "Ser.", type: "number" },
                  { title: "Cod. Cliente", column: "Cod. Cliente" },
                  {
                    title: "Rag. Soc.",
                    column: "Ragione sociale",
                    default: "Cliente generico",
                    bold: true,
                  },
                  { title: "Cod. Art.", column: "Articolo" },
                  { title: "Descr. Art", column: "Descrizione art. cliente" },
                  { title: "Qta/kg OV", column: "Qta/kg OV", type: "number" },
                  {
                    title: "Qta/kg evasa",
                    column: "Qta/kg evasa",
                    type: "number",
                    allowZero: true,
                  },
                  {
                    title: "Qta/kg da ev.",
                    column: "Qta/kg da ev.",
                    type: "number",
                    allowZero: true,
                  },
                  { title: "Data Cons. Rich.", column: "Data cons. rich." },
                ]}
              />
            </Col>
            <Col xl={6}>
              <AppmerceTable
                data={data2}
                title="Produzione per articolo"
                fileExcel="TOSTINI"
                dateColumn="Data"
                filterDate={computeDate(pickerDateArt, periodoArt)}
                tableHeaders={[
                  {
                    title: "Num. Form.",
                    column: "Numero FORMULA",
                    type: "number",
                  },
                  { title: "Data", column: "Data", bold: true },
                  {
                    title: "T. Carico",
                    column: "Temperatura tostino al carico °C",
                    type: "number",
                  },
                  {
                    title: "Quatità (Kg)",
                    column: "Quantità Caricata Kg",
                    type: "number",
                  },
                  {
                    title: "Durata ciclo",
                    column: "Durata ciclo  ",
                    type: "number",
                  },
                  {
                    title: "T. Scarico",
                    column: "Temperatura tostino allo scarico",
                    type: "number",
                  },
                  {
                    title: "Vel. (Hz)",
                    column: "Velocità Tostino Hz",
                    type: "number",
                  },
                  { title: "Macchina", column: "Macchina_" },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
