"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { calcolaRange, fmt } from "@/utils/dateUtils";
import { orderSheet, parseDates } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { type } from "os";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

const tostini = {
  nome: "Tostini",
  fileStorico: "/api/download-resource?id=DATI_TOSTINI",
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
              <MacchinaDashboard {...tostini} tenant={tostini.tenant} />
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
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted border"
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

                <Card.Body className="pt-2">
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "d/m/Y" }}
                    onfunChange={(date) => setPickerDateTS(date)}
                    value={computedDateTS}
                  />

                  {/* CHART */}
                  <div className="mt-3">
                    <AppmerceChart
                      data={data}
                      startDate={fmt(computedDateTS[0])}
                      endDate={fmt(computedDateTS[1])}
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
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted border"
                    Toggletext="Periodo"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoArt("settimana");
                        setPickerDateArt([undefined]);
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

                <Card.Body className="pt-2">
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "d/m/Y" }}
                    onfunChange={(date) => setPickerDateArt(date)}
                    value={computedDateArt}
                  />

                  <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(computedDateArt[0])}
                    endDate={fmt(computedDateArt[1])}
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
