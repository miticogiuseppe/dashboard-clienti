"use client";
import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import GlobalContext from "@/context/GlobalContext";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { fetchCsvCached } from "@/utils/resourceCache";
import Preloader from "@/utils/Preloader";
import { useRouter } from "next/navigation";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import { PiMoneyThin, PiPackageThin, PiScalesThin } from "react-icons/pi";

// ─── Formattatori ─────────────────────────────────────────────────────────────
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

// ─── Nomi mesi italiani (chiave = numero mese 1-12) ───────────────────────────
const MESI_NOMI = {
  1: "Gennaio",
  2: "Febbraio",
  3: "Marzo",
  4: "Aprile",
  5: "Maggio",
  6: "Giugno",
  7: "Luglio",
  8: "Agosto",
  9: "Settembre",
  10: "Ottobre",
  11: "Novembre",
  12: "Dicembre",
};

// ─── Componente riga multiselect ──────────────────────────────────────────────
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

// ─── Barra di ricerca interna al dropdown ─────────────────────────────────────
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

const AcquistatoPage = () => {
  const { username } = useContext(GlobalContext);

  const router = useRouter();

  const [session, setSession] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sheetData, setSheetData] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);

  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  // ─── Ricerche interne ai dropdown ────────────────────────────────────────
  const [supplierSearch, setSupplierSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [monthSearch, setMonthSearch] = useState("");

  // ─── Utils ────────────────────────────────────────────────────────────────
  const cleanValue = (val) => {
    const s = String(val || "").trim();
    if (!s || s.toUpperCase().includes("INESISTENTE")) return "VUOTO";
    return s;
  };

  const normalizaFamiglia = (famRaw) => {
    let f = famRaw.toUpperCase().trim();
    if (f === "EFFETTO LEGNO ACCIAIO" || f === "EFFETTO LEGNO/ACCIAIO") {
      return "EFF. LGN/ACC.";
    }
    return f;
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

  const toggleFamily = (nome) => {
    const next = new Set(openFamilies);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    setOpenFamilies(next);
  };

  // ─── Toggle fornitore ─────────────────────────────────────────────────────
  const toggleSupplier = (s) => {
    setSelectedSuppliers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const toggleAllSuppliers = (filtered) => {
    const allSelected = filtered.every((s) => selectedSuppliers.includes(s));
    if (allSelected) {
      setSelectedSuppliers((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedSuppliers((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  // ─── Toggle famiglia ──────────────────────────────────────────────────────
  const toggleFamilyFilter = (f) => {
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

  // ─── Toggle anno ──────────────────────────────────────────────────────────
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

  // ─── Toggle mese (fa riferimento alla colonna "MESE" dell'Excel) ──────────
  const toggleMonth = (m) => {
    setSelectedMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const toggleAllMonths = (filtered) => {
    const allSelected = filtered.every((m) => selectedMonths.includes(m));
    if (allSelected) {
      setSelectedMonths((prev) => prev.filter((x) => !filtered.includes(x)));
    } else {
      setSelectedMonths((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role !== "DIREZIONE") {
        router.push("/dashboard/copral");
        return;
      }

      setSession(sessionData?.user ?? null);
      setIsAuthorized(true);

      try {
        const json = await fetchCsvCached(
          "/api/fetch-excel-json?id=STATISTICA_ACQUISTATO",
          undefined,
          username,
        );
        const rawData = json?.data ?? [];

        // ── DEBUG temporaneo: verifica nomi colonne e valori ──
        if (rawData.length > 0) {
          console.log("CHIAVI:", Object.keys(rawData[0]));
          console.log(
            "ANNO raw:",
            rawData[0]["ANNO"],
            typeof rawData[0]["ANNO"],
          );
          console.log(
            "VALORE raw:",
            rawData[0]["Valore di uno o piu' sconti"],
            typeof rawData[0]["Valore di uno o piu' sconti"],
          );

          // ── DEBUG: tutti i valori unici di ANNO e MESE presenti nel file ──
          const anniUnici = [...new Set(rawData.map((r) => r["ANNO"]))];
          console.log("ANNI UNICI RAW:", anniUnici);

          const mesiUnici = [...new Set(rawData.map((r) => r["MESE"]))];
          console.log("MESI UNICI RAW:", mesiUnici);
        }

        const parsedData = rawData.map((row) => {
          let dateObj = null;
          const raw = row["Data"];
          if (raw) {
            if (typeof raw === "number") {
              dateObj = new Date((raw - 25569) * 86400 * 1000);
            } else {
              dateObj = new Date(raw);
            }
            dateObj.setHours(0, 0, 0, 0);
          }

          // ── Anno: arrotonda per eliminare decimali tipo 2026.00 ──
          const annoRaw = row["ANNO"] ?? null;
          const _anno =
            annoRaw !== null
              ? Math.round(Number(annoRaw))
              : (dateObj?.getFullYear() ?? null);

          // ── Mese: legge dalla colonna "MESE" dell'Excel, arrotonda per sicurezza ──
          const meseRaw = row["MESE"] ?? null;
          const _mese =
            meseRaw !== null
              ? Math.round(Number(meseRaw))
              : dateObj
                ? dateObj.getMonth() + 1
                : null;

          return {
            ...row,
            DataObj: dateObj,
            // ── Nome esatto colonna valore confermato da console ──
            _valore: parseFloat(row["Valore di uno o piu' sconti"]) || 0,
            // ── Quantità principale ──
            _qta: parseFloat(row["Quantita'"]) || 0,
            // ── Quantità secondaria (nuova colonna) ──
            _qta2: parseFloat(row["Qta 2"]) || 0,
            _anno,
            _mese,
          };
        });

        setSheetData(parsedData);
      } catch {
        setSheetData([]);
      } finally {
        setIsFetching(false);
      }
    };

    init();
  }, [router]);

  // ─── Anni disponibili (usa _anno normalizzato) ────────────────────────────
  const uniqueYears = useMemo(() => {
    if (!sheetData?.length) return [];
    const years = [
      ...new Set(
        sheetData
          .map((r) => r._anno)
          .filter((y) => y !== undefined && y !== null && !isNaN(y)),
      ),
    ].sort((a, b) => b - a);
    return years;
  }, [sheetData]);

  // ─── Mesi disponibili (usa _mese dalla colonna "MESE", ordinati 1→12) ─────
  const uniqueMonths = useMemo(() => {
    if (!sheetData?.length) return [];
    return [
      ...new Set(
        sheetData
          .map((r) => r._mese)
          .filter((m) => m !== undefined && m !== null && !isNaN(m)),
      ),
    ].sort((a, b) => a - b);
  }, [sheetData]);

  // ─── Dropdown dinamici ────────────────────────────────────────────────────
  const uniqueSuppliers = useMemo(() => {
    if (!sheetData?.length) return [];
    return [
      ...new Set(
        sheetData.map((r) => cleanValue(r["Descrizione Cliente/Fornitore"])),
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [sheetData]);

  const uniqueFamiliesList = useMemo(() => {
    if (!sheetData?.length) return [];
    const list = [
      ...new Set(
        sheetData.map((r) =>
          normalizaFamiglia(cleanValue(r["Descrizione Famiglia"])),
        ),
      ),
    ].filter(Boolean);
    const sorted = list.filter((f) => f !== "VUOTO" && f !== "ALTRO").sort();
    const tail = ["VUOTO", "ALTRO"].filter((f) => list.includes(f));
    return [...sorted, ...tail];
  }, [sheetData]);

  // ─── Liste filtrate per ricerca interna ───────────────────────────────────
  const filteredSuppliersList = useMemo(() => {
    if (!supplierSearch) return uniqueSuppliers;
    const t = supplierSearch.toLowerCase();
    return uniqueSuppliers.filter((s) => s.toLowerCase().includes(t));
  }, [uniqueSuppliers, supplierSearch]);

  const filteredFamiliesList = useMemo(() => {
    if (!familySearch) return uniqueFamiliesList;
    const t = familySearch.toLowerCase();
    return uniqueFamiliesList.filter((f) => f.toLowerCase().includes(t));
  }, [uniqueFamiliesList, familySearch]);

  const filteredYearsList = useMemo(() => {
    if (!yearSearch) return uniqueYears;
    return uniqueYears.filter((y) => String(y).includes(yearSearch.trim()));
  }, [uniqueYears, yearSearch]);

  // ─── Lista mesi filtrata per ricerca interna (cerca per nome mese) ────────
  const filteredMonthsList = useMemo(() => {
    if (!monthSearch) return uniqueMonths;
    const t = monthSearch.toLowerCase();
    return uniqueMonths.filter((m) => MESI_NOMI[m]?.toLowerCase().includes(t));
  }, [uniqueMonths, monthSearch]);

  // ─── Label toggle ─────────────────────────────────────────────────────────
  const supplierToggleLabel =
    selectedSuppliers.length === 0
      ? "Tutti i Fornitori"
      : selectedSuppliers.length === 1
        ? selectedSuppliers[0]
        : `${selectedSuppliers.length} Fornitori`;

  const familyToggleLabel =
    selectedFamilies.length === 0
      ? "Tutte le Famiglie"
      : selectedFamilies.length === 1
        ? selectedFamilies[0]
        : `${selectedFamilies.length} Famiglie`;

  const yearToggleLabel =
    selectedYears.length === 0
      ? "Tutti gli Anni"
      : selectedYears.length === 1
        ? String(selectedYears[0])
        : `${selectedYears.length} Anni`;

  // ─── Label toggle mese ────────────────────────────────────────────────────
  const monthToggleLabel =
    selectedMonths.length === 0
      ? "Tutti i Mesi"
      : selectedMonths.length === 1
        ? MESI_NOMI[selectedMonths[0]]
        : `${selectedMonths.length} Mesi`;

  // ─── Aggregazione dati ────────────────────────────────────────────────────
  const { matrixData, kpis } = useMemo(() => {
    if (!sheetData || !sheetData.length) return { matrixData: [], kpis: {} };

    let start = null;
    let end = null;
    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const grouped = {};

    // ── Totali separati per Qta e Qta2 su alluminio e accessori ──
    let globalVal = 0,
      globalAlmQ = 0,
      globalAlmQ2 = 0,
      globalAccQ = 0,
      globalAccQ2 = 0;

    sheetData.forEach((row) => {
      const fornitoreNome = cleanValue(row["Descrizione Cliente/Fornitore"]);
      const famRaw = cleanValue(row["Descrizione Famiglia"]);

      // ── Filtro per intervallo date ──
      if (start && end) {
        const d = row.DataObj;
        if (!d || d < start || d > end) return;
      }

      // ── Filtro per anno (usa _anno normalizzato) ──
      if (selectedYears.length > 0) {
        if (!selectedYears.includes(row._anno)) return;
      }

      // ── Filtro per mese (usa _mese dalla colonna "MESE" dell'Excel) ──
      if (selectedMonths.length > 0) {
        if (!selectedMonths.includes(row._mese)) return;
      }

      if (
        selectedSuppliers.length > 0 &&
        !selectedSuppliers.includes(fornitoreNome)
      )
        return;

      const famiglia = normalizaFamiglia(famRaw);
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(famiglia))
        return;

      // ── Usa i valori normalizzati in fase di parse ──
      const valore = row._valore;
      const qta = row._qta;
      const qta2 = row._qta2;

      globalVal += valore;

      // ── Separa qta e qta2 per alluminio ──
      if (famiglia.includes("ALLUMINIO")) {
        globalAlmQ += qta;
        globalAlmQ2 += qta2;
      }
      // ── Separa qta e qta2 per accessori ──
      if (famiglia.includes("ACCESSORI")) {
        globalAccQ += qta;
        globalAccQ2 += qta2;
      }

      if (!grouped[famiglia]) {
        grouped[famiglia] = {
          nome: famiglia,
          fornitori: {},
          totVal: 0,
          totQ: 0,
          totQ2: 0,
        };
      }

      if (!grouped[famiglia].fornitori[fornitoreNome]) {
        grouped[famiglia].fornitori[fornitoreNome] = {
          nome: fornitoreNome,
          totVal: 0,
          totQ: 0,
          totQ2: 0,
        };
      }

      grouped[famiglia].fornitori[fornitoreNome].totVal += valore;
      grouped[famiglia].fornitori[fornitoreNome].totQ += qta;
      grouped[famiglia].fornitori[fornitoreNome].totQ2 += qta2;
      grouped[famiglia].totVal += valore;
      grouped[famiglia].totQ += qta;
      grouped[famiglia].totQ2 += qta2;
    });

    return {
      matrixData: Object.values(grouped).sort((a, b) => {
        if (a.nome === "ALTRO") return 1;
        if (b.nome === "ALTRO") return -1;
        if (a.nome === "VUOTO") return 1;
        if (b.nome === "VUOTO") return -1;
        return a.nome.localeCompare(b.nome);
      }),
      // ── Esporta tutti i totali separati ──
      kpis: { globalVal, globalAlmQ, globalAlmQ2, globalAccQ, globalAccQ2 },
    };
  }, [
    sheetData,
    startDate,
    endDate,
    selectedSuppliers,
    selectedFamilies,
    selectedYears,
    selectedMonths, // ── aggiunto ──
  ]);

  // ─── Ricerca tabella ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm) return matrixData;
    const t = searchTerm.toLowerCase();
    return matrixData
      .map((fam) => {
        if (fam.nome.toLowerCase().includes(t)) return fam;
        const fornitoriFiltrati = Object.values(fam.fornitori).filter((f) =>
          f.nome.toLowerCase().includes(t),
        );
        if (fornitoriFiltrati.length) {
          return {
            ...fam,
            fornitori: Object.fromEntries(
              fornitoriFiltrati.map((f) => [f.nome, f]),
            ),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [matrixData, searchTerm]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isFetching) return <Preloader show={true} />;
  if (!isAuthorized) return null;

  const hasActiveFilters =
    startDate !== null ||
    selectedSuppliers.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedYears.length > 0 ||
    selectedMonths.length > 0; // ── aggiunto ──

  const dynamicCards = [
    {
      id: 1,
      title: "Acquistato Totale",
      count: fmtEuro(kpis.globalVal),
      svgIcon: <PiMoneyThin />,
      backgroundColor: "primary svg-white",
    },
    {
      id: 2,
      title: "Totale Alluminio",
      // ── Qta + Qta2 sommati per la card ──
      count: fmtQty(kpis.globalAlmQ + kpis.globalAlmQ2, "Kg"),
      svgIcon: <PiScalesThin />,
      backgroundColor: "primary3 svg-white",
    },
    {
      id: 3,
      title: "Totale Accessori",
      // ── Qta + Qta2 sommati per la card ──
      count: fmtQty(kpis.globalAccQ + kpis.globalAccQ2, "Pz"),
      svgIcon: <PiPackageThin />,
      backgroundColor: "info svg-white",
    },
  ];

  return (
    <>
      <Seo title={"Statistiche Acquistato Copral"} />
      <Pageheader
        title="Statistiche Acquistato"
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

          {/* DROPDOWN MESE — filtra sulla colonna "MESE" dell'Excel */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={monthToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "180px" }}>
              <DropdownSearch
                value={monthSearch}
                onChange={setMonthSearch}
                placeholder="Cerca mese..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti i Mesi"
                  bold
                  checked={
                    filteredMonthsList.length > 0 &&
                    filteredMonthsList.every((m) => selectedMonths.includes(m))
                  }
                  onToggle={() => toggleAllMonths(filteredMonthsList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredMonthsList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredMonthsList.map((m) => (
                    <MultiSelectItem
                      key={m}
                      label={MESI_NOMI[m]}
                      checked={selectedMonths.includes(m)}
                      onToggle={() => toggleMonth(m)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {/* DROPDOWN FORNITORI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border text-muted no-caret"
            Toggletext={supplierToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div style={{ minWidth: "260px" }}>
              <DropdownSearch
                value={supplierSearch}
                onChange={setSupplierSearch}
                placeholder="Cerca fornitore..."
              />
              <Dropdown.Divider className="my-1" />
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <MultiSelectItem
                  label="Tutti i Fornitori"
                  bold
                  checked={
                    filteredSuppliersList.length > 0 &&
                    filteredSuppliersList.every((s) =>
                      selectedSuppliers.includes(s),
                    )
                  }
                  onToggle={() => toggleAllSuppliers(filteredSuppliersList)}
                />
                <Dropdown.Divider className="my-1" />
                {filteredSuppliersList.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    Nessun risultato
                  </div>
                ) : (
                  filteredSuppliersList.map((s) => (
                    <MultiSelectItem
                      key={s}
                      label={s}
                      checked={selectedSuppliers.includes(s)}
                      onToggle={() => toggleSupplier(s)}
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
                      onToggle={() => toggleFamilyFilter(f)}
                    />
                  ))
                )}
              </div>
            </div>
          </SpkDropdown>

          {/* RESET */}
          {hasActiveFilters && (
            <button
              className="btn btn-danger-light btn-sm btn-icon"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedSuppliers([]);
                setSelectedFamilies([]);
                setSelectedYears([]);
                setSelectedMonths([]); // ── aggiunto ──
                setSupplierSearch("");
                setFamilySearch("");
                setYearSearch("");
                setMonthSearch(""); // ── aggiunto ──
              }}
              title="Reset filtri"
            >
              <i className="ti ti-refresh"></i>
            </button>
          )}
        </div>
      </Pageheader>

      {/* KPI CARDS */}
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

      {/* TABELLA */}
      <Row className="mt-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <Card.Title>Analisi Dettagliata Acquisti per Famiglia</Card.Title>
              <Form.Control
                type="text"
                placeholder="Cerca famiglia o fornitore..."
                className="form-control-sm w-25"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <div className="table-responsive border rounded">
                <table className="table table-bordered text-nowrap border-primary sticky-header mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th className="align-middle text-start border">
                        FAMIGLIA / FORNITORE
                      </th>
                      <th className="align-middle text-end border">
                        VALORE (€)
                      </th>
                      {/* Colonna Q.TÀ principale (ex "Quantita'") */}
                      <th className="align-middle text-end border">Q.TÀ</th>
                      {/* Colonna Q.TÀ 2 (nuova colonna "Qta 2") */}
                      <th className="align-middle text-end border">Q.TÀ 2</th>
                      <th className="align-middle text-end border">
                        TOTALE (€)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Nessun dato disponibile per i filtri selezionati.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((fam) => (
                        <Fragment key={fam.nome}>
                          {/* RIGA FAMIGLIA */}
                          <tr
                            className="table-primary-transparent"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleFamily(fam.nome)}
                          >
                            <th scope="row" className="fw-bold text-start">
                              <i
                                className={`ri-arrow-${
                                  openFamilies.has(fam.nome) ? "down" : "right"
                                }-s-line me-1 text-primary`}
                              ></i>
                              {fam.nome}
                            </th>
                            <td className="text-end fw-bold">
                              {fmtEuro(fam.totVal)}
                            </td>
                            {/* Q.TÀ principale — badge colorato per alluminio/accessori */}
                            <td className="text-end">
                              {fam.nome.includes("ALLUMINIO") ? (
                                <SpkBadge variant="primary">
                                  {fmtQty(fam.totQ || 0, "Kg")}
                                </SpkBadge>
                              ) : fam.nome.includes("ACCESSORI") ? (
                                <SpkBadge variant="success">
                                  {fmtQty(fam.totQ || 0, "Pz")}
                                </SpkBadge>
                              ) : (
                                <span className="text-muted">
                                  {fmtQty(fam.totQ || 0)}
                                </span>
                              )}
                            </td>
                            {/* Q.TÀ 2 — badge colorato per alluminio/accessori */}
                            <td className="text-end">
                              {fam.nome.includes("ALLUMINIO") ? (
                                <SpkBadge variant="primary">
                                  {fmtQty(fam.totQ2 || 0, "Kg")}
                                </SpkBadge>
                              ) : fam.nome.includes("ACCESSORI") ? (
                                <SpkBadge variant="success">
                                  {fmtQty(fam.totQ2 || 0, "Pz")}
                                </SpkBadge>
                              ) : fam.totQ2 > 0 ? (
                                <span className="text-muted">
                                  {fmtQty(fam.totQ2)}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="text-end fw-bold text-primary bg-primary-transparent">
                              {fmtEuro(fam.totVal)}
                            </td>
                          </tr>

                          {/* RIGHE FORNITORI */}
                          {openFamilies.has(fam.nome) &&
                            Object.values(fam.fornitori)
                              .sort((a, b) => b.totVal - a.totVal)
                              .map((fornitore) => (
                                <tr
                                  key={fornitore.nome}
                                  className="table-hover"
                                >
                                  <td
                                    className="ps-5 text-muted text-uppercase text-start"
                                    style={{ fontSize: "10px" }}
                                  >
                                    <i className="ri-corner-down-right-line me-2"></i>
                                    {fornitore.nome}
                                  </td>
                                  <td className="text-end text-muted">
                                    {fmtEuro(fornitore.totVal)}
                                  </td>
                                  {/* Q.TÀ principale fornitore */}
                                  <td className="text-end text-muted">
                                    {fmtQty(fornitore.totQ || 0)}
                                  </td>
                                  {/* Q.TÀ 2 fornitore */}
                                  <td className="text-end text-muted">
                                    {fornitore.totQ2 > 0
                                      ? fmtQty(fornitore.totQ2)
                                      : "—"}
                                  </td>
                                  <td className="text-end fw-medium text-muted">
                                    {fmtEuro(fornitore.totVal)}
                                  </td>
                                </tr>
                              ))}
                        </Fragment>
                      ))
                    )}

                    {/* TOTALE COMPLESSIVO */}
                    <tr className="table-dark">
                      <th scope="row" className="text-start">
                        TOTALE COMPLESSIVO
                      </th>
                      <td className="text-end fw-bold">
                        {fmtEuro(kpis.globalVal)}
                      </td>
                      {/* Q.TÀ totale: alluminio Kg / accessori Pz (solo qta principale) */}
                      <td className="text-end fw-bold">
                        {fmtQty(kpis.globalAlmQ || 0, "Kg")} /{" "}
                        {fmtQty(kpis.globalAccQ || 0, "Pz")}
                      </td>
                      {/* Q.TÀ 2 totale: alluminio Kg / accessori Pz (solo qta2) */}
                      <td className="text-end fw-bold">
                        {fmtQty(kpis.globalAlmQ2 || 0, "Kg")} /{" "}
                        {fmtQty(kpis.globalAccQ2 || 0, "Pz")}
                      </td>
                      <td className="text-end fw-bold">
                        {fmtEuro(kpis.globalVal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AcquistatoPage;
