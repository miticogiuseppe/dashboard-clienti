"use client";

import { Fragment, useState } from "react";
import dayjs from "dayjs";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";

import ConfezionatriceChart from "@/components/ConfezionatriceChart";

//import filedb from "@/filedb.json";
import * as XLSX from "xlsx";

const confezionatriceData = {
  fileExcel: "/api/download-resource?id=Dibartolo_Confezionatrice", // legge il percorso dal JSON
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

export default function PaginaConfezionatrice() {
  const [pickerDate, setPickerDate] = useState([null, null]);
  const [periodo, setPeriodo] = useState("mese");
  const { startDate, endDate } = calcolaRange(periodo);

  return (
    <Fragment>
      <Seo title="Confezionatrice" />
      <Pageheader
        title="Confezionatrice"
        currentpage="Confezionatrice"
        activepage="Confezionatrice"
        showActions={false}
      />

      {/* FILTRO DATE */}
      <Row className="g-4 mb-4">
        <Col xl={6}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="d-flex justify-content-between align-items-center py-3">
              <Card.Title className="mb-0 fw-semibold">
                Seleziona Date
              </Card.Title>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="btn btn-sm btn-light text-muted border"
                Toggletext="Periodo"
              >
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("settimana");
                    setPickerDate([null, null]);
                  }}
                >
                  Questa settimana
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("mese");
                    setPickerDate([null, null]);
                  }}
                >
                  Ultimo mese
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setPeriodo("anno");
                    setPickerDate([null, null]);
                  }}
                >
                  Anno corrente
                </Dropdown.Item>
              </SpkDropdown>
            </Card.Header>
            <Card.Body>
              <SpkFlatpickr
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={(date) => setPickerDate(date)}
                value={pickerDate}
              />
              <p className="text-muted mt-2 mb-3 small">
                ({fmt(pickerDate?.[0]) || startDate} →{" "}
                {fmt(pickerDate?.[1]) || endDate})
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GRAFICI AFFIANCATI: PESO SCARICATO VS RISERVATO */}
      <Row className="g-4">
        <Col xl={6} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Peso Scaricato per Bilancia
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <ConfezionatriceChart
                file={confezionatriceData.fileExcel}
                colonne={{
                  indice: "Indice",
                  dataOra: "Data e Ora",
                  valore: "Peso Scaricato",
                  bilancia: "Bilancia",
                  descrizione: "Descrizione",
                }}
                startDate={fmt(pickerDate?.[0]) || startDate}
                endDate={fmt(pickerDate?.[1]) || endDate}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">
                Quantità Riservata per Bilancia
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <ConfezionatriceChart
                file={confezionatriceData.fileExcel}
                colonne={{
                  indice: "Indice",
                  dataOra: "Data e Ora",
                  valore: "Riservato",
                  bilancia: "Bilancia",
                  descrizione: "Descrizione",
                }}
                startDate={fmt(pickerDate?.[0]) || startDate}
                endDate={fmt(pickerDate?.[1]) || endDate}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
