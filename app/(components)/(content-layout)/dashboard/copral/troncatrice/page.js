"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceTable from "@/components/AppmerceTable";
import CustomDateComponent from "@/components/CustomDateComponent";
import LogTroncatriceChart from "@/components/Copral/LogTroncatriceChart";
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
  fileStorico: "/api/download-resource?id=STORICO_TRONCATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
};

export default function PaginaTroncatrice() {
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");

  const [pickerDateLog, setPickerDateLog] = useState(undefined);
  const [periodoLog, setPeriodoLog] = useState("mese");

  const [data, setData] = useState(undefined);
  const [data2, setData2] = useState(undefined);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1"
      );
      const resp = await res.json();
      let data = resp.data;
      data = parseDates(data, ["Data ord"]);
      data = orderSheet(data, ["Data ord"], ["asc"]);

      setData(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=TRONCATRICE_ESTESO&sheet=Foglio1"
      );
      const resp = await res.json();
      let data = resp.data;
      data = parseDates(data, ["Timestamp"]);
      data = parseTimes(data, ["Tempo"]);
      data = orderSheet(data, ["Timestamp"], ["asc"]);

      setData2(data);
    }
    fetchData();
  }, []);

  const isLoading = useMemo(() => {
    return !data || !data2;
  }, [data, data2]);

  return (
    <>
      <Seo title="Macchina - Troncatrice (Mecal)" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Macchine"
            currentpage="Troncatrice (Mecal)"
            activepage="Troncatrice (Mecal)"
            showActions={false}
          />

          <Row>
            <Col>
              <MacchinaDashboard {...resources} />
            </Col>
          </Row>

          {/* Card TS Azienda */}
          <Row className="mt-4">
            <Col xl={6}>
              <Card className="custom-card h-100">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione</Card.Title>
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
            <Col xl={6}>
              <Card className="custom-card h-100">
                <Card.Header className="justify-content-between">
                  <Card.Title>Log troncatrice esteso</Card.Title>
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoLog(period);
                      setPickerDateLog(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
                  <CustomDateComponent
                    onfunChange={(date) => setPickerDateLog(date)}
                    value={pickerDateLog}
                    period={periodoLog}
                  />
                  <LogTroncatriceChart
                    data={data2}
                    startDate={fmt(pickerDateLog, periodoLog, 0)}
                    endDate={fmt(pickerDateLog, periodoLog, 1)}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col xxl={6}>
              <AppmerceTable
                data={data}
                title="Produzione"
                fileExcel="APPMERCE-000"
                dateColumn="Data ord"
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
                    allowEmpty: true,
                    type: "number",
                  },
                  {
                    title: "Qta ev.",
                    column: "QTAev II UM",
                    allowEmpty: true,
                    type: "number",
                  },
                ]}
              />
            </Col>
            <Col xxl={6}>
              <AppmerceTable
                data={data2}
                title="Log troncatrice esteso (dati grezzi)"
                fileExcel="TRONCATRICE_ESTESO"
                dateColumn="Timestamp"
                filterDate={computeDate(pickerDateLog, periodoLog)}
                tableHeaders={[
                  {
                    title: "Data e ora",
                    column: "Timestamp",
                    showSeconds: true,
                  },
                  { title: "Comando", column: "CommandName" },
                  {
                    title: "Start/Stop",
                    column: "Col1",
                    allowEmpty: true,
                  },
                  {
                    title: "Lavorazione",
                    column: "Col2",
                    allowEmpty: true,
                  },
                  {
                    title: "Tempo",
                    column: "Tempo",
                    allowEmpty: true,
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
