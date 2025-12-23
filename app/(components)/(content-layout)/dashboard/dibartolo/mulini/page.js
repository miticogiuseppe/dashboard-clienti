"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import CustomDateComponent from "@/components/CustomDateComponent";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import PeriodDropdown from "@/components/PeriodDropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { fmt } from "@/utils/dateUtils";
import { orderSheet, parseDates } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

const mulini = {
  nome: "Mulini",
  fileStorico: "/api/download-resource?id=MULINI",
  fileAppmerce: "/api/download-resource?id=ANALISI",
  appmerce: {
    ordini: 90,
    produzione: 1450,
    dataConsegna: "2025-12-15",
  },
};

// COMPONENTE PRINCIPALE
export default function PaginaMulini() {
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
        "/api/fetch-excel-json?id=MULINI&sheet=Foglio1"
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
      <Seo title="Macchina - Mulini" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Macchine"
            currentpage="Mulini"
            activepage="Mulini"
            showActions={false}
          />

          {/* DASHBOARD MACCHINA */}
          <Row className="g-4 mb-4">
            <Col xxl={12}>
              <MacchinaDashboard {...mulini} tenant={mulini.tenant} />
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
                  <div className="mt-3">
                    <AppmerceChart
                      data={data}
                      startDate={fmt(pickerDateTS, periodoTS, 0)}
                      endDate={fmt(pickerDateTS, periodoTS, 1)}
                      dateCol="Data ordine"
                      qtyCol="Qta/kg da ev."
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
                    groupCol="Descrizione"
                    valueCol="Numero"
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
                tableHeaders={[
                  { title: "Data ord.", column: "Data ordine" },
                  { title: "Num. ord.", column: "Nr. ord." },
                  { title: "Ser.", column: "Ser." },
                  { title: "Cod. Cliente", column: "Cod. Cliente" },
                  {
                    title: "Rag. Soc.",
                    column: "Ragione sociale",
                    default: "Cliente generico",
                    bold: true,
                  },
                  { title: "Cod. Art.", column: "Articolo" },
                  { title: "Descr. Art", column: "Descrizione art. cliente" },
                  { title: "Qta/kg OV", column: "Qta/kg OV" },
                  { title: "Qta/kg evasa", column: "Qta/kg evasa" },
                  { title: "Qta/kg da ev.", column: "Qta/kg da ev." },
                  { title: "Data Cons. Rich.", column: "Data cons. rich." },
                ]}
              />
            </Col>
            <Col xl={6}>
              <AppmerceTable
                data={data2}
                title="Produzione per articolo"
                fileExcel="MULINI"
                dateColumn="DATA"
                tableHeaders={[
                  { title: "Orario", column: "ORARIO" },
                  { title: "Data", column: "DATA    ", bold: true },
                  {
                    title: "Codice Ricetta",
                    column: "CODICE IDENTIFICATIVO RICETTA",
                  },
                  {
                    title: "Setpoint 1 (KG)",
                    column: "SETPOINT INGREDIENTE 1 (KG)",
                  },
                  {
                    title: "Consumo Reale 1 (KG)",
                    column: "CONSUMO REALE INGREDIENTE 1 (KG)",
                  },
                  {
                    title: "Setpoint 2 (KG)",
                    column: "SETPOINT INGREDIENTE 2  (KG)",
                  },
                  {
                    title: "Consumo reale 2 (KG)",
                    column: "CONSUMO REALE INGREDIENTE 2 (KG",
                  },
                  {
                    title: "Setpoint 3 (KG)",
                    column: "SETPOINT INGREDIENTE 3 (KG)",
                  },
                  {
                    title: "Consumo Reale 3 (KG)",
                    column: "CONSUMO REALE INGREDIENTE 3 (KG",
                  },
                  {
                    title: "Setpoint 4 (KG)",
                    column: "SETPOINT INGREDIENTE 4 (KG)",
                  },
                  {
                    title: "Consumo Reale 4 (KG)",
                    column: "CONSUMO REALE INGREDIENTE 4 (KG",
                  },
                  {
                    title: "Setpoint 5 (KG)",
                    column: "SETPOINT INGREDIENTE 5 (KG)",
                  },
                  {
                    title: "Consumo Reale 5(KG)",
                    column: "CONSUMO REALE INGREDIENTE 5 (KG",
                  },
                  {
                    title: "Setpoint 6 (KG)",
                    column: "SETPOINT INGREDIENTE 6 (KG)",
                  },
                  {
                    title: "Consumo reale 6 (KG)",
                    column: "CONSUMO REALE INGREDIENTE 6 (KG",
                  },
                  {
                    title: "Tempo lavoro (min)",
                    column: "TEMPO LAVORATO  (MINUTI)",
                  },
                  { title: "Tempo stop (min)", column: "TEMPO STOP (MINUTI)" },
                  {
                    title: "Tempo stop allarme (min)",
                    column: "TEMPO STOP PER ALLARME (MINUTI)",
                  },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
