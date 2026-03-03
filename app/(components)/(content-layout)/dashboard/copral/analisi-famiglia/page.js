"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Col, Row, Card, Form } from "react-bootstrap";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { PiMoneyThin, PiScalesThin, PiPackageThin } from "react-icons/pi";

const AnalisiPerFamiglia = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
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
          console.error("Errore STAVEN:", error);
          setSheetData([]);
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const { matrix, allAgents, kpis, totalsByAgent } = useMemo(() => {
    if (!sheetData || !Array.isArray(sheetData))
      return {
        matrix: [],
        allAgents: [],
        kpis: { globalVal: 0, globalAlmQ: 0, globalAccQ: 0 },
        totalsByAgent: {},
      };

    const tree = {};
    const agentsSet = new Set();
    const agentTotals = {};
    let globalVal = 0,
      globalAlmQ = 0,
      globalAccQ = 0;

    sheetData.forEach((row) => {
      const agente = row["Descrizione Agente"] || "NON ASSEGNATO";
      const macro =
        row["Descrizione Famiglia"]?.toUpperCase().trim() || "VARIE";
      const sotto = (row["Descrizione Gruppo"] || "ALTRO").toUpperCase().trim();
      const valore = parseFloat(row["Valore"]) || 0;
      const qta = parseFloat(row["Quantita'"]) || 0;

      agentsSet.add(agente);
      globalVal += valore;
      if (macro.includes("ALLUMINIO")) globalAlmQ += qta;
      if (macro.includes("ACCESSORI")) globalAccQ += qta;

      // Aggregazione Macro
      if (!tree[macro])
        tree[macro] = { nome: macro, sotto: {}, agenti: {}, totV: 0 };
      if (!tree[macro].agenti[agente])
        tree[macro].agenti[agente] = { v: 0, q: 0 };
      tree[macro].agenti[agente].v += valore;
      tree[macro].agenti[agente].q += qta;
      tree[macro].totV += valore;

      // Aggregazione Sotto
      if (!tree[macro].sotto[sotto])
        tree[macro].sotto[sotto] = { nome: sotto, agenti: {}, totV: 0 };
      if (!tree[macro].sotto[sotto].agenti[agente])
        tree[macro].sotto[sotto].agenti[agente] = { v: 0, q: 0 };
      tree[macro].sotto[sotto].agenti[agente].v += valore;
      tree[macro].sotto[sotto].agenti[agente].q += qta;
      tree[macro].sotto[sotto].totV += valore;

      // Totali per Colonna (Agenti)
      if (!agentTotals[agente]) agentTotals[agente] = { v: 0, q: 0 };
      agentTotals[agente].v += valore;
      agentTotals[agente].q += qta;
    });

    return {
      matrix: Object.values(tree).sort((a, b) => a.nome.localeCompare(b.nome)),
      allAgents: Array.from(agentsSet).sort(),
      kpis: { globalVal, globalAlmQ, globalAccQ },
      totalsByAgent: agentTotals,
    };
  }, [sheetData]);

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
      title: "Totale Alluminio",
      count: `${kpis.globalAlmQ.toLocaleString("it-IT", { minimumFractionDigits: 2 })} Kg`,
      svgIcon: <PiScalesThin />,
      backgroundColor: "primary3 svg-white",
    },
    {
      id: 3,
      title: "Totale Accessori",
      count: `${kpis.globalAccQ.toLocaleString("it-IT", { minimumFractionDigits: 2 })} Pz`,
      svgIcon: <PiPackageThin />,
      backgroundColor: "info svg-white",
    },
  ];

  const toggleFamily = (nome) => {
    const next = new Set(openFamilies);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenFamilies(next);
  };

  const tableHeader = [
    { title: "FAMIGLIA / GRUPPO" },
    ...allAgents.flatMap((ag) => [
      { title: `${ag} (€)` },
      { title: `${ag} (Q.tà)` },
    ]),
    { title: "TOT. VALORE (€)" },
  ];

  if (isFetching) return <Preloader show={true} />;

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
          <Col xxl={3} xl={3} lg={6} key={card.id}>
            <Spkcardscomponent
              cardClass="overflow-hidden main-content-card"
              mainClass="d-flex align-items-center justify-content-between flex-nowrap"
              card={card}
              svgIcon={card.svgIcon}
            />
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <Card.Title>Dettaglio Famiglie</Card.Title>
              <Form.Control
                type="text"
                placeholder="Cerca..."
                className="form-control-sm w-25"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <SpkTablescomponent
                  tableClass="table-bordered text-nowrap border-primary sticky-header"
                  header={tableHeader}
                >
                  {matrix
                    .filter((m) =>
                      m.nome.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((macro) => (
                      <Fragment key={macro.nome}>
                        <tr
                          className="table-primary-transparent cursor-pointer"
                          onClick={() => toggleFamily(macro.nome)}
                        >
                          <th scope="row" className="fw-bold">
                            <i
                              className={`ri-arrow-${openFamilies.has(macro.nome) ? "down" : "right"}-s-line me-1 text-primary`}
                            ></i>
                            {macro.nome}
                          </th>
                          {allAgents.map((ag) => (
                            <Fragment key={ag}>
                              <td className="text-end fw-bold">
                                €{" "}
                                {(macro.agenti[ag]?.v || 0).toLocaleString(
                                  "it-IT",
                                  { minimumFractionDigits: 2 },
                                )}
                              </td>
                              <td className="text-center fw-bold">
                                {macro.nome.includes("ALLUMINIO") ? (
                                  <SpkBadge variant="primary">
                                    {(macro.agenti[ag]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}{" "}
                                    Kg
                                  </SpkBadge>
                                ) : macro.nome.includes("ACCESSORI") ? (
                                  <SpkBadge variant="success">
                                    {(macro.agenti[ag]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}{" "}
                                    Pz
                                  </SpkBadge>
                                ) : (
                                  (macro.agenti[ag]?.q || 0).toLocaleString(
                                    "it-IT",
                                  )
                                )}
                              </td>
                            </Fragment>
                          ))}
                          <td className="text-end fw-bold text-primary bg-primary-transparent">
                            €{" "}
                            {macro.totV.toLocaleString("it-IT", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        {openFamilies.has(macro.nome) &&
                          Object.values(macro.sotto).map((sotto) => (
                            <tr key={sotto.nome}>
                              <td
                                className="ps-5 text-muted text-uppercase"
                                style={{ fontSize: "10px" }}
                              >
                                {sotto.nome}
                              </td>
                              {allAgents.map((ag) => (
                                <Fragment key={ag}>
                                  <td className="text-end text-muted">
                                    €{" "}
                                    {(sotto.agenti[ag]?.v || 0).toLocaleString(
                                      "it-IT",
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </td>
                                  <td className="text-center text-muted">
                                    {macro.nome.includes("ALLUMINIO") ? (
                                      <SpkBadge variant="info-transparent">
                                        {(
                                          sotto.agenti[ag]?.q || 0
                                        ).toLocaleString("it-IT")}{" "}
                                        Kg
                                      </SpkBadge>
                                    ) : macro.nome.includes("ACCESSORI") ? (
                                      <SpkBadge variant="success-transparent">
                                        {(
                                          sotto.agenti[ag]?.q || 0
                                        ).toLocaleString("it-IT")}{" "}
                                        Pz
                                      </SpkBadge>
                                    ) : (
                                      (sotto.agenti[ag]?.q || 0).toLocaleString(
                                        "it-IT",
                                      )
                                    )}
                                  </td>
                                </Fragment>
                              ))}
                              <td className="text-end text-muted">
                                €{" "}
                                {sotto.totV.toLocaleString("it-IT", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    ))}
                  {/* RIGA TOTALE COMPLESSIVO */}
                  <tr className="table-dark">
                    <th scope="row">TOTALE COMPLESSIVO</th>
                    {allAgents.map((ag) => (
                      <Fragment key={ag}>
                        <td className="text-end fw-bold">
                          €{" "}
                          {totalsByAgent[ag].v.toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center fw-bold">
                          {totalsByAgent[ag].q.toLocaleString("it-IT")}
                        </td>
                      </Fragment>
                    ))}
                    <td className="text-end fw-bold">
                      €{" "}
                      {kpis.globalVal.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
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
