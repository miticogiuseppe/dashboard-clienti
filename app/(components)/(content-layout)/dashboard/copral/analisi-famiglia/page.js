"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Col, Row, Card, Form } from "react-bootstrap";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { PiMoneyThin, PiPackageThin, PiChartLineUpThin } from "react-icons/pi";

const AnalisiPerFamiglia = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        // Usiamo la stessa API, cambiamo solo la logica di aggregazione frontend
        const response = await fetch(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_AGENTE",
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        const json = await response.json();
        setSheetData(json?.data ?? []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Errore Analisi Famiglie:", error);
          setSheetData([]);
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const { processedData, allAgents, kpis } = useMemo(() => {
    if (!sheetData || !Array.isArray(sheetData))
      return { processedData: [], allAgents: [], kpis: {} };

    const grouped = {};
    const agentsSet = new Set();
    let globalVal = 0;

    sheetData.forEach((row) => {
      const agenteNome = row["Descrizione Agente"] || "NON ASSEGNATO";
      let famigliaRaw =
        row["Descrizione Famiglia"]?.toUpperCase().trim() || "VARIE";

      // Pulizia come nel file precedente
      if (famigliaRaw.includes("INESISTENTE")) famigliaRaw = "VARIE";
      if (
        famigliaRaw === "EFFETTO LEGNO ACCIAIO" ||
        famigliaRaw === "EFFETTO LEGNO/ACCIAIO"
      ) {
        famigliaRaw = "EFF. LGN/ACC.";
      }

      const valore = parseFloat(row["Valore"]) || 0;
      const qta = parseFloat(row["Quantita'"]) || 0;

      globalVal += valore;
      agentsSet.add(agenteNome);

      if (!grouped[famigliaRaw]) {
        grouped[famigliaRaw] = {
          famiglia: famigliaRaw,
          agenti: {},
          totVal: 0,
          totQta: 0,
        };
      }

      if (!grouped[famigliaRaw].agenti[agenteNome]) {
        grouped[famigliaRaw].agenti[agenteNome] = {
          nome: agenteNome,
          v: 0,
          q: 0,
        };
      }

      grouped[famigliaRaw].agenti[agenteNome].v += valore;
      grouped[famigliaRaw].agenti[agenteNome].q += qta;
      grouped[famigliaRaw].totVal += valore;
      grouped[famigliaRaw].totQta += qta;
    });

    return {
      processedData: Object.values(grouped).sort((a, b) => b.totVal - a.totVal),
      allAgents: Array.from(agentsSet).sort(),
      kpis: { globalVal, countFam: Object.keys(grouped).length },
    };
  }, [sheetData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;
    const lowerTerm = searchTerm.toLowerCase();
    return processedData.filter(
      (f) =>
        f.famiglia.toLowerCase().includes(lowerTerm) ||
        Object.values(f.agenti).some((a) =>
          a.nome.toLowerCase().includes(lowerTerm),
        ),
    );
  }, [processedData, searchTerm]);

  if (isFetching) return <Preloader show={true} />;

  const dynamicCards = [
    {
      id: 1,
      title: "Fatturato Totale",
      count: `€ ${kpis.globalVal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`,
      svgIcon: <PiMoneyThin />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Famiglie Gestite",
      count: kpis.countFam,
      svgIcon: <PiPackageThin />,
      backgroundColor: "success svg-white",
    },
    {
      id: 3,
      title: "Media per Famiglia",
      count: `€ ${(kpis.globalVal / kpis.countFam).toLocaleString("it-IT", { maximumFractionDigits: 0 })}`,
      svgIcon: <PiChartLineUpThin />,
      backgroundColor: "info svg-white",
    },
  ];

  const toggleFamily = (nome) => {
    const next = new Set(openFamilies);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenFamilies(next);
  };

  const tableHeader = [
    { title: "Famiglia / Agente" },
    { title: "TOTALE VALORE (€)" },
    { title: "QUANTITÀ TOTALE" },
    { title: "INCIDENZA %" },
  ];

  return (
    <Fragment>
      <Seo title={"Analisi per Famiglia - Copral"} />
      <Pageheader
        title="Analisi per Famiglia"
        currentpage="Copral"
        activepage="Dashboard"
      />

      <Row>
        {dynamicCards.map((card) => (
          <Col xxl={4} xl={4} lg={6} key={card.id}>
            <Spkcardscomponent
              card={card}
              svgIcon={card.svgIcon}
              cardClass="overflow-hidden main-content-card"
            />
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <Card.Title>Dettaglio Vendite per Categoria</Card.Title>
              <Form.Control
                type="text"
                placeholder="Cerca famiglia o agente..."
                className="form-control-sm"
                style={{ maxWidth: "250px" }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <SpkTablescomponent
                  tableClass="table-bordered text-nowrap border-primary sticky-header"
                  header={tableHeader}
                >
                  {filteredData.map((item) => (
                    <Fragment key={item.famiglia}>
                      <tr
                        className="table-primary-transparent cursor-pointer"
                        onClick={() => toggleFamily(item.famiglia)}
                      >
                        <th scope="row" className="fw-bold">
                          <i
                            className={`ri-arrow-${openFamilies.has(item.famiglia) ? "down" : "right"}-s-line me-1 text-primary`}
                          ></i>
                          {item.famiglia}
                        </th>
                        <td className="text-end fw-bold">
                          €{" "}
                          {item.totVal.toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center">
                          <SpkBadge variant="primary-transparent">
                            {item.totQta.toLocaleString("it-IT")}{" "}
                            {item.famiglia.includes("ALLUMINIO") ? "Kg" : "Pz"}
                          </SpkBadge>
                        </td>
                        <td className="text-center fw-bold text-primary">
                          {((item.totVal / kpis.globalVal) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      {openFamilies.has(item.famiglia) &&
                        Object.values(item.agenti)
                          .sort((a, b) => b.v - a.v)
                          .map((agente, idx) => (
                            <tr key={idx} className="table-hover">
                              <td
                                className="ps-5 text-muted text-uppercase"
                                style={{ fontSize: "11px" }}
                              >
                                {agente.nome}
                              </td>
                              <td className="text-end text-muted">
                                €{" "}
                                {agente.v.toLocaleString("it-IT", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="text-center text-muted">
                                {agente.q.toLocaleString("it-IT")}
                              </td>
                              <td className="text-center text-muted small">
                                {((agente.v / item.totVal) * 100).toFixed(1)}%
                                (su fam.)
                              </td>
                            </tr>
                          ))}
                    </Fragment>
                  ))}
                </SpkTablescomponent>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AnalisiPerFamiglia;
