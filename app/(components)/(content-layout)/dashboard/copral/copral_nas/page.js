"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import TroncatriceLogTable from "@/components/TroncatriceLogTable";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { parseDates, parseDatesString, orderSheet } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";

const troncatrice = {
  nome: "Troncatrice (Mecal)",

  // Endpoint
  fileStorico: "/api/download-resource?id=STORICO_TRONCATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",

  tenant: "Copral",
  appmerce: {
    ordini: 90,
    produzione: 1450,
    dataConsegna: "2025-12-15",
  },
};
// Utility per calcolare range date da periodo
const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const inizio = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];
  return [inizio.toDate(), oggi.toDate()];
};

// Utility per formattare sempre le date
const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
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
      data = parseDatesString(data, ["Timestamp"], "DD/MM/YYYY HH:mm:ss");
      data = orderSheet(data, ["Timestamp"], ["asc"]);

      setData2(data);
    }
    fetchData();
  }, []);

  const isLoading = useMemo(() => {
    return !data || !data2;
  }, [data, data2]);

  // Stato per TS Azienda
  const computedDateTS = useMemo(() => {
    if (pickerDateTS) return pickerDateTS;
    return calcolaRange(periodoTS);
  }, [pickerDateTS, periodoTS]);

  // Stato per Log Troncatrice Esteso
  const computedDateLog = useMemo(() => {
    if (pickerDateLog) return pickerDateLog;
    return calcolaRange(periodoLog);
  }, [pickerDateLog, periodoLog]);

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
              <MacchinaDashboard {...troncatrice} tenant={troncatrice.tenant} />
            </Col>
          </Row>

          {/* Card TS Azienda */}
          <Row className="mt-4">
            <Col xl={6}>
              <Card className="custom-card h-100">
                <Card.Header className="justify-content-between">
                  <Card.Title>Produzione</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted"
                    Toggletext="Periodo"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("settimana");
                        setPickerDateTS(undefined);
                      }}
                    >
                      Questa settimana
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("mese");
                        setPickerDateTS(undefined);
                      }}
                    >
                      Ultimo mese
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("anno");
                        setPickerDateTS(undefined);
                      }}
                    >
                      Anno corrente
                    </Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body>
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "d/m/Y" }}
                    onfunChange={(date) => setPickerDateTS(date)}
                    value={computedDateTS}
                  />
                  <AppmerceChart
                    data={data}
                    startDate={fmt(computedDateTS[0])}
                    endDate={fmt(computedDateTS[1])}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Card Produzione per Articolo */}
            <Col xl={6}>
              <Card className="custom-card h-100">
                <Card.Header className="justify-content-between">
                  <Card.Title>Log troncatrice esteso</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted"
                    Toggletext="Periodo"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoLog("settimana");
                        setPickerDateLog(undefined);
                      }}
                    >
                      Questa settimana
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoLog("mese");
                        setPickerDateLog(undefined);
                      }}
                    >
                      Ultimo mese
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoLog("anno");
                        setPickerDateLog(undefined);
                      }}
                    >
                      Anno corrente
                    </Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body>
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "d/m/Y" }}
                    onfunChange={(date) => setPickerDateLog(date)}
                    value={computedDateLog}
                  />
                  {/* <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(computedDateLog[0])}
                    endDate={fmt(computedDateLog[1])}
                  /> */}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col xl={6}>
              <AppmerceTable
                data={data}
                title="Produzione"
                fileExcel="APPMERCE-000"
                dateColumn="Data ord"
                tableHeaders={[
                  { title: "Num. ord.", column: "Nr.ord" },
                  { title: "Sez.", column: "Sez" },
                  {
                    title: "Rag. Soc.",
                    column: "Ragione sociale",
                    default: "Cliente generico",
                    bold: true,
                  },
                  { title: "Agente", column: "Des. Agente" },
                  { title: "Data ord.", column: "Data ord" },
                ]}
              />
            </Col>
            <Col xl={6}>
              <AppmerceTable
                data={data2}
                title="Log troncatrice esteso (dati grezzi)"
                fileExcel="TRONCATRICE_ESTESO"
                dateColumn="Timestamp"
                filterDate={computedDateLog}
                tableHeaders={[
                  { title: "Timestamp", column: "Timestamp" },
                  { title: "Nome comando", column: "CommandName" },
                  {
                    title: "Start or Stop",
                    column: "Start or Stop",
                    allowEmpty: true,
                  },
                  {
                    title: "Lavorazione",
                    column: "Lavorazione",
                    allowEmpty: true,
                  },
                  { title: "Tempo", column: "Tempo", allowEmpty: true },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
