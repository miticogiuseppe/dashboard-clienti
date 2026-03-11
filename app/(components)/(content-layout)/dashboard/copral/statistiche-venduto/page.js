"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Col, Row, Card, Form, Dropdown } from "react-bootstrap";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
// Icone
import { PiMoneyThin, PiScalesThin, PiPackageThin } from "react-icons/pi";
import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";

const StatisticheVendutoCopral = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openAgents, setOpenAgents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("Tutti gli Agenti");
  const [selectedFamily, setSelectedFamily] = useState("Tutte le Famiglie");
  const [selectedCustomer, setSelectedCustomer] = useState("Tutti i Clienti");

  // Funzione di utilità per bonificare i nomi "Inesistente" -> "VUOTO"
  const cleanValue = (val) => {
    const s = String(val || "").trim();
    if (!s || s.toUpperCase().includes("INESISTENTE")) return "VUOTO";
    return s;
  };

  const handleFlatpickrChange = (dates) => {
    if (dates.length === 2) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else if (dates.length === 0) {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const excelDateToJS = (serial) => {
    if (!serial || isNaN(serial)) return null;
    return new Date((serial - 25569) * 86400 * 1000);
  };

  const toggleAgent = (nome) => {
    const next = new Set(openAgents);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenAgents(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_AGENTE",
          { signal: controller.signal },
        );
        const json = await response.json();
        const rawData = json?.data ?? [];

        const parsedData = rawData.map((row) => {
          const serialDate = row["Data"];
          const dateObj =
            typeof serialDate === "number"
              ? excelDateToJS(serialDate)
              : new Date(serialDate);
          return { ...row, DataObj: dateObj };
        });

        setSheetData(parsedData);
      } catch (error) {
        if (error.name !== "AbortError") setSheetData([]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const { matrixData, allFamilies, kpis, totalsByFamily } = useMemo(() => {
    if (!sheetData || !Array.isArray(sheetData))
      return { matrixData: [], allFamilies: [], kpis: {}, totalsByFamily: {} };

    const grouped = {};
    const familiesSet = new Set();
    const familyTotals = {};
    let globalVal = 0,
      globalAlmQ = 0,
      globalAccQ = 0;

    sheetData.forEach((row) => {
      // 1. BONIFICA NOMI
      const agenteNome = cleanValue(row["Descrizione Agente"]);
      const clienteNome = cleanValue(row["Descrizione Cliente/Fornitore"]);
      const famRaw = cleanValue(row["Descrizione Famiglia"]);

      // 2. FILTRI
      if (startDate && endDate) {
        const d = row.DataObj;
        if (!d || d < startDate || d > endDate) return;
      }
      if (selectedAgent !== "Tutti gli Agenti" && agenteNome !== selectedAgent)
        return;
      if (selectedFamily !== "Tutte le Famiglie" && famRaw !== selectedFamily)
        return;
      if (
        selectedCustomer !== "Tutti i Clienti" &&
        clienteNome !== selectedCustomer
      )
        return;

      // 3. LOGICA NOMI FAMIGLIA PER TABELLA
      let famiglia = famRaw.toUpperCase().trim();
      if (
        famiglia === "EFFETTO LEGNO ACCIAIO" ||
        famiglia === "EFFETTO LEGNO/ACCIAIO"
      ) {
        famiglia = "EFF. LGN/ACC.";
      }

      const valore = parseFloat(row["Valore"]) || 0;
      const qta = parseFloat(row["Quantita'"]) || 0;
      familiesSet.add(famiglia);

      globalVal += valore;
      if (famiglia.includes("ALLUMINIO")) globalAlmQ += qta;
      if (famiglia.includes("ACCESSORI")) globalAccQ += qta;

      // LOG SOSPETTI (Ripristinati)
      const um = row["Descrizione GesUM"] || "NON DEFINITA";
      if (famiglia.includes("ACCESSORI") && !Number.isInteger(qta)) {
        console.log(
          `Sospetto trovato! Articolo: ${row["Descrizione Articolo"]}, Q.tà: ${qta}, UM: ${um}`,
        );
      }

      // 4. AGGREGAZIONE (Agente -> Cliente -> Famiglia)
      if (!grouped[agenteNome]) {
        grouped[agenteNome] = {
          nome: agenteNome,
          famiglie: {},
          totVal: 0,
          clienti: {},
        };
      }
      if (!grouped[agenteNome].clienti[clienteNome]) {
        grouped[agenteNome].clienti[clienteNome] = {
          nome: clienteNome,
          famiglie: {},
          totVal: 0,
        };
      }
      if (!familyTotals[famiglia]) {
        familyTotals[famiglia] = { v: 0, q: 0 };
      }

      const updateEntry = (entry) => {
        if (!entry.famiglie[famiglia])
          entry.famiglie[famiglia] = { v: 0, q: 0 };
        entry.famiglie[famiglia].v += valore;
        entry.famiglie[famiglia].q += qta;
        entry.totVal += valore;
      };

      updateEntry(grouped[agenteNome]);
      updateEntry(grouped[agenteNome].clienti[clienteNome]);

      // Totali Generali per Colonna
      familyTotals[famiglia].v += valore;
      familyTotals[famiglia].q += qta;
    });

    return {
      matrixData: Object.values(grouped).sort((a, b) =>
        a.nome.localeCompare(b.nome),
      ),
      allFamilies: Array.from(familiesSet).sort(),
      kpis: { globalVal, globalAlmQ, globalAccQ },
      totalsByFamily: familyTotals,
    };
  }, [
    sheetData,
    startDate,
    endDate,
    selectedAgent,
    selectedFamily,
    selectedCustomer,
  ]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return matrixData;
    const lowerTerm = searchTerm.toLowerCase();
    return matrixData.filter(
      (ag) =>
        ag.nome.toLowerCase().includes(lowerTerm) ||
        Object.values(ag.clienti).some((cli) =>
          cli.nome.toLowerCase().includes(lowerTerm),
        ),
    );
  }, [matrixData, searchTerm]);

  // Liste uniche per Dropdown
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

  const uniqueCustomers = useMemo(() => {
    if (!sheetData) return ["Tutti i Clienti"];
    let data = sheetData;
    if (selectedAgent !== "Tutti gli Agenti") {
      data = sheetData.filter(
        (r) => cleanValue(r["Descrizione Agente"]) === selectedAgent,
      );
    }
    const customers = [
      ...new Set(
        data.map((r) => cleanValue(r["Descrizione Cliente/Fornitore"])),
      ),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutti i Clienti", ...customers];
  }, [sheetData, selectedAgent]);

  if (isFetching) return <Preloader show={true} />;

  const dynamicCards = [
    {
      id: 1,
      title: "Fatturato Totale",
      count: `€ ${kpis.globalVal?.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      svgIcon: <PiMoneyThin />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Totale Alluminio",
      count: `${kpis.globalAlmQ?.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kg`,
      svgIcon: <PiScalesThin />,
      backgroundColor: "primary3 svg-white",
    },
    {
      id: 3,
      title: "Totale Accessori",
      count: `${kpis.globalAccQ?.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pz`,
      svgIcon: <PiPackageThin />,
      backgroundColor: "info svg-white",
    },
  ];

  return (
    <Fragment>
      <Seo title={"Statistiche Venduto Copral"} />
      <Pageheader
        title="Statistiche Venduto"
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
                <Dropdown.Item
                  key={a}
                  onClick={() => {
                    setSelectedAgent(a);
                    setSelectedCustomer("Tutti i Clienti");
                  }}
                >
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
                <Dropdown.Item key={f} onClick={() => setSelectedFamily(f)}>
                  {f}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>

          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={selectedCustomer}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                minWidth: "250px",
              }}
            >
              {uniqueCustomers.map((c) => (
                <Dropdown.Item key={c} onClick={() => setSelectedCustomer(c)}>
                  {c}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>

          {(startDate ||
            selectedAgent !== "Tutti gli Agenti" ||
            selectedFamily !== "Tutte le Famiglie" ||
            selectedCustomer !== "Tutti i Clienti") && (
            <button
              className="btn btn-danger-light btn-sm btn-icon"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedAgent("Tutti gli Agenti");
                setSelectedFamily("Tutte le Famiglie");
                setSelectedCustomer("Tutti i Clienti");
              }}
              title="Reset"
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

      <Row className="mt-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <Card.Title>Analisi Dettagliata Vendite</Card.Title>
              <Form.Control
                type="text"
                placeholder="Cerca..."
                className="form-control-sm w-25"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <div className="table-responsive border rounded">
                <table className="table table-bordered text-nowrap border-primary sticky-header mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th
                        rowSpan="2"
                        className="align-middle text-center border"
                      >
                        SOGGETTO (Agente / Cliente)
                      </th>
                      {allFamilies.map((fam) => (
                        <th
                          key={fam}
                          colSpan="2"
                          className="text-center border"
                        >
                          {fam}
                        </th>
                      ))}
                      <th
                        rowSpan="2"
                        className="align-middle text-center border"
                      >
                        TOTALE (€)
                      </th>
                    </tr>
                    <tr>
                      {allFamilies.map((fam) => (
                        <Fragment key={`${fam}-sub`}>
                          <th
                            className="text-center border"
                            style={{ fontSize: "0.7rem" }}
                          >
                            VALORE (€)
                          </th>
                          <th
                            className="text-center border"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Q.TÀ
                          </th>
                        </Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((ag) => (
                      <Fragment key={ag.nome}>
                        {/* RIGA AGENTE */}
                        <tr
                          className="table-primary-transparent"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleAgent(ag.nome)}
                        >
                          <th scope="row" className="fw-bold">
                            <i
                              className={`ri-arrow-${openAgents.has(ag.nome) ? "down" : "right"}-s-line me-1 text-primary`}
                            ></i>
                            {ag.nome}
                          </th>
                          {allFamilies.map((fam) => (
                            <Fragment key={fam}>
                              <td className="text-end fw-bold">
                                €{" "}
                                {(ag.famiglie[fam]?.v || 0).toLocaleString(
                                  "it-IT",
                                  { minimumFractionDigits: 2 },
                                )}
                              </td>
                              <td className="text-center">
                                {fam.includes("ALLUMINIO") ? (
                                  <SpkBadge variant="primary">
                                    {(ag.famiglie[fam]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}{" "}
                                    Kg
                                  </SpkBadge>
                                ) : fam.includes("ACCESSORI") ? (
                                  <SpkBadge variant="success">
                                    {(ag.famiglie[fam]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}{" "}
                                    Pz
                                  </SpkBadge>
                                ) : (
                                  <span className="text-muted">
                                    {(ag.famiglie[fam]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}
                                  </span>
                                )}
                              </td>
                            </Fragment>
                          ))}
                          <td className="text-end fw-bold text-primary bg-primary-transparent">
                            €{" "}
                            {ag.totVal.toLocaleString("it-IT", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        {/* RIGHE CLIENTI (Sotto l'Agente) */}
                        {openAgents.has(ag.nome) &&
                          Object.values(ag.clienti).map((cli) => (
                            <tr key={cli.nome} className="table-hover">
                              <td
                                className="ps-5 text-muted text-uppercase"
                                style={{ fontSize: "10px" }}
                              >
                                <i className="ri-corner-down-right-line me-2"></i>
                                {cli.nome}
                              </td>
                              {allFamilies.map((fam) => (
                                <Fragment key={fam}>
                                  <td className="text-end text-muted">
                                    €{" "}
                                    {(cli.famiglie[fam]?.v || 0).toLocaleString(
                                      "it-IT",
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </td>
                                  <td className="text-center text-muted">
                                    {(cli.famiglie[fam]?.q || 0).toLocaleString(
                                      "it-IT",
                                    )}
                                  </td>
                                </Fragment>
                              ))}
                              <td className="text-end fw-medium text-muted italic">
                                €{" "}
                                {cli.totVal.toLocaleString("it-IT", {
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
                      {allFamilies.map((fam) => (
                        <Fragment key={fam}>
                          <td className="text-end fw-bold">
                            €{" "}
                            {(totalsByFamily[fam]?.v || 0).toLocaleString(
                              "it-IT",
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                          <td className="text-center fw-bold">
                            {(totalsByFamily[fam]?.q || 0).toLocaleString(
                              "it-IT",
                            )}
                          </td>
                        </Fragment>
                      ))}
                      <td className="text-end fw-bold">
                        €{" "}
                        {kpis.globalVal?.toLocaleString("it-IT", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default StatisticheVendutoCopral;
