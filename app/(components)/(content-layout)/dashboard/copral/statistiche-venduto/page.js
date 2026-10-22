"use client";

import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import GlobalContext from "@/context/GlobalContext";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
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

const StatisticheVendutoCopral = () => {
  const { username } = useContext(GlobalContext);

  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [openAgents, setOpenAgents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  const [agentSearch, setAgentSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
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
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else if (dates.length === 0) {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const toggleAgentRow = (nome) => {
    const next = new Set(openAgents);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenAgents(next);
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

  const uniqueCustomers = useMemo(() => {
    if (!sheetData) return [];
    const source =
      selectedAgents.length > 0
        ? sheetData.filter((r) =>
            selectedAgents.includes(cleanValue(r["Descrizione Agente"])),
          )
        : sheetData;
    return [
      ...new Set(
        source.map((r) => cleanValue(r["Descrizione Cliente/Fornitore"])),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [sheetData, selectedAgents]);

  const filteredYearsList = useMemo(() => {
    if (!yearSearch) return uniqueYears;
    return uniqueYears.filter((y) => String(y).includes(yearSearch.trim()));
  }, [uniqueYears, yearSearch]);

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

  const filteredCustomersList = useMemo(() => {
    if (!customerSearch) return uniqueCustomers;
    const t = customerSearch.toLowerCase();
    return uniqueCustomers.filter((c) => c.toLowerCase().includes(t));
  }, [uniqueCustomers, customerSearch]);

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
  };
  const toggleAllFamilies = (filtered) => {
    const allSelected = filtered.every((f) => selectedFamilies.includes(f));
    if (allSelected) {
      setSelectedFamilies((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedFamilies((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const toggleCustomer = (c) => {
    setSelectedCustomers((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };
  const toggleAllCustomers = (filtered) => {
    const allSelected = filtered.every((c) => selectedCustomers.includes(c));
    if (allSelected) {
      setSelectedCustomers((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedCustomers((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  const yearToggleLabel =
    selectedYears.length === 0
      ? "Tutti gli Anni"
      : selectedYears.length === 1
        ? String(selectedYears[0])
        : `${selectedYears.length} Anni`;

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

  const customerToggleLabel =
    selectedCustomers.length === 0
      ? "Tutti i Clienti"
      : selectedCustomers.length === 1
        ? selectedCustomers[0]
        : `${selectedCustomers.length} Clienti`;

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
      const agenteNome = cleanValue(row["Descrizione Agente"]);
      const clienteNome = cleanValue(row["Descrizione Cliente/Fornitore"]);
      const famRaw = cleanValue(row["Descrizione Famiglia"]);

      if (startDate && endDate) {
        const d = row.DataObj;
        if (!d || d < startDate || d > endDate) return;
      }

      if (selectedYears.length > 0) {
        const yr = row.DataObj?.getFullYear();
        if (!selectedYears.includes(yr)) return;
      }

      if (selectedAgents.length > 0 && !selectedAgents.includes(agenteNome))
        return;
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(famRaw))
        return;
      if (
        selectedCustomers.length > 0 &&
        !selectedCustomers.includes(clienteNome)
      )
        return;

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
    selectedAgents,
    selectedFamilies,
    selectedCustomers,
    selectedYears,
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
  }, [filteredData, allFamilies]);

  const hasActiveFilters =
    startDate !== null ||
    selectedAgents.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedCustomers.length > 0 ||
    selectedYears.length > 0;

  if (isFetching) return <Preloader show={true} />;

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

          {/* DROPDOWN CLIENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={customerToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "260px" }}>
              <DropdownSearch
                value={customerSearch}
                onChange={setCustomerSearch}
                placeholder="Cerca cliente..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti i Clienti"
                  bold
                  checked={
                    filteredCustomersList.length > 0 &&
                    filteredCustomersList.every((c) =>
                      selectedCustomers.includes(c),
                    )
                  }
                  onToggle={() => toggleAllCustomers(filteredCustomersList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredCustomersList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredCustomersList.map((c) => (
                    <MultiSelectItem
                      key={c}
                      label={c}
                      checked={selectedCustomers.includes(c)}
                      onToggle={() => toggleCustomer(c)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {hasActiveFilters && (
            <button
              className="btn btn-danger-light btn-sm btn-icon"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedAgents([]);
                setSelectedFamilies([]);
                setSelectedCustomers([]);
                setSelectedYears([]);
                setAgentSearch("");
                setFamilySearch("");
                setCustomerSearch("");
                setYearSearch("");
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
              {/* Tabella */}
              <div
                ref={tableWrapRef}
                className="table-responsive border rounded"
              >
                <table className="table table-bordered text-nowrap border-primary sticky-header mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th
                        rowSpan="2"
                        className="align-middle text-start border"
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
                      <th rowSpan="2" className="align-middle text-end border">
                        TOTALE (€)
                      </th>
                    </tr>
                    <tr>
                      {allFamilies.map((fam) => (
                        <Fragment key={`${fam}-sub`}>
                          <th
                            className="text-end border"
                            style={{ fontSize: "0.7rem" }}
                          >
                            VALORE (€)
                          </th>
                          <th
                            className="text-end border"
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
                        <tr
                          className="table-primary-transparent"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleAgentRow(ag.nome)}
                        >
                          <th scope="row" className="fw-bold text-start">
                            <i
                              className={`ri-arrow-${
                                openAgents.has(ag.nome) ? "down" : "right"
                              }-s-line me-1 text-primary`}
                            ></i>
                            {ag.nome}
                          </th>
                          {allFamilies.map((fam) => (
                            <Fragment key={fam}>
                              <td className="text-end fw-bold">
                                {fmtEuro(ag.famiglie[fam]?.v || 0)}
                              </td>
                              <td className="text-end fw-bold">
                                {fam.includes("ALLUMINIO") ? (
                                  <SpkBadge variant="primary">
                                    {fmtQty(ag.famiglie[fam]?.q || 0, "Kg")}
                                  </SpkBadge>
                                ) : fam.includes("ACCESSORI") ? (
                                  <SpkBadge variant="success">
                                    {fmtQty(ag.famiglie[fam]?.q || 0, "Pz")}
                                  </SpkBadge>
                                ) : (
                                  <span className="text-muted">
                                    {fmtQty(ag.famiglie[fam]?.q || 0)}
                                  </span>
                                )}
                              </td>
                            </Fragment>
                          ))}
                          <td className="text-end fw-bold text-primary bg-primary-transparent">
                            {fmtEuro(ag.totVal)}
                          </td>
                        </tr>

                        {openAgents.has(ag.nome) &&
                          Object.values(ag.clienti)
                            .sort((a, b) => b.totVal - a.totVal)
                            .map((cli) => (
                              <tr key={cli.nome} className="table-hover">
                                <td
                                  className="ps-5 text-muted text-uppercase text-start"
                                  style={{ fontSize: "10px" }}
                                >
                                  <i className="ri-corner-down-right-line me-2"></i>
                                  {cli.nome}
                                </td>
                                {allFamilies.map((fam) => (
                                  <Fragment key={fam}>
                                    <td className="text-end text-muted">
                                      {fmtEuro(cli.famiglie[fam]?.v || 0)}
                                    </td>
                                    <td className="text-end text-muted">
                                      {fmtQty(cli.famiglie[fam]?.q || 0)}
                                    </td>
                                  </Fragment>
                                ))}
                                <td className="text-end fw-medium text-muted">
                                  {fmtEuro(cli.totVal)}
                                </td>
                              </tr>
                            ))}
                      </Fragment>
                    ))}

                    <tr className="table-dark">
                      <th scope="row" className="text-start">
                        TOTALE COMPLESSIVO
                      </th>
                      {allFamilies.map((fam) => (
                        <Fragment key={fam}>
                          <td className="text-end fw-bold">
                            {fmtEuro(totalsByFamily[fam]?.v || 0)}
                          </td>
                          <td className="text-end fw-bold">
                            {fmtQty(totalsByFamily[fam]?.q || 0)}
                          </td>
                        </Fragment>
                      ))}
                      <td className="text-end fw-bold">
                        {fmtEuro(kpis.globalVal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
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

export default StatisticheVendutoCopral;
