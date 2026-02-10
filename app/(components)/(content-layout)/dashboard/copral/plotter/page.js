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
import { orderSheet, parseDates, parseTimes } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

const resources = {
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
};

// --- DATI MOCK PER PRODUZIONE PLOTTER (In attesa del CSV) ---
const MOCK_PLOTTER = [
  {
    Numero: 404,
    Ora: "2026/01/13 03:34",
    Nome: "Service - maintenance",
    Utente: "Service",
    "Area carta (m²)": 0.0,
    Stato: "Stampato",
  },
  {
    Numero: 405,
    Ora: "2026/01/13 09:35",
    Nome: "Progetto_Esecutivo.pdf",
    Utente: "Admin",
    "Area carta (m²)": 1.25,
    Stato: "Stampato",
  },
  {
    Numero: 406,
    Ora: "2026/01/14 15:35",
    Nome: "Locandina_Cantiere.png",
    Utente: "User1",
    "Area carta (m²)": 0.45,
    Stato: "Stampato",
  },
];

export default function PaginaPlotter() {
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const [pickerDateArt, setPickerDateArt] = useState(undefined);
  const [periodoArt, setPeriodoArt] = useState("mese");

  const [data, setData] = useState(undefined); // Dati REALI Ordini
  const [data2, setData2] = useState(undefined); // Dati MOCK Produzione

  // FETCH REALE ORDINI (APPMERCE-000)
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
        );
        const resp = await res.json();
        let fetchedData = resp.data;

        fetchedData = parseDates(fetchedData, ["Data ord"]);
        fetchedData = orderSheet(fetchedData, ["Data ord"], ["asc"]);

        setData(fetchedData);
      } catch (error) {
        console.error("Errore caricamento ordini:", error);
        setData([]); // Fallback array vuoto in caso di errore
      }
    }
    fetchOrders();
  }, []);

  // CARICAMENTO MOCK PRODUZIONE
  useEffect(() => {
    const timer = setTimeout(() => {
      setData2(parseDates(MOCK_PLOTTER, ["Ora"]));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = useMemo(() => {
    return !data || !data2;
  }, [data, data2]);

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
            {/* GRAFICO ORDINI (REALE) */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Ordini</Card.Title>
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

            {/* GRAFICO MQ STAMPATI (MOCK) */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione Mq (Mock)</Card.Title>
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
                    valueCol="Area carta (m²)"
                    seriesName="Metri Quadri"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* TABELLA ORDINI (REALE) */}
            <Col xxl={6}>
              <AppmerceTable
                data={data}
                title="Ordini"
                fileExcel="APPMERCE-000"
                dateColumn="Data ord"
                filterDate={computeDate(pickerDateTS, periodoTS)}
                tableHeaders={[
                  { title: "Data ord.", column: "Data ord" },
                  { title: "N. ord.", column: "Nr.ord", type: "number" },
                  { title: "Rag. soc.", column: "Ragione sociale", bold: true },
                  { title: "Articolo", column: "Articolo" },
                  { title: "Qta ev.", column: "QTAev II UM", type: "number" },
                ]}
              />
            </Col>

            {/* TABELLA PRODUZIONE (MOCK) */}
            <Col xxl={6}>
              <AppmerceTable
                data={data2}
                title="Log HP T2600 (Mock)"
                fileExcel="MOCK_HP"
                dateColumn="Ora"
                filterDate={computeDate(pickerDateArt, periodoArt)}
                tableHeaders={[
                  { title: "ID", column: "Numero" },
                  { title: "Inizio Stampa", column: "Ora", bold: true },
                  { title: "Documento", column: "Nome" },
                  {
                    title: "Area (m²)",
                    column: "Area carta (m²)",
                    type: "number",
                  },
                  { title: "Status", column: "Stato" },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
