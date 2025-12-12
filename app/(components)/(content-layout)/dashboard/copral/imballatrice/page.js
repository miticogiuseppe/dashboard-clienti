"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { parseDates, orderSheet } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";

const imballatrice = {
  nome: "Imballatrice",
  fileStorico: "/api/download-resource?id=STORICO_IMBALLATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
  //fileImballatrice: "/api/download-resource?id=imballatrice_a",

  tenant: "Copral",
  appmerce: {
    ordini: 128,
    imballaggi: 2340,
    dataConsegna: "2025-10-27",
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

export default function PaginaImballatrice() {
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
      data = parseDates(data, ["Data ord"]);
      data = orderSheet(data, ["Data ord"], ["asc"]);

      setData(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=imballatrice_a&sheet=Foglio1"
      );
      const resp = await res.json();
      let data = resp.data;
      data = parseDates(data, ["Data"]);
      data = orderSheet(data, ["Data"], ["asc"]);

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

  // Stato per Produzione per Articolo
  const computedDateArt = useMemo(() => {
    if (pickerDateArt) return pickerDateArt;
    return calcolaRange(periodoArt);
  }, [pickerDateArt, periodoArt]);

  return (
    <>
      <Seo title="Macchina - Imballatrice" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Macchine"
            currentpage="Imballatrice"
            activepage="Imballatrice"
            showActions={false}
          />

          <Row>
            <Col>
              <MacchinaDashboard
                {...imballatrice}
                tenant={imballatrice.tenant}
              />
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
                  <Card.Title>Produzione per articolo</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted"
                    Toggletext="Periodo"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoArt("settimana");
                        setPickerDateArt(undefined);
                      }}
                    >
                      Questa settimana
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoArt("mese");
                        setPickerDateArt(undefined);
                      }}
                    >
                      Ultimo mese
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoArt("anno");
                        setPickerDateArt(undefined);
                      }}
                    >
                      Anno corrente
                    </Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body>
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "d/m/Y" }}
                    onfunChange={(date) => setPickerDateArt(date)}
                    value={computedDateArt}
                  />
                  <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(computedDateArt[0])}
                    endDate={fmt(computedDateArt[1])}
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
                title="Produzione per articolo"
                fileExcel="imballatrice_a"
                dateColumn="Data"
                tableHeaders={[
                  { title: "Numero", column: "Numero" },
                  { title: "Descrizione", column: "Descrizione" },
                  { title: "Data", column: "Data", bold: true },
                  { title: "Ora", column: "Ora" },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
