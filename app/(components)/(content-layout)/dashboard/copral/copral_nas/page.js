"use client";
import React, { Fragment, useState, useEffect } from "react";
import { Col, Row, Card } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Dropdown from "react-bootstrap/Dropdown";
import dayjs from "dayjs";

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

const fmt = (d) => {
  if (!d) return "";
  return typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");
};

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

export default function PaginaCopralNas() {
  const [pickerDateTS, setPickerDateTS] = useState([null, null]);
  const [periodoTS, setPeriodoTS] = useState("mese");
  const { startDate: startDateTS, endDate: endDateTS } =
    calcolaRange(periodoTS);

  const [pickerDateArt, setPickerDateArt] = useState([null, null]);
  const [periodoArt, setPeriodoArt] = useState("mese");
  const { startDate: startDateArt, endDate: endDateArt } =
    calcolaRange(periodoArt);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
        { headers: { "x-tenant": troncatrice.tenant } }
      );
      const data = await res.json();
      const sorted = data.sort(
        (a, b) => parseDate(b["Data ord"]) - parseDate(a["Data ord"])
      );
      setRecentOrders(sorted.slice(0, 7));
    }

    fetchData();
  }, []);

  return (
    <Fragment>
      <Seo title="Macchina - Troncatrice (Mecal)" />
      <Pageheader
        title="Macchine"
        currentpage="Troncatrice (Mecal)"
        activepage="Troncatrice (Mecal)"
        showActions={false}
      />

      <Row>
        <Col xxl={12}>
          <MacchinaDashboard {...troncatrice} tenant={troncatrice.tenant} />
        </Col>
      </Row>

      {/* TS Azienda */}
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

        {/* Produzione per Articolo */}
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
                file={troncatrice.fileAppmerce}
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
            fileExcel={troncatrice.fileAppmerce}
            tenant={troncatrice.tenant}
          />
        </Col>
      </Row>
    </Fragment>
  );
}
