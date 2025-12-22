"use client";

import AppmerceChart from "@/components/AppmerceChart";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkBreadcrumb from "@/shared/@spk-reusable-components/reusable-uielements/spk-breadcrumb";
import Seo from "@/shared/layouts-components/seo/seo";
import { calcolaRange, fmt } from "@/utils/dateUtils";
import dynamic from "next/dynamic";
import AppmerceTable from "@/components/AppmerceTable";

import {
  extractUniques,
  filterByRange,
  orderSheet,
  parseDates,
  sumByKey,
} from "@/utils/excelUtils";

import moment from "moment";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const Generale = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState([]);
  const [startDate, setStartDate] = useState(undefined);
  const [pickerDate, setPickerDate] = useState(undefined);

  const [lastUpdateDate, setLastUpdateDate] = useState("N/D");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState(0);

  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  const [recentOrders, setRecentOrders] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: "asc",
  });

  const handleDateChange = (date) => {
    setPickerDate(date);
    if (date?.[0] && date?.[1]) setStartDate({ ...date });
  };

  const toggleSort = (column) => {
    if (sortConfig.column === column) {
      setSortConfig({
        column,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ column, direction: "asc" });
    }
  };

  // Caricamento Excel
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=ANALISI&sheet=appmerce_db"
      );
      const json = await response.json();
      const data = json.data;

      setSheetData(data);
      setLastUpdateDate(moment(json.lwt).format("DD/MM/YYYY HH:mm"));

      const totalActiveCustomers = extractUniques(data, "Ragione sociale");
      setActiveCustomersCount(totalActiveCustomers.length);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtri e calcoli
  useEffect(() => {
    if (!sheetData) return;

    let filteredData = parseDates(sheetData, ["Data ordine"]);
    filteredData = orderSheet(filteredData, ["Data ordine"], ["asc"]);

    if (startDate?.[0] && startDate?.[1]) {
      filteredData = filterByRange(
        filteredData,
        "Data ordine",
        moment(startDate[0]),
        moment(startDate[1])
      );
    }

    const uniqueOrderNumbers = extractUniques(filteredData, "Nr. ord.");
    setPendingOrdersCount(uniqueOrderNumbers.length);

    const filteredDataExcludingImballaggi = filteredData.filter(
      (item) => item["Descrizione famiglia"] !== "IMBALLAGGI"
    );

    const counters = sumByKey(
      filteredDataExcludingImballaggi,
      "Descrizione famiglia",
      "Qta/kg da ev."
    );

    const topCounters = counters.sort((a, b) => b.count - a.count);
    setGraphSeries([
      {
        name: "Quantità",
        data: topCounters.map((c) => ({
          x: c["Descrizione famiglia"],
          y: Number(c.count),
        })),
      },
    ]);

    setGraphOptions({
      chart: { type: "bar", toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          borderRadius: 6,
          minBarHeight: 20,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: "category",
        labels: {
          rotate: -90,
          rotateAlways: true,
          trim: false,
          style: { fontSize: "11px", fontWeight: 600 },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => Math.round(val),
          style: { fontSize: "11px" },
        },
      },
      grid: { padding: { bottom: 40 }, strokeDashArray: 4 },
      tooltip: { enabled: true },
    });

    // Prepara dati tabella Ordini
    const tableData = filteredData.map((item) => ({
      "Nr. ord": item["Nr. ord."],
      "Ser.": item["Ser."],
      "Ragione sociale": item["Ragione sociale"] || "Cliente Generico",
      "Desc gr/sgru": item["Desc gr/sgru"],
      "Data cons. rich.": item["Data cons. rich."],
    }));
    setRecentOrders(tableData);
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
      </div>

      {/* CARDS */}
      <Row className="g-4 justify-content-center">
        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Ultimo Aggiornamento</h6>
            <h2 className="text-primary">{lastUpdateDate}</h2>
          </Card>
        </Col>

        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Clienti</h6>
            <h2 className="text-info">{activeCustomersCount}</h2>
          </Card>
        </Col>

        <Col xxl={4} xl={4} lg={4} md={6} sm={10} className="d-flex">
          <Card className="p-3 shadow-sm h-100 rounded-3 w-100 text-center">
            <h6 className="fw-semibold">Ordini</h6>
            <h2 className="text-success">{pendingOrdersCount}</h2>
          </Card>
        </Col>
      </Row>

      {/* ORDINI + ANALISI QUANTITÀ */}
      <Row className="g-4 mt-4">
        {/* Tabella Ordini */}
        <Col xl={8}>
          <AppmerceTable
            className="custom-card sibling-card"
            // enableSearch={true}
            data={recentOrders}
            title="Ordini"
            dateColumn="Data cons. rich."
            tableHeaders={[
              {
                title: "Nr.Ord",
                column: "Nr. ord",
                onClick: () => toggleSort("Nr. ord"),
              },
              {
                title: "Sez",
                column: "Ser.",
                onClick: () => toggleSort("Ser."),
              },
              {
                title: "Ragione sociale",
                column: "Ragione sociale",
                default: "Cliente Generico",
                bold: true,
                onClick: () => toggleSort("Ragione sociale"),
              },
              {
                title: "Descrizione",
                column: "Desc gr/sgru",
                onClick: () => toggleSort("Desc gr/sgru"),
              },
              {
                title: "Data consegna richiesta",
                column: "Data cons. rich.",
                onClick: () => toggleSort("Data cons. rich."),
              },
            ]}
          />
        </Col>

        {/* Analisi Quantità */}
        <Col xl={4}>
          <Card className="custom-card sibling-card">
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
