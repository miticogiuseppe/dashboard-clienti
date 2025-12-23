"use client";
import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import { FaRectangleList } from "react-icons/fa6";
import { FaDownload } from "react-icons/fa6";

const MacchinaDashboard = ({ fileStorico, fileAppmerce }) => {
  const downloadFile = async (url) => {
    const res = await fetch(url);

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

  const cardData = {
    id: 1,
    title: "Storico",
    count: "Download file macchina",
    inc: (
      <>
        <button
          onClick={() => downloadFile(fileStorico)}
          className="btn btn-primary btn-sm px-3"
        >
          <FaDownload /> Scarica STORICO
        </button>

        <button
          onClick={() => downloadFile(fileAppmerce)}
          className="btn btn-secondary btn-sm px-3"
        >
          <FaDownload /> Scarica APPMERCE
        </button>
      </>
    ),
    svgIcon: <FaRectangleList />,
    backgroundColor: "primary2 svg-white",
  };

  return (
    <Row>
      <Col xl={6}>
        <Spkcardscomponent
          cardClass="overflow-hidden main-content-card"
          headingClass="d-block mb-1"
          mainClass="d-flex align-items-start justify-content-between mb-2"
          svgIcon={cardData.svgIcon}
          card={cardData}
          badgeClass="md"
          dataClass="mb-0"
          useFlex={true}
        />
      </Col>
    </Row>
  );
};

export default MacchinaDashboard;
