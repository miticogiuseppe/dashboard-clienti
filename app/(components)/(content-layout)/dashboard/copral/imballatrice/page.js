"use client";
import AppmerceChart from "@/components/AppmerceChart";
import AppmerceChartByArticolo from "@/components/AppmerceChartByArticolo";
import AppmerceTable from "@/components/AppmerceTable";
import CustomDateComponent from "@/components/CustomDateComponent";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import PeriodDropdown from "@/components/PeriodDropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { fmt } from "@/utils/dateUtils";
import { orderSheet, parseDates } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useTranslations } from "next-intl";

const resources = {
  fileStorico: "/api/download-resource?id=STORICO_IMBALLATRICE",
  fileAppmerce: "/api/download-resource?id=APPMERCE-000",
};

export default function PaginaImballatrice() {
  const [pickerDateTS, setPickerDateTS] = useState(undefined);
  const [periodoTS, setPeriodoTS] = useState("mese");

  const [pickerDateArt, setPickerDateArt] = useState(undefined);
  const [periodoArt, setPeriodoArt] = useState("mese");

  const [data, setData] = useState(undefined);
  const [data2, setData2] = useState(undefined);

  const t = useTranslations("Graph");

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
                  <Card.Title>Produzione per articolo</Card.Title>
                  <PeriodDropdown
                    onChange={(period) => {
                      setPeriodoArt(period);
                      setPickerDateArt(undefined);
                    }}
                  />
                </Card.Header>
                <Card.Body>
                  <CustomDateComponent
                    onfunChange={(date) => setPickerDateArt(date)}
                    value={pickerDateArt}
                    period={periodoArt}
                  />
                  <AppmerceChartByArticolo
                    data={data2}
                    startDate={fmt(pickerDateArt, periodoArt, 0)}
                    endDate={fmt(pickerDateArt, periodoArt, 1)}
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
                  { title: "Data ord.", column: "Data ord" },
                  {
                    title: "N. ord.",
                    column: "Nr.ord",
                  },
                  { title: "Sez.", column: "Sez" },
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
                  { title: "Qta da ev.", column: "Qta da ev" },
                  { title: "Qta ev.", column: "QTAev II UM" },
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
