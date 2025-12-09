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
export default function PaginaTest() {
  // dati demo per la card migliorata (sostituisci con i tuoi dati reali quando vuoi)
  const storicoDemo = {
    total: 128, // valore grande
    pct: 72, // percentuale completati
    series: [4, 7, 5, 9, 8, 10, 6, 11, 9, 12], // per sparkline
    breakdown: [
      { label: "Completati", value: 92, color: "#36A2EB" },
      { label: "In lavorazione", value: 25, color: "#FFCE56" },
      { label: "Annullati", value: 11, color: "#FF6384" },
    ],
  };

  // crea stringa punti per la sparkline (normalizzazione semplice su altezza 30)
  const maxVal = Math.max(...storicoDemo.series, 1);
  const sparkPoints = storicoDemo.series
    .map((v, i) => {
      const x = (i / (storicoDemo.series.length - 1)) * 100;
      const y = 30 - (v / maxVal) * 28; // margine superiore/inferiore
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Fragment>
      <Seo title="Dashboard - Base" />
      <Pageheader
        title="Dashboard "
        currentpage="Dashboard"
        activepage="Dashboard"
        showActions={false}
      />

      {/* DASHBOARD MACCHINA */}
      <Row className="g-4 mb-4">
        <Col xxl={12}>
          <MacchinaDashboard {...Generale} />
        </Col>
      </Row>

      {/* GRAFICI SUPERIORI - SOLO IL PRIMO È GRAFICAMENTE MIGLIORATO */}
      <Row className="g-4 justify-content-center">
        {[
          "TS Azienda", // <-- questo è il primo: lo miglioriamo visualmente
          "Produzione per Articolo",
          "Esempio Grafico A",
          "Esempio Grafico B",
        ].map((titolo, idx) => (
          <Col key={idx} xxl={6} xl={6} lg={12} className="d-flex">
            <Card className="custom-card h-100 shadow-sm rounded-3 w-100 text-center p-4 d-flex">
              {idx === 0 ? (
                // CONTENUTO MIGLIORATO SOLO PER IL PRIMO CARD
                <div style={{ width: "100%" }} className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-semibold text-muted mb-0">{titolo}</h5>
                    <small className="text-muted">Storico</small>
                  </div>

                  {/* sparkline + numero */}
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ gap: "16px" }}
                  >
                    {/* sparkline box */}
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <svg
                        viewBox="0 0 100 30"
                        preserveAspectRatio="none"
                        style={{ width: "100%", height: 48 }}
                        aria-hidden="true"
                      >
                        <polyline
                          points={sparkPoints}
                          fill="none"
                          stroke="#36A2EB"
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                        <polyline
                          points={sparkPoints}
                          fill="none"
                          stroke="#36A2EB"
                          strokeWidth="6"
                          strokeOpacity="0.06"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">Ultimi 10 giorni</small>
                        <small className="text-muted">{fmt(new Date())}</small>
                      </div>
                    </div>

                    {/* numero grande */}
                    <div
                      style={{
                        width: 120,
                        textAlign: "center",
                        paddingLeft: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 34,
                          fontWeight: 700,
                          color: "#0d6efd",
                        }}
                      >
                        {storicoDemo.total}
                      </div>
                      <div style={{ fontSize: 13, color: "#6c757d" }}>
                        Totale ordini
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: "4px solid rgba(54,162,235,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#36A2EB",
                            fontSize: 12,
                          }}
                        >
                          {storicoDemo.pct}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* legenda / breakdown */}
                  <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                    {storicoDemo.breakdown.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 20,
                          background: "rgba(0,0,0,0.03)",
                          minWidth: 140,
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: 3,
                              background: b.color,
                            }}
                          />
                          <small style={{ fontSize: 13, color: "#495057" }}>
                            {b.label}
                          </small>
                        </div>
                        <div>
                          <strong style={{ fontSize: 13 }}>{b.value}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // contenuto originale semplificato per gli altri grafici (non toccare)
                <div
                  className="d-flex align-items-center justify-content-center flex-column"
                  style={{ width: "100%" }}
                >
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
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* EVENTUALE ALTRO CONTENUTO */}
      {/* ...qui puoi lasciare MacchinaDashboard o altri elementi sotto */}
    </Fragment>
  );
}
