// Versione basica ottimizzata della dashboard
"use client";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import { Fragment, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Ecommerce = () => {
  const [isLoading] = useState(false);

  // Dataset vuoto pronto per il prossimo cliente
  const recentOrders = [];
  const pieData = {
    labels: ["Completati", "In lavorazione", "Annullati"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Fragment>
      <Preloader show={isLoading} />
      <Seo title="Dashboard Base" />

      <Pageheader
        title="Dashboard Base"
        currentpage="Generale"
        activepage="Generale"
        showActions={false}
      />

      <Row className="g-4">
        <Col xxl={12}>
          <Row className="g-4">
            {/* CARDS BASIC E OTTIMIZZATE */}
            <Col xl={3} className="d-flex flex-column gap-3">
              {["Totale Ordini", "Totale Clienti", "Quantità Totale"].map(
                (title, idx) => (
                  <Card
                    key={idx}
                    className="p-4 text-center shadow-sm rounded-3"
                  >
                    <h5 className="fw-semibold mb-1">{title}</h5>
                    <p className="fs-3 text-primary fw-bold mb-0">0</p>
                  </Card>
                )
              )}
            </Col>

            {/* REPORT PLACEHOLDER */}
            <Col xl={9}>
              <Card className="custom-card p-4 shadow-sm rounded-3 text-center">
                <h5 className="fw-semibold mb-2">Report</h5>
                <p className="text-muted mb-0">
                  Nessun dato disponibile — Seleziona un cliente per iniziare
                </p>
              </Card>
            </Col>

            {/* TABELLA ORDINI RECENTI */}
            <Col xxl={8} xl={7}>
              <Card className="custom-card shadow-sm rounded-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Ordini Recenti</h5>
                </Card.Header>
                <div className="table-responsive">
                  <SpkTablescomponent
                    tableClass="table-hover mb-0" // Già modificato per rimuovere 'text-nowrap'
                    header={[
                      { title: "Numero Ordine" },
                      { title: "Sezione" },
                      { title: "Ragione Sociale" },
                      { title: "Agente" },
                      { title: "Data Ordine" },
                    ]}
                  >
                    {/* ... Righe della tabella ... */}
                  </SpkTablescomponent>
                </div>
              </Card>
            </Col>

            {/* BOX TOTALE ORDINI */}
            <Col xxl={4} xl={5}>
              <Card className="custom-card p-4 text-center shadow-sm rounded-3">
                <h5 className="fw-semibold mb-3">Distribuzione Ordini</h5>

                <div style={{ maxWidth: "250px", margin: "0 auto" }}>
                  <Pie data={pieData} />
                </div>

                <p className="text-muted mt-3 mb-0">
                  Dati pronti per integrazione cliente
                </p>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Ecommerce;
