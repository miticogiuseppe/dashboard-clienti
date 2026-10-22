"use client";

import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import GlobalContext from "@/context/GlobalContext";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import { fetchCsvCached } from "@/utils/resourceCache";
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import { PiMoneyThin, PiPackageThin, PiScalesThin } from "react-icons/pi";

const formatNum = (val, decimals = 2) => {
  const n = Number(val) || 0;
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;
};

const fmtEuro = (val) => `€ ${formatNum(val, 2)}`;
const fmtQty = (val, unit = "") =>
  `${formatNum(val, 2)}${unit ? ` ${unit}` : ""}`;

const MultiSelectItem = ({ label, checked, onToggle, bold = false }) => (
  <Dropdown.Item
    as="div"
    onClick={(e) => e.stopPropagation()}
    style={{ cursor: "pointer" }}
    className="d-flex align-items-center gap-2 px-3 py-2"
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      onClick={(e) => e.stopPropagation()}
      className="form-check-input m-0 flex-shrink-0"
      style={{ cursor: "pointer" }}
      id={`chk-${label}`}
    />
    <label
      htmlFor={`chk-${label}`}
      className={`mb-0 w-100 ${bold ? "fw-semibold" : ""}`}
      style={{ cursor: "pointer" }}
    >
      {label}
    </label>
  </Dropdown.Item>
);

const DropdownSearch = ({ value, onChange, placeholder = "Cerca..." }) => (
  <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
    <Form.Control
      type="text"
      size="sm"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      autoComplete="off"
    />
  </div>
);

const AnalisiPerFamiglia = () => {
  const { username } = useContext(GlobalContext);

  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  const [agentSearch, setAgentSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");

  const tableWrapRef = useRef(null);
  const mirrorRef = useRef(null);

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
        const json = await fetchCsvCached(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_AGENTE",
          { signal: controller.signal },
          username,
        );
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

  const uniqueYears = useMemo(() => {
    if (!sheetData?.length) return [];
    return [
      ...new Set(
        sheetData
          .map((r) => r.DataObj?.getFullYear())
          .filter((y) => y !== undefined && y !== null && !isNaN(y)),
      ),
    ].sort((a, b) => b - a);
  }, [sheetData]);

  const uniqueAgents = useMemo(() => {
    if (!sheetData) return [];
    return [
      ...new Set(sheetData.map((r) => cleanValue(r["Descrizione Agente"]))),
    ]
      .filter(Boolean)
      .sort();
  }, [sheetData]);

  const uniqueFamiliesList = useMemo(() => {
    if (!sheetData) return [];
    return [
      ...new Set(sheetData.map((r) => cleanValue(r["Descrizione Famiglia"]))),
    ]
      .filter(Boolean)
      .sort();
  }, [sheetData]);

  const uniqueGroupsList = useMemo(() => {
    if (!sheetData) return [];
    const source =
      selectedFamilies.length > 0
        ? sheetData.filter((r) =>
            selectedFamilies.includes(cleanValue(r["Descrizione Famiglia"])),
          )
        : sheetData;
    return [...new Set(source.map((r) => cleanValue(r["Descrizione Gruppo"])))]
      .filter(Boolean)
      .sort();
  }, [sheetData, selectedFamilies]);

  const filteredAgentsList = useMemo(() => {
    if (!agentSearch) return uniqueAgents;
    const t = agentSearch.toLowerCase();
    return uniqueAgents.filter((a) => a.toLowerCase().includes(t));
  }, [uniqueAgents, agentSearch]);

  const filteredFamiliesList = useMemo(() => {
    if (!familySearch) return uniqueFamiliesList;
    const t = familySearch.toLowerCase();
    return uniqueFamiliesList.filter((f) => f.toLowerCase().includes(t));
  }, [uniqueFamiliesList, familySearch]);

  const filteredGroupsList = useMemo(() => {
    if (!groupSearch) return uniqueGroupsList;
    const t = groupSearch.toLowerCase();
    return uniqueGroupsList.filter((g) => g.toLowerCase().includes(t));
  }, [uniqueGroupsList, groupSearch]);

  const filteredYearsList = useMemo(() => {
    if (!yearSearch) return uniqueYears;
    return uniqueYears.filter((y) => String(y).includes(yearSearch.trim()));
  }, [uniqueYears, yearSearch]);

  const toggleAgent = (a) => {
    setSelectedAgents((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };
  const toggleAllAgents = (filtered) => {
    const allSelected = filtered.every((a) => selectedAgents.includes(a));
    if (allSelected) {
      setSelectedAgents((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedAgents((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const toggleFamily = (f) => {
    setSelectedFamilies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
    setSelectedGroups([]);
  };
  const toggleAllFamilies = (filtered) => {
    const allSelected = filtered.every((f) => selectedFamilies.includes(f));
    if (allSelected) {
      setSelectedFamilies((prev) => prev.filter((x) => !filtered.includes(x)));
      setSelectedGroups([]);
    } else {
      setSelectedFamilies((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const toggleGroup = (g) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };
  const toggleAllGroups = (filtered) => {
    const allSelected = filtered.every((g) => selectedGroups.includes(g));
    if (allSelected) {
      setSelectedGroups((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedGroups((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const toggleYear = (y) => {
    setSelectedYears((prev) =>
      prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y],
    );
  };
  const toggleAllYears = (filtered) => {
    const allSelected = filtered.every((y) => selectedYears.includes(y));
    if (allSelected) {
      setSelectedYears((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedYears((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const toggleFamilyRow = (nome) => {
    const next = new Set(openFamilies);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenFamilies(next);
  };

  const agentToggleLabel =
    selectedAgents.length === 0
      ? "Tutti gli Agenti"
      : selectedAgents.length === 1
        ? selectedAgents[0]
        : `${selectedAgents.length} Agenti`;

  const familyToggleLabel =
    selectedFamilies.length === 0
      ? "Tutte le Famiglie"
      : selectedFamilies.length === 1
        ? selectedFamilies[0]
        : `${selectedFamilies.length} Famiglie`;

  const groupToggleLabel =
    selectedGroups.length === 0
      ? "Tutti i Gruppi"
      : selectedGroups.length === 1
        ? selectedGroups[0]
        : `${selectedGroups.length} Gruppi`;

  const yearToggleLabel =
    selectedYears.length === 0
      ? "Tutti gli Anni"
      : selectedYears.length === 1
        ? String(selectedYears[0])
        : `${selectedYears.length} Anni`;

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
      const agente = cleanValue(row["Descrizione Agente"]);
      const macro = cleanValue(row["Descrizione Famiglia"]).toUpperCase();
      const sotto = cleanValue(row["Descrizione Gruppo"]).toUpperCase();

      if (startDate && endDate) {
        const d = row.DataObj;
        if (!d || d < startDate || d > endDate) return;
      }

      if (selectedYears.length > 0) {
        const yr = row.DataObj?.getFullYear();
        if (!selectedYears.includes(yr)) return;
      }

      if (selectedAgents.length > 0 && !selectedAgents.includes(agente)) return;
      if (
        selectedFamilies.length > 0 &&
        !selectedFamilies.map((f) => f.toUpperCase()).includes(macro)
      )
        return;
      if (
        selectedGroups.length > 0 &&
        !selectedGroups.map((g) => g.toUpperCase()).includes(sotto)
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
    selectedAgents,
    selectedFamilies,
    selectedGroups,
    selectedYears,
  ]);

  const filteredMatrix = useMemo(() => {
    if (!searchTerm) return matrix;
    return matrix.filter((m) =>
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [matrix, searchTerm]);

  // ─── Sincronizzazione scrollbar mirror ────────────────────────────────────
  useEffect(() => {
    const wrapper = tableWrapRef.current;
    const mirror = mirrorRef.current;
    if (!wrapper || !mirror) return;

    const syncWidth = () => {
      const inner = wrapper.querySelector("table");
      if (inner && mirror.firstChild) {
        mirror.firstChild.style.width = inner.scrollWidth + "px";
      }
    };
    syncWidth();

    const onWrapperScroll = () => {
      if (!mirror._fromMirror) {
        mirror._fromWrapper = true;
        mirror.scrollLeft = wrapper.scrollLeft;
        mirror._fromWrapper = false;
      }
    };
    const onMirrorScroll = () => {
      if (!mirror._fromWrapper) {
        mirror._fromMirror = true;
        wrapper.scrollLeft = mirror.scrollLeft;
        mirror._fromMirror = false;
      }
    };

    wrapper.addEventListener("scroll", onWrapperScroll);
    mirror.addEventListener("scroll", onMirrorScroll);

    const ro = new ResizeObserver(syncWidth);
    ro.observe(wrapper);

    return () => {
      wrapper.removeEventListener("scroll", onWrapperScroll);
      mirror.removeEventListener("scroll", onMirrorScroll);
      ro.disconnect();
    };
  }, [filteredMatrix, allAgents]);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedAgents([]);
    setSelectedFamilies([]);
    setSelectedGroups([]);
    setSelectedYears([]);
    setSearchTerm("");
    setAgentSearch("");
    setFamilySearch("");
    setGroupSearch("");
    setYearSearch("");
  };

  const hasActiveFilters =
    startDate !== null ||
    selectedAgents.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedGroups.length > 0 ||
    selectedYears.length > 0;

  const dynamicCards = [
    {
      id: 1,
      title: "Fatturato Totale",
      count: fmtEuro(kpis.globalVal),
      svgIcon: <PiMoneyThin />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Totale Alluminio",
      count: fmtQty(kpis.globalAlmQ, "Kg"),
      svgIcon: <PiScalesThin />,
      backgroundColor: "primary3 svg-white",
    },
    {
      id: 3,
      title: "Totale Accessori",
      count: fmtQty(kpis.globalAccQ, "Pz"),
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

          {/* DROPDOWN ANNO */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={yearToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "180px" }}>
              <DropdownSearch
                value={yearSearch}
                onChange={setYearSearch}
                placeholder="Cerca anno..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti gli Anni"
                  bold
                  checked={
                    filteredYearsList.length > 0 &&
                    filteredYearsList.every((y) => selectedYears.includes(y))
                  }
                  onToggle={() => toggleAllYears(filteredYearsList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredYearsList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredYearsList.map((y) => (
                    <MultiSelectItem
                      key={y}
                      label={String(y)}
                      checked={selectedYears.includes(y)}
                      onToggle={() => toggleYear(y)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {/* DROPDOWN AGENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={agentToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "220px" }}>
              <DropdownSearch
                value={agentSearch}
                onChange={setAgentSearch}
                placeholder="Cerca agente..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti gli Agenti"
                  bold
                  checked={
                    filteredAgentsList.length > 0 &&
                    filteredAgentsList.every((a) => selectedAgents.includes(a))
                  }
                  onToggle={() => toggleAllAgents(filteredAgentsList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredAgentsList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredAgentsList.map((a) => (
                    <MultiSelectItem
                      key={a}
                      label={a}
                      checked={selectedAgents.includes(a)}
                      onToggle={() => toggleAgent(a)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {/* DROPDOWN FAMIGLIE */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={familyToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "220px" }}>
              <DropdownSearch
                value={familySearch}
                onChange={setFamilySearch}
                placeholder="Cerca famiglia..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutte le Famiglie"
                  bold
                  checked={
                    filteredFamiliesList.length > 0 &&
                    filteredFamiliesList.every((f) =>
                      selectedFamilies.includes(f),
                    )
                  }
                  onToggle={() => toggleAllFamilies(filteredFamiliesList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredFamiliesList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredFamiliesList.map((f) => (
                    <MultiSelectItem
                      key={f}
                      label={f}
                      checked={selectedFamilies.includes(f)}
                      onToggle={() => toggleFamily(f)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {/* DROPDOWN GRUPPI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={groupToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "220px" }}>
              <DropdownSearch
                value={groupSearch}
                onChange={setGroupSearch}
                placeholder="Cerca gruppo..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti i Gruppi"
                  bold
                  checked={
                    filteredGroupsList.length > 0 &&
                    filteredGroupsList.every((g) => selectedGroups.includes(g))
                  }
                  onToggle={() => toggleAllGroups(filteredGroupsList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredGroupsList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredGroupsList.map((g) => (
                    <MultiSelectItem
                      key={g}
                      label={g}
                      checked={selectedGroups.includes(g)}
                      onToggle={() => toggleGroup(g)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {hasActiveFilters && (
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
              {/* Tabella */}
              <div ref={tableWrapRef} className="table-responsive">
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
                  {filteredMatrix.map((macro) => (
                    <Fragment key={macro.nome}>
                      <tr
                        className="table-primary-transparent cursor-pointer"
                        onClick={() => toggleFamilyRow(macro.nome)}
                      >
                        <th scope="row" className="fw-bold text-start">
                          <i
                            className={`ri-arrow-${
                              openFamilies.has(macro.nome) ? "down" : "right"
                            }-s-line me-1 text-primary`}
                          ></i>
                          {macro.nome}
                        </th>
                        {allAgents.map((ag) => (
                          <Fragment key={ag}>
                            <td className="text-end fw-bold">
                              {fmtEuro(macro.agenti[ag]?.v || 0)}
                            </td>
                            <td className="text-end fw-bold">
                              {macro.nome.includes("ALLUMINIO") ? (
                                <SpkBadge variant="primary">
                                  {fmtQty(macro.agenti[ag]?.q || 0, "Kg")}
                                </SpkBadge>
                              ) : macro.nome.includes("ACCESSORI") ? (
                                <SpkBadge variant="success">
                                  {fmtQty(macro.agenti[ag]?.q || 0, "Pz")}
                                </SpkBadge>
                              ) : (
                                fmtQty(macro.agenti[ag]?.q || 0)
                              )}
                            </td>
                          </Fragment>
                        ))}
                        <td className="text-end fw-bold text-primary bg-primary-transparent">
                          {fmtEuro(macro.totV)}
                        </td>
                      </tr>

                      {openFamilies.has(macro.nome) &&
                        Object.values(macro.sotto).map((sotto) => (
                          <tr key={sotto.nome}>
                            <td
                              className="ps-5 text-muted text-uppercase text-start"
                              style={{ fontSize: "10px" }}
                            >
                              <i className="ri-corner-down-right-line me-2"></i>
                              {sotto.nome}
                            </td>
                            {allAgents.map((ag) => (
                              <Fragment key={ag}>
                                <td className="text-end text-muted">
                                  {fmtEuro(sotto.agenti[ag]?.v || 0)}
                                </td>
                                <td className="text-end text-muted">
                                  {fmtQty(sotto.agenti[ag]?.q || 0)}
                                </td>
                              </Fragment>
                            ))}
                            <td className="text-end text-muted">
                              {fmtEuro(sotto.totV)}
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  ))}

                  <tr className="table-dark">
                    <th scope="row" className="text-start">
                      TOTALE COMPLESSIVO
                    </th>
                    {allAgents.map((ag) => (
                      <Fragment key={ag}>
                        <td className="text-end fw-bold">
                          {fmtEuro(totalsByAgent[ag]?.v || 0)}
                        </td>
                        <td className="text-end fw-bold">
                          {fmtQty(totalsByAgent[ag]?.q || 0)}
                        </td>
                      </Fragment>
                    ))}
                    <td className="text-end fw-bold">
                      {fmtEuro(kpis.globalVal)}
                    </td>
                  </tr>
                </SpkTablescomponent>
              </div>

              {/* Scrollbar mirror SOTTO la tabella */}
              <div
                ref={mirrorRef}
                className="mirror-scrollbar"
                style={{
                  overflowX: "scroll",
                  overflowY: "hidden",
                  height: "8px",
                  marginTop: "6px",
                }}
              >
                <div style={{ height: "1px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AnalisiPerFamiglia;
