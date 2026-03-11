"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Col, Row, Card, Form, Dropdown } from "react-bootstrap";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
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
    // Excel conta dal 1/1/1900, JS dal 1/1/1970.
    // La differenza è di 25569 giorni.
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date;
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
          // Trasformiamo il numero 45236 in un oggetto Date vero
          const dateObj =
            typeof serialDate === "number"
              ? excelDateToJS(serialDate)
              : new Date(serialDate);

          return {
            ...row,
            DataObj: dateObj, // Usiamo questo per il filtro
          };
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

  const { processedData, allFamilies, kpis } = useMemo(() => {
    if (!sheetData || !Array.isArray(sheetData))
      return { processedData: [], allFamilies: [], kpis: {} };

    const grouped = {};
    const familiesSet = new Set();
    let globalVal = 0,
      globalAlmQ = 0,
      globalAccQ = 0;

    sheetData.forEach((row) => {
      if (startDate && endDate) {
        const d = row.DataObj;
        if (!d || d < startDate || d > endDate) return;
      }
      // 2. Filtro Agente
      if (
        selectedAgent !== "Tutti gli Agenti" &&
        row["Descrizione Agente"] !== selectedAgent
      )
        return;

      // 3. Filtro Famiglia
      if (
        selectedFamily !== "Tutte le Famiglie" &&
        row["Descrizione Famiglia"] !== selectedFamily
      )
        return;

      // 4. Filtro Cliente
      if (
        selectedCustomer !== "Tutti i Clienti" &&
        row["Descrizione Cliente/Fornitore"] !== selectedCustomer
      )
        return;
      const agenteNome = row["Descrizione Agente"] || "NON ASSEGNATO";
      const clienteNome =
        row["Descrizione Cliente/Fornitore"] || "CLIENTE GENERICO";

      // --- LOGICA DI PULIZIA E ABBREVIAZIONE NOMI FAMIGLIA ---
      let famigliaRaw =
        row["Descrizione Famiglia"]?.toUpperCase().trim() || "VARIE";
      let famiglia = famigliaRaw;

      if (
        famigliaRaw === "EFFETTO LEGNO ACCIAIO" ||
        famigliaRaw === "EFFETTO LEGNO/ACCIAIO"
      ) {
        famiglia = "EFF. LGN/ACC.";
      } else if (famigliaRaw.includes("INESISTENTE")) {
        famiglia = "VARIE";
      }
      const valore = parseFloat(row["Valore"]) || 0;
      const qta = parseFloat(row["Quantita'"]) || 0;
      familiesSet.add(famiglia);

      globalVal += valore;
      if (famigliaRaw.includes("ALLUMINIO")) globalAlmQ += qta;
      if (famigliaRaw.includes("ACCESSORI")) globalAccQ += qta;

      // Se è un accessorio e ha la virgola, stampalo nella console del browser (F12)
      const um = row["Descrizione GesUM"] || "NON DEFINITA";

      const qt = row["Quantita'"];
      if (famiglia.includes("ACCESSORI") && !Number.isInteger(parseFloat(qt))) {
        console.log(
          `Sospetto trovato! Articolo: ${row["Descrizione Articolo"]}, Q.tà: ${qt}, UM: ${um}`,
        );
      }

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

      const updateEntry = (entry) => {
        if (!entry.famiglie[famiglia])
          entry.famiglie[famiglia] = { v: 0, q: 0 };
        entry.famiglie[famiglia].v += valore;
        entry.famiglie[famiglia].q += qta;
        entry.totVal += valore;
      };
      updateEntry(grouped[agenteNome]);
      updateEntry(grouped[agenteNome].clienti[clienteNome]);
    });

    return {
      processedData: Object.values(grouped),
      allFamilies: Array.from(familiesSet).sort(),
      kpis: { globalVal, globalAlmQ, globalAccQ },
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
    if (!searchTerm) return processedData;
    const lowerTerm = searchTerm.toLowerCase();
    return processedData.filter(
      (agente) =>
        agente.nome.toLowerCase().includes(lowerTerm) ||
        Object.values(agente.clienti).some((cli) =>
          cli.nome.toLowerCase().includes(lowerTerm),
        ),
    );
  }, [processedData, searchTerm]);

  // Lista Agenti Unici
  const uniqueAgents = useMemo(() => {
    if (!sheetData) return ["Tutti gli Agenti"];
    const agents = [
      ...new Set(sheetData.map((row) => row["Descrizione Agente"])),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutti gli Agenti", ...agents];
  }, [sheetData]);

  // Lista Famiglie Uniche
  const uniqueFamiliesList = useMemo(() => {
    if (!sheetData) return ["Tutte le Famiglie"];
    const families = [
      ...new Set(sheetData.map((row) => row["Descrizione Famiglia"])),
    ]
      .filter(Boolean)
      .sort();
    return ["Tutte le Famiglie", ...families];
  }, [sheetData]);

  // Lista Clienti (filtrata in base all'agente selezionato per comodità)
  const uniqueCustomers = useMemo(() => {
    if (!sheetData) return ["Tutti i Clienti"];
    let filtered = sheetData;
    if (selectedAgent !== "Tutti gli Agenti") {
      filtered = sheetData.filter(
        (row) => row["Descrizione Agente"] === selectedAgent,
      );
    }
    const customers = [
      ...new Set(filtered.map((row) => row["Descrizione Cliente/Fornitore"])),
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
      // focus qui: aggiungiamo minimum e maximum FractionDigits a 2
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
    // {
    //   id: 3,
    //   title: "Totale Accessori",
    //   // Per gli accessori (pezzi) di solito si usa intero, ma se vuoi coerenza mettiamo 2 decimali anche qui
    //   count: `${kpis.globalAccQ.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pz`,
    //   svgIcon: <PiPackageThin />,
    //   backgroundColor: "info svg-white",
    // },
  ];

  const toggleAgent = (nome) => {
    const next = new Set(openAgents);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenAgents(next);
  };

  const tableHeader = [
    { title: "Agente / Cliente" },
    ...allFamilies.flatMap((f) => [
      { title: `${f} (€)` },
      { title: `${f} (Q.tà)` },
    ]),
    { title: "TOT. VALORE (€)" },
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
          {/* CALENDARIO */}
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleFlatpickrChange}
          />

          {/* DROPDOWN AGENTI */}
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

          {/* DROPDOWN FAMIGLIE */}
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

          {/* DROPDOWN CLIENTI */}
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

          {/* RESET */}
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
            >
              <i className="ti ti-refresh"></i>
            </button>
          )}
        </div>
      </Pageheader>

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
              <Card.Title>Analisi Dettagliata Vendite</Card.Title>
              <Form.Control
                type="text"
                placeholder="Cerca..."
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
                  {filteredData.map((agente) => (
                    <Fragment key={agente.nome}>
                      <tr
                        className="table-primary-transparent cursor-pointer"
                        onClick={() => toggleAgent(agente.nome)}
                      >
                        <th scope="row" className="fw-bold">
                          <i
                            className={`ri-arrow-${openAgents.has(agente.nome) ? "down" : "right"}-s-line me-1 text-primary`}
                          ></i>
                          {agente.nome}
                        </th>
                        {allFamilies.map((fam) => (
                          <Fragment key={fam}>
                            <td className="text-end fw-bold">
                              €{" "}
                              {(agente.famiglie[fam]?.v || 0).toLocaleString(
                                "it-IT",
                                { minimumFractionDigits: 2 },
                              )}
                            </td>
                            <td className="text-center fw-bold">
                              {fam.includes("ALLUMINIO") ? (
                                <SpkBadge variant="primary">
                                  {(
                                    agente.famiglie[fam]?.q || 0
                                  ).toLocaleString("it-IT")}{" "}
                                  Kg
                                </SpkBadge>
                              ) : fam.includes("ACCESSORI") ? (
                                <SpkBadge variant="success">
                                  {(
                                    agente.famiglie[fam]?.q || 0
                                  ).toLocaleString("it-IT")}{" "}
                                  Pz
                                </SpkBadge>
                              ) : (
                                <span className="text-muted">
                                  {(
                                    agente.famiglie[fam]?.q || 0
                                  ).toLocaleString("it-IT")}
                                </span>
                              )}
                            </td>
                          </Fragment>
                        ))}
                        <td className="text-end fw-bold text-primary bg-primary-transparent">
                          €{" "}
                          {agente.totVal.toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      {openAgents.has(agente.nome) &&
                        Object.values(agente.clienti).map((cli, idx) => (
                          <tr key={idx} className="table-hover">
                            <td
                              className="ps-5 text-muted text-uppercase"
                              style={{ fontSize: "10px" }}
                            >
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
                                <td className="text-center">
                                  {fam.includes("ALLUMINIO") ? (
                                    <SpkBadge variant="info-transparent">
                                      {(
                                        cli.famiglie[fam]?.q || 0
                                      ).toLocaleString("it-IT")}{" "}
                                      Kg
                                    </SpkBadge>
                                  ) : fam.includes("ACCESSORI") ? (
                                    <SpkBadge variant="success-transparent">
                                      {(
                                        cli.famiglie[fam]?.q || 0
                                      ).toLocaleString("it-IT")}{" "}
                                      Pz
                                    </SpkBadge>
                                  ) : (
                                    <span className="text-muted">
                                      {(
                                        cli.famiglie[fam]?.q || 0
                                      ).toLocaleString("it-IT")}
                                    </span>
                                  )}
                                </td>
                              </Fragment>
                            ))}
                            <td className="text-end fw-medium text-muted">
                              €{" "}
                              {cli.totVal.toLocaleString("it-IT", {
                                minimumFractionDigits: 2,
                              })}
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

export default StatisticheVendutoCopral;
