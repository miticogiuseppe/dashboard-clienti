"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Col, Row, Card, Form, Dropdown } from "react-bootstrap";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { PiMoneyThin, PiScalesThin, PiPackageThin } from "react-icons/pi";
import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";

const AnalisiPerFamiglia = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATI FILTRI ---
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("Tutti gli Agenti");
  const [selectedFamily, setSelectedFamily] = useState("Tutte le Famiglie");
  const [selectedGroup, setSelectedGroup] = useState("Tutti i Gruppi");

  // Funzione di utilità per bonificare i nomi "Inesistente"
  const cleanValue = (val) => {
    const s = String(val || "").trim();
    if (!s || s.toUpperCase().includes("INESISTENTE")) return "VUOTO";
    return s;
  };

  const excelDateToJS = (serial) => {
    if (!serial || isNaN(serial)) return null;
    return new Date((serial - 25569) * 86400 * 1000);
  };

  const handleFlatpickrChange = (dates) => {
    if (dates.length === 2) {
      const start = new Date(dates[0].setHours(0, 0, 0, 0));
      const end = new Date(dates[1].setHours(23, 59, 59, 999));
      setStartDate(start);
      setEndDate(end);
    } else if (dates.length === 0) {
      setStartDate(null);
      setEndDate(null);
    }
  };

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
        const rawData = json?.data ?? [];

        const parsedData = rawData.map((row) => ({
          ...row,
          DataObj:
            typeof row["Data"] === "number"
              ? excelDateToJS(row["Data"])
              : new Date(row["Data"]),
        }));

        setSheetData(parsedData);
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

  // --- ESTRAZIONE LISTE UNICHE (BONIFICATE) ---
  const uniqueAgents = useMemo(() => {
    if (!sheetData) return ["Tutti gli Agenti"];
    const agents = [
      ...new Set(sheetData.map((r) => cleanValue(r["Descrizione Agente"]))),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutti gli Agenti", ...agents];
  }, [sheetData]);

  const uniqueFamiliesList = useMemo(() => {
    if (!sheetData) return ["Tutte le Famiglie"];
    const families = [
      ...new Set(sheetData.map((r) => cleanValue(r["Descrizione Famiglia"]))),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutte le Famiglie", ...families];
  }, [sheetData]);

  const uniqueGroupsList = useMemo(() => {
    if (!sheetData) return ["Tutti i Gruppi"];
    let dataForGroups = sheetData;
    if (selectedFamily !== "Tutte le Famiglie") {
      dataForGroups = sheetData.filter(
        (r) => cleanValue(r["Descrizione Famiglia"]) === selectedFamily,
      );
    }
    const groups = [
      ...new Set(dataForGroups.map((r) => cleanValue(r["Descrizione Gruppo"]))),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutti i Gruppi", ...groups];
  }, [sheetData, selectedFamily]);

  // --- LOGICA DI ELABORAZIONE ---
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
      // 1. Bonifica immediata dei nomi per coerenza con i filtri
      const agente = cleanValue(row["Descrizione Agente"]);
      const macro = cleanValue(row["Descrizione Famiglia"]).toUpperCase();
      const sotto = cleanValue(row["Descrizione Gruppo"]).toUpperCase();

      // 2. FILTRI
      if (startDate && endDate) {
        const d = row.DataObj;
        if (!d || d < startDate || d > endDate) return;
      }
      if (selectedAgent !== "Tutti gli Agenti" && agente !== selectedAgent)
        return;
      if (
        selectedFamily !== "Tutte le Famiglie" &&
        macro !== selectedFamily.toUpperCase()
      )
        return;
      if (
        selectedGroup !== "Tutti i Gruppi" &&
        sotto !== selectedGroup.toUpperCase()
      )
        return;

      const valore = parseFloat(row["Valore"]) || 0;
      const qta = parseFloat(row["Quantita'"]) || 0;

      agentsSet.add(agente);
      globalVal += valore;
      if (macro.includes("ALLUMINIO")) globalAlmQ += qta;
      if (macro.includes("ACCESSORI")) globalAccQ += qta;

      if (!tree[macro])
        tree[macro] = { nome: macro, sotto: {}, agenti: {}, totV: 0 };
      if (!tree[macro].agenti[agente])
        tree[macro].agenti[agente] = { v: 0, q: 0 };
      tree[macro].agenti[agente].v += valore;
      tree[macro].agenti[agente].q += qta;
      tree[macro].totV += valore;

      if (!tree[macro].sotto[sotto])
        tree[macro].sotto[sotto] = { nome: sotto, agenti: {}, totV: 0 };
      if (!tree[macro].sotto[sotto].agenti[agente])
        tree[macro].sotto[sotto].agenti[agente] = { v: 0, q: 0 };
      tree[macro].sotto[sotto].agenti[agente].v += valore;
      tree[macro].sotto[sotto].agenti[agente].q += qta;
      tree[macro].sotto[sotto].totV += valore;

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
  }, [
    sheetData,
    startDate,
    endDate,
    selectedAgent,
    selectedFamily,
    selectedGroup,
  ]);

  const toggleFamily = (nome) => {
    const next = new Set(openFamilies);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenFamilies(next);
  };

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedAgent("Tutti gli Agenti");
    setSelectedFamily("Tutte le Famiglie");
    setSelectedGroup("Tutti i Gruppi");
    setSearchTerm("");
  };

  const dynamicCards = [
    {
      id: 1,
      title: "Fatturato Totale",
      count: `€ ${kpis.globalVal.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      svgIcon: <PiMoneyThin />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Totale Alluminio",
      count: `${kpis.globalAlmQ.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kg`,
      svgIcon: <PiScalesThin />,
      backgroundColor: "primary3 svg-white",
    },
    {
      id: 3,
      title: "Totale Accessori",
      count: `${kpis.globalAccQ.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pz`,
      svgIcon: <PiPackageThin />,
      backgroundColor: "info svg-white",
    },
  ];

  if (isFetching) return <Preloader show={true} />;

  return (
    <Fragment>
      <Seo title={"Analisi per Famiglia - Copral"} />
      <Pageheader
        title="Analisi per Famiglia"
        currentpage="Copral"
        activepage="Dashboard"
        showActions={true}
      >
        <div
          className="d-flex flex-wrap gap-2 align-items-center"
          style={{ overflow: "visible" }}
        >
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleFlatpickrChange}
          />
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={selectedAgent}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {uniqueAgents.map((a) => (
                <Dropdown.Item key={a} onClick={() => setSelectedAgent(a)}>
                  {a}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={selectedFamily}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {uniqueFamiliesList.map((f) => (
                <Dropdown.Item
                  key={f}
                  onClick={() => {
                    setSelectedFamily(f);
                    setSelectedGroup("Tutti i Gruppi");
                  }}
                >
                  {f}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={selectedGroup}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {uniqueGroupsList.map((g) => (
                <Dropdown.Item key={g} onClick={() => setSelectedGroup(g)}>
                  {g}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>
          {(startDate ||
            selectedAgent !== "Tutti gli Agenti" ||
            selectedFamily !== "Tutte le Famiglie" ||
            selectedGroup !== "Tutti i Gruppi") && (
            <button
              className="btn btn-danger-light btn-sm btn-icon"
              onClick={resetFilters}
              title="Reset filtri"
            >
              <i className="ti ti-refresh"></i>
            </button>
          )}
        </div>
      </Pageheader>

      <Row>
        {dynamicCards.map((card) => (
          <Col xxl={4} xl={4} lg={6} key={card.id}>
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
                placeholder="Cerca macro famiglia..."
                className="form-control-sm w-25"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <SpkTablescomponent
                  tableClass="table-bordered text-nowrap border-primary sticky-header"
                  header={[
                    { title: "FAMIGLIA / GRUPPO" },
                    ...allAgents.flatMap((ag) => [
                      { title: `${ag} (€)` },
                      { title: `${ag} (Q.tà)` },
                    ]),
                    { title: "TOT. VALORE (€)" },
                  ]}
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
                                    {(sotto.agenti[ag]?.q || 0).toLocaleString(
                                      "it-IT",
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
                  <tr className="table-dark">
                    <th scope="row">TOTALE COMPLESSIVO</th>
                    {allAgents.map((ag) => (
                      <Fragment key={ag}>
                        <td className="text-end fw-bold">
                          €{" "}
                          {totalsByAgent[ag]?.v.toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-center fw-bold">
                          {totalsByAgent[ag]?.q.toLocaleString("it-IT")}
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
