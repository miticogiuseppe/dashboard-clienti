"use client";

import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import ConfezionatriceChart from "@/components/Dibartolo/ConfezionatriceChart";
import { calcolaRange, fmt } from "@/utils/dateUtils";
import GlobalContext from "@/context/GlobalContext";

//import filedb from "@/filedb.json";
//import * as XLSX from "xlsx";

const confezionatriceData = {
  fileExcel: "/api/download-resource?id=Dibartolo_Confezionatrice", // legge il percorso dal JSON
};

export default function PaginaConfezionatrice() {
  const [pickerDate, setPickerDate] = useState([null, null]);
  const [periodo, setPeriodo] = useState("mese");
  const pathname = usePathname();
  const { startDate, endDate } = calcolaRange(periodo);
  const { tenant } = useContext(GlobalContext);

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
              <Card.Title className="mb-0 fw-semibold">
                Peso Scaricato e Quantità Riservata per Bilancia
              </Card.Title>
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
