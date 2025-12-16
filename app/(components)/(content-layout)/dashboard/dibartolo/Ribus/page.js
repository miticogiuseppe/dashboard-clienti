"use client";

import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { Card, Col, Row } from "react-bootstrap";

import Seo from "@/shared/layouts-components/seo/seo";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import "dayjs/locale/it";
dayjs.locale("it");

import RibusChart from "@/components/RibusChart"; // Importiamo il componente Ribus specifico

// Simula la lettura del percorso del file Excel da una configurazione
const ribusData = {
  fileExcel: "/api/download-resource?id=Dibartolo_ribus",
};

export default function PaginaRibus() {
  const pathname = usePathname();

  // Estrai e normalizza il tenant (es. 'dibartolo')
  const rawTenant = pathname?.split("/")[2] || "";
  const tenant =
    rawTenant && rawTenant.length > 0
      ? rawTenant.charAt(0).toUpperCase() + rawTenant.slice(1)
      : "DefaultTenant";

  // Mappatura delle colonne Ribus.
  // 'dataOra' è la colonna usata internamente per parsing, filtro e ordinamento.
  const colonneRibus = {
    // Colonna principale per Data/Ora, Ordinamento e Filtro (deve esistere nel file)
    dataOra: "insert_datetime",

    // Mappatura per il rendering e l'elaborazione dei dati Ribus
    id: "id",
    insert_datetime: "insert_datetime",
    planned_date: "planned_date",
    work_id: "work_id",
    reference: "reference",
    lot: "lot",
    boxes_tot: "boxes_tot",
    pallet_tot: "pallet_tot",
    start_time: "start_time",
    end_time: "end_time",
    worked_box: "worked_box",
    worked_pallet: "worked_pallet",
    state: "state",

    // Nomi delle vecchie colonne non usati in Ribus, ma lasciati per struttura
    indice: "id",
    valorePeso: null,
    valoreRiservato: null,
    bilancia: null,
    descrizione: null,
  };

  return (
    <Fragment>
      <Seo title="Ribus Produzione" />
      <Pageheader
        title="Ribus Produzione"
        currentpage="Ribus"
        activepage="Ribus"
        showActions={false}
      />

      {/* GRAFICO E TABELLA RIBUS */}
      <Row className="g-4">
        <Col xl={12} md={12}>
          <Card className="custom-card shadow-sm rounded-3 h-100 border-0">
            <Card.Header className="py-3">
              <Card.Title className="mb-0 fw-semibold">Dati Ribus</Card.Title>
            </Card.Header>
            <Card.Body>
              <RibusChart
                file={ribusData.fileExcel}
                colonne={colonneRibus}
                tenant={tenant}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}
