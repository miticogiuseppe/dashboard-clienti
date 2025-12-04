//PAGINA2

"use client";

import MacchinaDashboard from "@/components/MacchinaDashboard";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import dayjs from "dayjs";
import { Fragment } from "react";
import { Card, Col, Row } from "react-bootstrap";

// DATI DI ESEMPIO
const Generale = {
  nome: "Generale",
  fileStorico: "/data/xxx_yyy.zip",
  fileAppmerce: "/api/xxx_yyy/appmerce",
  appmerce: {
    ordini: 0,
    produzione: 0,
    dataConsegna: "2025-12-15",
  },
};

// DATE UTILS
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

const fmt = (d) =>
  !d ? "" : typeof d === "string" ? d : dayjs(d).format("YYYY-MM-DD");

// COMPONENTE PRINCIPALE
export default function PaginaTostini() {
  return (
    <Fragment>
      <Seo title="Macchina - Tostini" />
      <Pageheader
        title="Macchine"
        currentpage="Tostini"
        activepage="Tostini"
        showActions={false}
      />

      {/* DASHBOARD MACCHINA */}
      <Row className="g-4 mb-4">
        <Col xxl={12}>
          <MacchinaDashboard {...Generale} />
        </Col>
      </Row>

      {/* GRAFICI SUPERIORI - 4 PLACEHOLDER */}
      <Row className="g-4 justify-content-center">
        {[
          "TS Azienda",
          "Produzione per Articolo",
          "Esempio Grafico A",
          "Esempio Grafico B",
        ].map((titolo, idx) => (
          <Col key={idx} xxl={6} xl={6} lg={12} className="d-flex">
            <Card className="custom-card h-100 shadow-sm rounded-3 w-100 text-center p-4 d-flex align-items-center justify-content-center">
              <div>
                <div
                  style={{
                    fontSize: "50px",
                    opacity: 0.25,
                    marginBottom: "10px",
                  }}
                >
                  📊
                </div>
                <h5 className="fw-semibold text-muted mb-1">{titolo}</h5>
                <p className="text-muted">Grafico vuoto di esempio</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* EVENTUALE ALTRO CONTENUTO */}
      {/* ...qui puoi lasciare MacchinaDashboard o altri elementi sotto */}
    </Fragment>
  );
}
