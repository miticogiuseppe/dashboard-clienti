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

  const [data, setData] = useState(undefined); // Ordini
  const [data2, setData2] = useState(undefined); // Produzione Robot

  // FETCH ORDINI
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
  // FETCH PRODUZIONE ROBOT
  useEffect(() => {
    async function fetchRobotData() {
      try {
        const response = await fetch("/api/fetch-plotter-data");
        const json = await response.json();

        // 1. Usiamo la tua parseCustom per le date
        let rawData = parseCustom(json.data, ["Ora"], (x) => moment(x));

        // 2. Sanitizzazione dati
        const sanitized = rawData
          .map((row) => {
            const areaRaw = row["Area carta (m2)"] || "0";
            const parsedArea =
              parseFloat(areaRaw.toString().replace(",", ".")) || 0;

            return {
              ...row,
              "Area carta (m2)": parsedArea,
              areaNum: parsedArea,
              oraLeggibile: row.Ora.format("DD/MM/YYYY HH:mm"), // Per vedere l'ora in tabella
            };
          })
          // 3. FILTRO AGGIORNATO:
          // Teniamo tutto ciò che è "Stampato" (incluse manutenzioni con area 0)
          // Oppure tutto ciò che contiene la parola "maintenance" o "Service"
          .filter((row) => {
            const stato = row["Stato"]?.trim();
            const nome = row["Nome"]?.toLowerCase() || "";
            return (
              stato === "Stampato" ||
              nome.includes("maintenance") ||
              nome.includes("service")
            );
          });

        setData2(sanitized);
      } catch (error) {
        console.error("Errore fetchPlotterData:", error);
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

            {/* GRAFICO PRODUZIONE REALE */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione Metri Quadri</Card.Title>
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
                    valueCol="Area carta (m2)"
                    seriesName="Mq Prodotti"
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
                title="Dettaglio Ordini"
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

            {/* TABELLA PRODUZIONE REALE */}
            <Col xxl={6}>
              <AppmerceTable
                data={data2}
                title="Log HP T2600"
                fileExcel="Usage"
                dateColumn="Ora"
                filterDate={computeDate(pickerDateArt, periodoArt)}
                tableHeaders={[
                  { title: "ID", column: "Ordina" },
                  { title: "Inizio Stampa", column: "Ora", bold: true },
                  { title: "Documento", column: "Nome" },
                  {
                    title: "Area (m²)",
                    column: "Area carta (m2)",
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
