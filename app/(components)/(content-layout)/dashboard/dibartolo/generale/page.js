"use client";

import AppmerceChart from "@/components/AppmerceChart";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkBreadcrumb from "@/shared/@spk-reusable-components/reusable-uielements/spk-breadcrumb";
import SpkButton from "@/shared/@spk-reusable-components/reusable-uielements/spk-button";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Seo from "@/shared/layouts-components/seo/seo";
import { calcolaRange, fmt } from "@/utils/dateUtils";
import dynamic from "next/dynamic";
import { formatDateTime } from "@/utils/format";

import {
  extractUniques,
  filterByRange,
  filterByValue,
  filterByWeek,
  loadSheet,
  orderSheet,
  parseDates,
  sumByKey,
} from "@/utils/excelUtils";

import moment from "moment";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Dropdown, Row } from "react-bootstrap";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

// COMPONENTE
const Generale = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState(undefined);
  const [pickerDate, setPickerDate] = useState(undefined);

  // STATI PER LE CARD
  const [lastUpdateDate, setLastUpdateDate] = useState("N/D");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState(0);

  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  const handleDateChange = (date) => {
    setPickerDate(date);
    if (date?.[0] && date?.[1]) setStartDate({ ...date });
  };

  // Caricamento Excel e calcolo del totale storico dei Clienti Attivi
  useEffect(() => {
    (async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=appmerce_db"
      );
      const json = await response.json();
      let data = json.data;

      setSheetData(data);
      setLastUpdateDate(new Date(json.lwt));

      let products = extractUniques(data, "Descrizione famiglia");
      setProducts(products);

      // ✅ CALCOLO CLIENTI ATTIVI STORICI:
      // Viene eseguito solo qui, su tutti i dati 'data', per un conteggio univoco fisso
      const totalActiveCustomers = extractUniques(data, "Ragione sociale");
      setActiveCustomersCount(totalActiveCustomers.length);
    })();
  }, []);

  // 🔄 LOGICA PER FILTRARE SOLO GLI ORDINI E IL GRAFICO (dipende da data)
  useEffect(() => {
    if (!sheetData) return;

    let filteredData = parseDates(sheetData, ["Data ordine"]);
    filteredData = orderSheet(filteredData, ["Data ordine"], ["asc"]);

    // 1. FILTRAGGIO PER DATA
    if (startDate?.[0] && startDate?.[1]) {
      // Se è selezionato un intervallo di date, filtra
      filteredData = filterByRange(
        filteredData,
        "Data ordine",
        moment(startDate[0]),
        moment(startDate[1])
      );
    }

    // 2. CALCOLO DEGLI ORDINI (Numero di Ordini Unici nel periodo/storico)
    const uniqueOrderNumbers = extractUniques(filteredData, "Nr. ord.");
    setPendingOrdersCount(uniqueOrderNumbers.length); // Conteggio degli ordini unici

    // 3. CALCOLO SERIE PER GRAFICO ANALISI QUANTITÀ
    const counters = sumByKey(filteredData, "Articolo", "Qta/kg da ev.");
    const topCounters = counters.sort((a, b) => b.count - a.count).slice(0, 15);

    setGraphSeries([
      {
        name: "Quantità",
        data: topCounters.map((c) => ({ x: c.Articolo, y: Number(c.count) })),
      },
    ]);

    setGraphOptions({
      chart: { type: "bar" },
      dataLabels: { enabled: true },
      xaxis: {
        type: "category",
        labels: {
          rotate: -45, // Rotazione diagonale fissa
          trim: false, //Disabilita il troncamento
          style: {
            fontSize: "10px", // Una dimensione di base
          },
        },
      },
      // Regolazione padding per evitare che il testo ruotato venga tagliato
      grid: {
        padding: {
          bottom: 20, // Aumenta lo spazio inferiore se le etichette sono lunghe
        },
      },
    });
  }, [sheetData, startDate]);

  return (
    <Fragment>
      <Seo title="Dashboard Generale" />

      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2 mb-4">
        <div>
          <SpkBreadcrumb Customclass="mb-1">
            <li className="breadcrumb-item">
              <Link href="#">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Generale</li>
          </SpkBreadcrumb>
          <h1 className="page-title fw-medium fs-18 mb-0">Generale</h1>
        </div>

        {/* FILTRI */}
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="form-group m-0">
            <div className="input-group">
              <div className="input-group-text bg-white border">
                <i className="ri-calendar-line" />
              </div>
              <SpkFlatpickr
                inputClass="form-control"
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={handleDateChange}
                value={pickerDate}
              />
              <button
                type="button"
                className="btn btn-light ms-2"
                onClick={() => {
                  setStartDate(undefined);
                  setPickerDate(undefined);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS CENTRATE E DISTANZIATE */}
      <Row className="g-4 justify-content-center">
        {/* Card 1: Ultimo Aggiornamento */}
        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Ultimo Aggiornamento</h6>
            <h2 className="text-primary">{formatDateTime(lastUpdateDate)}</h2>
          </Card>
        </Col>

        {/* Card 2: Clienti Attivi (Mostra il totale storico univoco) */}
        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Clienti</h6>
            <h2 className="text-info">{activeCustomersCount}</h2>
          </Card>
        </Col>

        {/* Card 3: Ordini (Numero di ordini unici filtrati per data) */}
        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Ordini</h6>
            <h2 className="text-success">{pendingOrdersCount}</h2>
          </Card>
        </Col>
      </Row>

      {/* GRAFICI AFFIANCATI */}
      <Row className="g-4 mt-4">
        {/* TS AZIENDA */}
        <Col xl={8}>
          <Card className="custom-card h-100 shadow-sm rounded-3 p-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title>TS Azienda</Card.Title>
            </Card.Header>

            <Card.Body>
              <AppmerceChart
                title="TS Azienda"
                startDate={fmt(pickerDateTS?.[0]) || startDateTS}
                endDate={fmt(pickerDateTS?.[1]) || endDateTS}
                dateCol="Data ordine"
                qtyCol="Qta/kg da ev."
              />
            </Card.Body>
          </Card>
        </Col>

        {/* NUOVO GRAFICO LATERALE (Analisi Quantità) */}
        <Col xl={4}>
          <Card className="custom-card h-100 shadow-sm rounded-3 p-3">
            <Card.Header>
              <Card.Title>Analisi Quantità</Card.Title>
            </Card.Header>

            <Card.Body>
              {graphSeries.length > 0 ? (
                <Spkapexcharts
                  chartOptions={graphOptions}
                  chartSeries={graphSeries}
                  type="bar"
                  height={350}
                />
              ) : (
                <p className="text-muted text-center">
                  Nessun dato disponibile
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Generale;
