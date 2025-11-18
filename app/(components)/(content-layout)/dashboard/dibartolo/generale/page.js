"use client";
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);
import moment from "moment";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Dropdown, Row } from "react-bootstrap";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkCountrycard from "@/shared/@spk-reusable-components/reusable-dashboards/spk-countrycard";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkBreadcrumb from "@/shared/@spk-reusable-components/reusable-uielements/spk-breadcrumb";
import SpkButton from "@/shared/@spk-reusable-components/reusable-uielements/spk-button";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import {
  Cardsdata,
  Countrydata,
  Recentorders,
  Staticoptions,
  Staticseries,
} from "@/shared/data/dashboard/salesdata";
import Seo from "@/shared/layouts-components/seo/seo";
import {
  extractValues,
  filterByRange,
  filterByWeek,
  filterSheet,
  loadSheet,
  orderSheet,
  parseDates,
  sheetCount,
  sumByKey,
} from "@/utils/excelUtils";
import { createOptions, createSeries } from "@/utils/graphUtils";
import dayjs from "dayjs";
import AppmerceChart from "@/components/AppmerceChart";

// Utility per calcolare range date
const calcolaRange = (periodo) => {
  const oggi = dayjs();
  const inizio = {
    settimana: oggi.subtract(7, "day"),
    mese: oggi.subtract(1, "month"),
    anno: oggi.startOf("year"),
  }[periodo];
  return {
    startDate: inizio.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

// Utility per formattare date
const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
};

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
    if (date && date[0] && date[1]) {
      setStartDate({ ...date });
    }
  };

  const [data, allData] = useState(Recentorders);
  const handleRemove = (id) => {
    const list = data.filter((idx) => idx.id !== id);
    allData(list);
  };

  useEffect(() => {
    (async () => {
      const response = await fetch("/data/Analisi.xlsx");
      const blob = await response.blob();

      let jsonSheet = await loadSheet(blob, "appmerce_db");
      setSheetData(jsonSheet);

      let products = extractValues(jsonSheet, "Descrizione famiglia");
      setProducts(products);
    })();
  }, [setSheetData]);

  useEffect(() => {
    if (!sheetData) return;

    let jsonSheet = sheetData;

    // Parse delle date
    jsonSheet = parseDates(jsonSheet, ["Data ordine"]);
    jsonSheet = orderSheet(jsonSheet, ["Data ordine"], ["asc"]);

    // Filtro per intervallo di date
    if (startDate && startDate[0] && startDate[1]) {
      jsonSheet = filterByRange(
        jsonSheet,
        "Data ordine",
        moment(startDate[0]),
        moment(startDate[1])
      );
    } else {
      jsonSheet = filterByWeek(jsonSheet, "Data ordine", moment(), 2);
    }

    // Filtro per famiglia selezionata
    if (selectedProduct) {
      jsonSheet = filterSheet(
        jsonSheet,
        "Descrizione famiglia",
        selectedProduct
      );
    }

    // Somma quantità per articolo
    const counters = sumByKey(jsonSheet, "Articolo", "Qta/kg da ev.");

    // Ordina e limita (top 20 articoli)
    const topCounters = counters.sort((a, b) => b.count - a.count).slice(0, 20);

    // Prepara serie ApexCharts
    const series = [
      {
        name: "Quantità",
        data: topCounters.map((c) => ({
          x: c.Articolo,
          y: Number(c.count),
        })),
      },
    ];

    // Opzioni grafico
    const options = {
      chart: { type: "bar" },
      dataLabels: { enabled: true },
      xaxis: {
        // categorie prese direttamente da `x` in data
      },
    };

    setGraphSeries(series);
    setGraphOptions(options);
  }, [sheetData, selectedProduct, startDate]);

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
      <Seo title="Dibartolo Dashboard" />

      {/* <!-- Start::page-header --> */}
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <SpkBreadcrumb Customclass="mb-1">
            <li className="breadcrumb-item">
              <Link scroll={false} href="#!">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Generale
            </li>
          </SpkBreadcrumb>
          <h1 className="page-title fw-medium fs-18 mb-0">Generale</h1>
        </div>
        <div className="sc-container">
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-text bg-white border">
                {" "}
                <i className="ri-calendar-line" />{" "}
              </div>
              <SpkFlatpickr
                inputClass="form-control"
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={handleDateChange}
                value={pickerDate}
                placeholder={["2016-10-10", "2016-10-20"]}
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
          <SpkDropdown
            Toggletext="Group By"
            Togglevariant="white"
            Customclass="inline-block"
          >
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
            <i className="ri-filter-3-line align-middle me-1 lh-1" /> Filter
          </SpkButton>
          <SpkButton Buttonvariant="primary" Customclass="me-0">
            <i className="ri-share-forward-line me-1" /> Share
          </SpkButton>
        </div>
      </div>
      {/* <!-- End::page-header --> */}

      {/* <!-- Start:: row-1 --> */}
      <Row>
        <Col xl={8}>
          <Row>
            <Col xxl={5} xl={6} key={Math.random()}>
              <Spkcardscomponent
                cardClass="overflow-hidden main-content-card"
                headingClass="d-block mb-1"
                mainClass="d-flex align-items-start justify-content-between mb-2"
                Icon={true}
                iconClass="ti ti-shopping-cart"
                card={{
                  id: 1,
                  title: "Total Products",
                  count: productCount,
                  iconClass: "ti ti-shopping-cart",
                  backgroundColor: "primary",
                  color: "success",
                }}
                badgeClass="md rounded-pill"
                dataClass="mb-0"
              />
            </Col>
            {Cardsdata.filter(
              (card) =>
                card.title !== "Total Products" && card.title !== "Total Sales"
            ).map((idx) => (
              <Col xxl={3} xl={6} key={Math.random()}>
                <Spkcardscomponent
                  cardClass="overflow-hidden main-content-card"
                  headingClass="d-block mb-1"
                  mainClass="d-flex align-items-start justify-content-between mb-2"
                  Icon={true}
                  iconClass={idx.iconClass}
                  card={idx}
                  badgeClass="md rounded-pill"
                  dataClass="mb-0"
                />
              </Col>
            ))}
            <Col xxl={8} xl={6}>
              <Card className="custom-card h-100">
                <Card.Header className="justify-content-between">
                  <Card.Title>TS Azienda</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted"
                    Toggletext="Periodo"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("settimana");
                        setPickerDateTS([null, null]);
                      }}
                    >
                      Questa settimana
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("mese");
                        setPickerDateTS([null, null]);
                      }}
                    >
                      Ultimo mese
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setPeriodoTS("anno");
                        setPickerDateTS([null, null]);
                      }}
                    >
                      Anno corrente
                    </Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body>
                  <SpkFlatpickr
                    options={{ mode: "range", dateFormat: "Y-m-d" }}
                    onfunChange={(date) => setPickerDateTS(date)}
                    value={pickerDateTS}
                  />
                  <p className="text-muted mb-2">
                    Visualizzazione: ({fmt(pickerDateTS?.[0]) || startDateTS} →{" "}
                    {fmt(pickerDateTS?.[1]) || endDateTS})
                  </p>
                  <AppmerceChart
                    title="TS Azienda"
                    startDate={fmt(pickerDateTS?.[0]) || startDateTS}
                    endDate={fmt(pickerDateTS?.[1]) || endDateTS}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xl={4}></Col>
      </Row>
      {/* <!-- End:: row-1 --> */}
    </Fragment>
  );
};

export default Generale;
