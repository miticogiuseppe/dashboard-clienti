"use client";
import MacchinaDashboard from "@/components/MacchinaDashboard";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { Col, Row } from "react-bootstrap";

const download = {
  nome: "Download",
  fileStorico: "/api/download-resource?id=STORICO",
  fileAppmerce: "/api/download-resource?id=ANALISI",
  appmerce: {
    ordini: 90,
    produzione: 1450,
    dataConsegna: "2025-12-15",
  },
};

// COMPONENTE PRINCIPALE
export default function PaginaDownload() {
  return (
    <>
      <Seo title="Pagina download" />
      <>
        <Pageheader
          title="Rica - Download"
          currentpage="Download"
          activepage="Download"
          showActions={false}
        />

        <Row className="g-4 mb-4">
          <Col xxl={12}>
            <MacchinaDashboard {...download} tenant={download.tenant} />
          </Col>
        </Row>
      </>
    </>
  );
}
