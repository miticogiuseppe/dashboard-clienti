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

    // nome file preso dalle response headers
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
      <Col xl={4} className="d-flex">
        <Card className="custom-card w-100 h-100">
          <Card.Header>
            <Card.Title>Storico</Card.Title>
          </Card.Header>
          <Card.Body>
            <p>
              <button
                onClick={() => downloadFile(fileStorico)}
                className="btn btn-primary btn-sm me-2"
              >
                Scarica STORICO
              </button>

              <button
                onClick={() => downloadFile(fileAppmerce)}
                className="btn btn-secondary btn-sm"
              >
                Scarica APPMERCE
              </button>
            </p>
            {/* <ul className="list-unstyled">
              <li>
                <strong>Ordini ricevuti:</strong> {appmerce.ordini}
              </li>
              <li>
                <strong>Imballaggi previsti:</strong> {appmerce.imballaggi}
              </li>
              <li>
                <strong>Ultima consegna:</strong> {appmerce.dataConsegna}
              </li>
            </ul> */}
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
