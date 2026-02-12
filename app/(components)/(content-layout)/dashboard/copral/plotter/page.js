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
import { orderSheet, parseDates, parseCustom } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import moment from "moment";

const resources = {
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
};

export default function PaginaPlotter() {
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const [pickerDateArt, setPickerDateArt] = useState(undefined);
  const [periodoArt, setPeriodoArt] = useState("mese");

  const [data, setData] = useState(undefined); // Ordini (Excel)
  const [data2, setData2] = useState(undefined); // Produzione (Plotter CSV)

  // 1. FETCH ORDINI (Sorgente Excel standard)
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(
          "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
        );
        const json = await response.json();
        let fetchedData = parseDates(json.data, ["Data ord"]);
        setData(orderSheet(fetchedData, ["Data ord"], ["asc"]));
      } catch (error) {
        console.error("Errore ordini:", error);
        setData([]);
      }
    }
    fetchOrders();
  }, []);

  // 2. FETCH PRODUZIONE (Sorgente Plotter CSV)
  useEffect(() => {
    async function fetchRobotData() {
      try {
        const response = await fetch("/api/fetch-plotter-data");
        const json = await response.json();

        // Trasformiamo le date
        const withDates = parseCustom(json.data, ["Ora"], (x) => moment(x));

        const processed = withDates
          .map((row) => {
            // --- CORREZIONE ERRORE VIRGOLA ---
            // Il server ci dà 43 invece di 0.43 e 50 invece di 0.5
            // Dobbiamo dividere per 100 i valori che arrivano dal CSV

            const areaNum = Number(row["Carta Totale usata (m2)"]) / 100 || 0;
            const inkNum =
              Number(row["Inchiostro Totale usato (ml)"]) / 100 || 0;

            const nomeLower = row["Nome"]?.toLowerCase() || "";

            return {
              ...row,
              // Valori numerici corretti (divisi per 100)
              areaNum: areaNum,
              inkNum: inkNum,

              // Gestione campi vuoti o mancanti nel CSV
              // Se "Tipo di carta" è vuoto nel CSV, mettiamo un trattino "-"
              "Tipo di carta":
                row["Tipo di carta"] && row["Tipo di carta"].trim() !== ""
                  ? row["Tipo di carta"]
                  : "-",

              "Qualità di stampa":
                row["Qualità di stampa"] &&
                row["Qualità di stampa"].trim() !== ""
                  ? row["Qualità di stampa"]
                  : "-",

              Utente:
                row["Utente"] && row["Utente"].trim() !== ""
                  ? row["Utente"]
                  : "Generico",

              // Logica per il tipo di operazione
              tipoOperazione:
                areaNum > 0
                  ? "Stampa"
                  : nomeLower.includes("maintenance")
                    ? "Manutenzione"
                    : "Servizio",

              // Formattazione data leggibile
              oraLeggibile:
                row.Ora && row.Ora.isValid()
                  ? row.Ora.format("DD/MM/YYYY HH:mm")
                  : "-",
            };
          })
          .filter((row) => row["Stato"] && row["Stato"] !== "");

        setData2(processed);
      } catch (error) {
        console.error("Errore Robot Plotter:", error);
        setData2([]);
      }
    }
    fetchRobotData();
  }, []);
  const isLoading = useMemo(() => !data || !data2, [data, data2]);

  return (
    <>
      <Seo title="Macchina - Plotter" />
      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Macchine"
            currentpage="Plotter"
            activepage="Plotter"
            showActions={false}
          />

          <Row>
            <Col>
              <MacchinaDashboard {...resources} />
            </Col>
          </Row>

          <Row className="stretch-row">
            {/* GRAFICO ORDINI */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Ordini Ricevuti</Card.Title>
                  <PeriodDropdown
                    onChange={(p) => {
                      setPeriodoTS(p);
                      setPickerDateTS(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
                  <CustomDateComponent
                    onfunChange={setPickerDateTS}
                    value={pickerDateTS}
                    period={periodoTS}
                  />
                  <AppmerceChart
                    data={data}
                    startDate={fmt(pickerDateTS, periodoTS, 0)}
                    endDate={fmt(pickerDateTS, periodoTS, 1)}
                    dateCol="Data ord"
                    qtyCol="Qta da ev"
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* GRAFICO PRODUZIONE */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione (mq)</Card.Title>
                  <PeriodDropdown
                    onChange={(p) => {
                      setPeriodoArt(p);
                      setPickerDateArt(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
                  <CustomDateComponent
                    onfunChange={setPickerDateArt}
                    value={pickerDateArt}
                    period={periodoArt}
                  />
                  <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(pickerDateArt, periodoArt, 0)}
                    endDate={fmt(pickerDateArt, periodoArt, 1)}
                    dateCol="Ora"
                    groupCol="Nome"
                    valueCol="areaNum"
                    seriesName="Mq Stampati"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* TABELLA ORDINI */}
            <Col xxl={6}>
              <AppmerceTable
                data={data}
                title="Ordini"
                fileExcel="APPMERCE-000"
                dateColumn="Data ord"
                filterDate={computeDate(pickerDateTS, periodoTS)}
                tableHeaders={[
                  { title: "Data ord.", column: "Data ord" },
                  {
                    title: "N. ord.",
                    column: "Nr.ord",
                    type: "number",
                  },
                  { title: "Sez.", column: "Sez", type: "number" },
                  {
                    title: "Rag. soc.",
                    column: "Ragione sociale",
                    default: "Cliente generico",
                    bold: true,
                  },
                  { title: "Agente", column: "Des. Agente" },
                  {
                    title: "Cod. art.",
                    className: "text-center",
                    column: "Articolo",
                  },
                  {
                    title: "Qta da ev.",
                    column: "Qta da ev",
                    type: "number",
                    allowZero: true,
                  },
                  {
                    title: "Qta ev.",
                    column: "QTAev II UM",
                    type: "number",
                    allowZero: true,
                  },
                ]}
              />
            </Col>

            {/* TABELLA LOG HP */}
            <Col xxl={6}>
              <AppmerceTable
                data={data2}
                title="Log Attività HP T2600"
                fileExcel="USAGE-HP"
                dateColumn="Ora"
                filterDate={computeDate(pickerDateArt, periodoArt)}
                tableHeaders={[
                  { title: "Inizio", column: "oraLeggibile", bold: true },
                  { title: "Documento", column: "Nome" },
                  { title: "Materiale", column: "Tipo di carta" },
                  { title: "Qualità", column: "Qualità di stampa" },
                  {
                    title: "Area (m²)",
                    column: "areaNum",
                    type: "number",
                  },
                  {
                    title: "Inchiostro (ml)",
                    column: "inkNum",
                    type: "number",
                  },
                  { title: "Stato", column: "Stato" },
                  { title: "Utente", column: "Utente" },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
