"use client";

import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { Card, Col, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import "dayjs/locale/it"; // importiamo la localizzazione italiana
dayjs.locale("it"); // impostiamo la localizzazione italiana

import ConfezionatriceChart from "@/components/ConfezionatriceChart";

//import filedb from "@/filedb.json";
//import * as XLSX from "xlsx";

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
    startDate: inizio.format("DD/MM/YYYY"),
    endDate: oggi.format("DD/MM/YYYY"),
  };
};
const fmt = (d) => {
  if (!d) return "";

  let dataDayjs;

  if (typeof d === "string") {
    // 1. TENTATIVO DI PARSING FORZATO con formato italiano DD/MM/YYYY (per Excel)
    dataDayjs = dayjs(d, "DD/MM/YYYY");

    // Se il primo tentativo fallisce o se la data non è valida, prova a far indovinare dayjs
    // (potrebbe essere necessario se l'output di Excel non è una stringa standard, ma un numero seriale)
    if (!dataDayjs.isValid()) {
      dataDayjs = dayjs(d); // Tenta il parsing senza formato esplicito
    }
  } else {
    // 2. Input non stringa (oggetto Date, dayjs, etc.)
    dataDayjs = dayjs(d);
  }

  // 3. Restituisci la data formattata in formato italiano, solo se è valida
  return dataDayjs.isValid()
    ? dataDayjs.format("DD/MM/YYYY")
    : "Data non valida";
};
export default function PaginaConfezionatrice() {
  const [pickerDate, setPickerDate] = useState([null, null]);
  const [periodo, setPeriodo] = useState("mese");
  const pathname = usePathname();
  const { startDate, endDate } = calcolaRange(periodo);
  // estrai e normalizza il tenant dalla pathname: es 'dibartolo' -> 'Dibartolo'
  const rawTenant = pathname?.split("/")[2] || "";
  const tenant =
    rawTenant && rawTenant.length > 0
      ? rawTenant.charAt(0).toUpperCase() + rawTenant.slice(1)
      : "Dibartolo";
  console.debug(
    "PaginaConfezionatrice - pathname:",
    pathname,
    "tenant:",
    tenant
  );

  return (
    <Fragment>
      <Seo title="Confezionatrice" />
      <Pageheader
        title="Confezionatrice"
        currentpage="Confezionatrice"
        activepage="Confezionatrice"
        showActions={false}
      />

      {/* GRAFICO UNICO: PESO SCARICATO E RISERVATO PER BILANCIA */}
      <Row className="g-4">
        <Col xl={12} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">Produzione</Card.Title>
            </Card.Header>
            <Card.Body>
              <ConfezionatriceChart
                file={confezionatriceData.fileExcel}
                colonne={{
                  indice: "Indice",
                  dataOra: "Data e Ora",
                  valorePeso: "Peso Scaricato",
                  valoreRiservato: "Riservato",
                  bilancia: "Bilancia",
                  descrizione: "Descrizione",
                }}
                tenant={tenant}
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
