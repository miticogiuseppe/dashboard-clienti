"use client";
import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const MacchinaDashboard = ({
  nome,
  fileStorico,
  appmerce,
  fileAppmerce,
  tenant,
}) => {
  const downloadFile = async (url) => {
    const res = await fetch(url, {
      headers: {
        "x-tenant": tenant,
      },
    });

    if (!res.ok) {
      alert("Errore nel download");
      return;
    }

    const blob = await res.blob();
    const tempUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = tempUrl;

    const filename =
      res.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || "download.bin";

    a.download = filename;
    a.click();
    URL.revokeObjectURL(tempUrl);
  };

  return (
    <Row className="mb-4 align-items-stretch">
      <Col xl={3} className="d-flex">
        <Card className="custom-card w-100 h-100 shadow-sm rounded-3">
          <Card.Header className="bg-transparent border-0 pb-0">
            <Card.Title className="fw-semibold mb-1">Storico</Card.Title>
            <small className="text-muted">Download file macchina</small>
          </Card.Header>

          <Card.Body className="pt-3 d-flex flex-column justify-content-center">
            <div className="d-flex gap-2 flex-wrap">
              <button
                onClick={() => downloadFile(fileStorico)}
                className="btn btn-primary btn-sm px-3"
              >
                ⬇ Scarica STORICO
              </button>

              <button
                onClick={() => downloadFile(fileAppmerce)}
                className="btn btn-secondary btn-sm px-3"
              >
                ⬇ Scarica APPMERCE
              </button>
            </div>

            <div className="mt-3 text-muted" style={{ fontSize: "13px" }}>
              I file vengono scaricati direttamente dal gestionale del cliente.
            </div>

            {/* DATI FUTURI (già pronti se vorrai riattivarli) */}
            {/*
            <ul className="list-unstyled mt-3 mb-0">
              <li>
                <strong>Ordini ricevuti:</strong> {appmerce.ordini}
              </li>
              <li>
                <strong>Imballaggi previsti:</strong> {appmerce.imballaggi}
              </li>
              <li>
                <strong>Ultima consegna:</strong> {appmerce.dataConsegna}
              </li>
            </ul>
            */}
          </Card.Body>
        </Card>
      </Col>

      {false && (
        <Col xl={8}>
          <Card className="custom-card h-100">
            <Card.Header>
              <Card.Title>Produzione Imballatrice</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-2">
                I grafici di produzione e TS sono gestiti dai componenti esterni
                (AppmerceChart, AppmerceChartByArticolo) che leggono
                direttamente i dati da Excel.
              </p>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default MacchinaDashboard;
