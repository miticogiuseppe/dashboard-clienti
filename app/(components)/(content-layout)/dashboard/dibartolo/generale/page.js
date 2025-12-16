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
  const [selectedProduct, setSelectedProduct] = useState(undefined);
  const [startDate, setStartDate] = useState(undefined);
  const [pickerDate, setPickerDate] = useState(undefined);
  const [productCount, setProductCount] = useState(0);

  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  const handleDateChange = (date) => {
    setPickerDate(date);
    if (date?.[0] && date?.[1]) setStartDate({ ...date });
  };

  // Caricamento Excel
  useEffect(() => {
    (async () => {
      const response = await fetch("/data/Analisi.xlsx");
      const blob = await response.blob();

      let jsonSheet = await loadSheet(blob, "appmerce_db");
      setSheetData(jsonSheet);

      let products = extractUniques(jsonSheet, "Descrizione famiglia");
      setProducts(products);
    })();
  }, []);

  //Logica filtro + grafico
  useEffect(() => {
    if (!sheetData) return;

    let jsonSheet = parseDates(sheetData, ["Data ordine"]);
    jsonSheet = orderSheet(jsonSheet, ["Data ordine"], ["asc"]);

    if (startDate?.[0] && startDate?.[1]) {
      jsonSheet = filterByRange(
        jsonSheet,
        "Data ordine",
        moment(startDate[0]),
        moment(startDate[1])
      );
    } else {
      jsonSheet = filterByWeek(jsonSheet, "Data ordine", moment(), 2);
    }

    if (selectedProduct) {
      jsonSheet = filterByValue(
        jsonSheet,
        "Descrizione famiglia",
        selectedProduct
      );
    }

    const counters = sumByKey(jsonSheet, "Articolo", "Qta/kg da ev.");
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
      xaxis: {},
    });
  }, [sheetData, selectedProduct, startDate]);

  // Conta prodotti totali
  useEffect(() => {
    if (!sheetData) return;
    const total = sheetData.reduce((acc, row) => {
      const value = parseFloat(row["Qta/kg da ev."]);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
    setProductCount(Math.round(total));
  }, [sheetData]);

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

          <SpkDropdown Toggletext="Group By" Togglevariant="white">
            <Dropdown.Item onClick={() => setSelectedProduct(undefined)}>
              --- Tutti i prodotti ---
            </Dropdown.Item>
            {products.map((x) => (
              <Dropdown.Item key={x} onClick={() => setSelectedProduct(x)}>
                {x}
              </Dropdown.Item>
            ))}
          </SpkDropdown>

          <SpkButton Buttonvariant="white">
            <i className="ri-filter-3-line me-1" /> Filter
          </SpkButton>

          <SpkButton Buttonvariant="primary">
            <i className="ri-share-forward-line me-1" /> Share
          </SpkButton>
        </div>
      </div>

      {/* CARDS CENTRATE E DISTANZIATE */}
      <Row className="g-4 justify-content-center">
        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <div className="w-100 p-3 shadow-sm rounded-3 white text-center">
            <Spkcardscomponent
              cardClass="overflow-hidden main-content-card h-100"
              headingClass="d-block mb-1 fw-semibold"
              mainClass="d-flex align-items-start justify-content-between mb-2"
              Icon={true}
              iconClass="ti ti-shopping-cart"
              card={{ id: 1, title: "Total Products", count: productCount }}
              badgeClass="md rounded-pill"
              dataClass="mb-0"
            />
          </div>
        </Col>

        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Ordini Evasi</h6>
            <h2 className="text-success">0</h2>
          </Card>
        </Col>

        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Clienti Attivi</h6>
            <h2 className="text-info">0</h2>
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

        {/*  NUOVO GRAFICO LATERALE */}
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
