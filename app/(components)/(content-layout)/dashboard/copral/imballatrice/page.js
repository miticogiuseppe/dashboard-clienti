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
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

const imballatrice = {
  nome: "Imballatrice",
  fileStorico: "/api/download-resource?id=STORICO_IMBALLATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",

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
  return {
    startDate: inizio.format("YYYY-MM-DD"),
    endDate: oggi.format("YYYY-MM-DD"),
  };
};

// Utility per formattare sempre le date
const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
};

export default function PaginaImballatrice() {
  // Stato per TS Azienda
  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  // Stato per Produzione per Articolo
  const [pickerDateArt, setPickerDateArt] = useState([null, null]);
  const [periodoArt, setPeriodoArt] = useState("mese");
  const { startDate: startDateArt, endDate: endDateArt } =
    calcolaRange(periodoArt);

  const [recentOrders, setRecentOrders] = useState([]);
  const parseDate = (dateValue) => {
    if (!dateValue || dateValue === 0) return new Date(0);

    if (typeof dateValue === "number" && dateValue > 40000) {
      const excelEpoch = new Date("1899-12-30");
      return new Date(excelEpoch.getTime() + dateValue * 86400000);
    }

    const str = String(dateValue).trim();
    if (str.includes("-")) return new Date(str);

    const parts = str.split("/");
    if (parts.length === 3)
      return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);

    return new Date(0);
  };
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1"
      );
      const resp = await res.json();
      const data = resp.data;
      const sorted = data
        // .filter((order) => order["Macchina"] === "Imballatrice") // opzionale se vuoi filtrare solo Imballatrice
        .sort((a, b) => parseDate(b["Data ord"]) - parseDate(a["Data ord"]));
      setRecentOrders(sorted.slice(0, 7));
    }

    fetchData();
  }, []);

  return (
    <Fragment>
      <Seo title="Macchina - Imballatrice" />
      <Pageheader
        title="Macchine"
        currentpage="Imballatrice"
        activepage="Imballatrice"
        showActions={false}
      />

      <Row>
        <Col xxl={12}>
          <MacchinaDashboard {...imballatrice} tenant={imballatrice.tenant} />
        </Col>
      </Row>

      {/* Card TS Azienda */}
      <Row className="mt-4">
        <Col xl={6}>
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
                ({fmt(pickerDateTS?.[0]) || startDateTS} →{" "}
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

        {/* Card Produzione per Articolo */}
        <Col xl={6}>
          <Card className="custom-card h-100">
            <Card.Header className="justify-content-between">
              <Card.Title>Produzione per Articolo</Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted"
                Toggletext="Periodo"
              >
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("settimana");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Questa settimana
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("mese");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Ultimo mese
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodoArt("anno");
                    setPickerDateArt([null, null]);
                  }}
                >
                  Anno corrente
                </Dropdown.Item>
              </SpkDropdown>
            </Card.Header>
            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDateArt(date)}
                value={pickerDateArt}
              />
              <p className="text-muted mb-2">
                ({fmt(pickerDateArt?.[0]) || startDateArt} →{" "}
                {fmt(pickerDateArt?.[1]) || endDateArt})
              </p>
              <AppmerceChartByArticolo
                file={imballatrice.fileAppmerce}
                startDate={fmt(pickerDateArt?.[0]) || startDateArt}
                endDate={fmt(pickerDateArt?.[1]) || endDateArt}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col xl={6}>
          <AppmerceTable
            recentOrders={recentOrders}
            parseDate={parseDate}
            title={`Appmerce`}
            fileExcel={imballatrice.fileAppmerce}
            tenant={imballatrice.tenant}
          />
        </Col>
      </Row>
    </Fragment>
  );
}
