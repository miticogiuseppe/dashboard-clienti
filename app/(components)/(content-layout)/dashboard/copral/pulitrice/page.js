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
  // fileStorico: "/api/download-resource?id=STORICO_IMBALLATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
};

export default function PaginaPulitrice() {
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");

  const [pickerDateArt, setPickerDateArt] = useState(undefined);
  const [periodoArt, setPeriodoArt] = useState("mese");

  const [data, setData] = useState(undefined);
  const [data2, setData2] = useState(undefined);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1"
      );
      const resp = await res.json();
      let data = resp.data;

      data = data.map((item) => {
        const qtaEv = item["QTAev II UM"];
        const sanitizedQtaEv =
          qtaEv === null || qtaEv === undefined || qtaEv === "" ? 0 : qtaEv;

        const qtaDaEv = item["Qta da ev"];
        const sanitizedQtaDaEv =
          qtaDaEv === null || qtaDaEv === undefined || qtaDaEv === ""
            ? 0
            : qtaDaEv;
        return {
          ...item,
          "QTAev II UM": sanitizedQtaEv,
          "Qta da ev": sanitizedQtaDaEv,
        };
      });

      data = parseDates(data, ["Data ord"]);
      data = orderSheet(data, ["Data ord"], ["asc"]);

      setData(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/fetch-excel-json?id=pulitrice&sheet=Arsv");
      const resp = await res.json();
      let data = resp.data;
      data = parseDates(data, ["Data"]);
      data = parseTimes(data, ["ora_inizio", "ora_fine"]);
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
      <Seo title="Macchina - Pulitrice" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Macchine"
            currentpage="Pulitrice"
            activepage="Pulitrice"
            showActions={false}
          />

          <Row>
            <Col>
              <MacchinaDashboard {...resources} />
            </Col>
          </Row>

          {/* Card TS Azienda */}
          <Row className="stretch-row">
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Ordini</Card.Title>
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoTS(period);
                      setPickerDateTS(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
                  <CustomDateComponent
                    onfunChange={(date) => setPickerDateTS(date)}
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

            {/* Card Produzione per Articolo */}
            <Col xxl={6} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione per articolo</Card.Title>
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoArt(period);
                      setPickerDateArt(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
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
                    groupCol="descrizione"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
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
                  { title: "Qta da ev.", column: "Qta da ev", type: "number" },
                  {
                    title: "Qta ev.",
                    column: "QTAev II UM",
                    type: "number",
                  },
                ]}
              />
            </Col>
            <Col xxl={6}>
              <AppmerceTable
                data={data2}
                title="Produzione per articolo"
                fileExcel="Arsv"
                // 1. dateColumn CORRETTO: Deve usare "Data"
                dateColumn="Data"
                filterDate={computeDate(pickerDateArt, periodoArt)}
                tableHeaders={[
                  // 2. Colonna Data CORRETTA: La chiave è "Data" (con la D maiuscola)
                  { title: "Data e ora", column: "Data", bold: true },

                  // 3. Colonna ID CORRETTA: La chiave è "Id" (con la I minuscola o maiuscola,
                  //    qui usiamo "Id" come avevi indicato precedentemente)
                  { title: "ID", column: "Id", type: "number" },

                  // 4. Colonna Descrizione CORRETTA: La chiave è "descrizione"
                  { title: "Descrizione", column: "descrizione" },

                  // 5. Colonna Inizio CORRETTA: La chiave è "ora_inizio"
                  { title: "Inizio", column: "ora_inizio", format: "hh:mm:ss" },

                  // 6. Colonna Fine CORRETTA: La chiave è "ora_fine"
                  { title: "Fine", column: "ora_fine", format: "hh:mm:ss" },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
