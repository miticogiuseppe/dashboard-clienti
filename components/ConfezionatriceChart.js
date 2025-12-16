"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- CONFIGURAZIONE DAYJS & CONSTANTI ---
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const DATE_FORMATS_TO_TRY = [
  "YYYY-MM-DD HH:mm:ss",
  "DD/MM/YYYY HH:mm",
  "M/D/YYYY H:mm",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
];

const COMMON_STYLES = {
  header: {
    padding: "10px 6px",
    fontWeight: 700,
    fontSize: 14,
    borderBottom: "1px solid #ddd",
    background: "#f8f9fa",
    textAlign: "center",
  },
  cell: {
    padding: "8px 6px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
};

// --- UTILITY ESTRATTE E COMPATTATE ---

const parseDate = (raw) => {
  if (!raw) return dayjs(null);
  try {
    if (typeof raw === "number" && raw > 1) {
      const d = XLSX.SSF.parse_date_code(raw);
      return dayjs(new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S));
    }
    if (typeof raw === "string") {
      for (const format of DATE_FORMATS_TO_TRY) {
        const tentative = dayjs(raw, format, true);
        if (tentative.isValid()) return tentative;
      }
    }
    return dayjs(raw);
  } catch (e) {
    return dayjs(null);
  }
};

const parseNum = (raw) => Number(String(raw || 0).replace(",", ".")) || 0;

/**
 * Formatta un numero nello stile italiano (separatore migliaia: ., decimale: ,).
 */
const formatNumber = (value) => {
  if (typeof value !== "number") return value;
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// --- FUNZIONE DI CARICAMENTO DATI Ottimizzata ---
const loadSheet = async (idOrUrl, providedTenant) => {
  const tenant =
    providedTenant ||
    (typeof window !== "undefined"
      ? window.location.pathname.split("/")[2]
      : null);
  const isApiPath = idOrUrl?.startsWith("/api/");
  const url = isApiPath
    ? idOrUrl
    : `/api/fetch-excel-json?id=${encodeURIComponent(idOrUrl)}`;
  const response = await fetch(url, {
    headers: tenant ? { "x-tenant": tenant } : {},
  });

  if (!response.ok) {
    let msg = `Errore HTTP ${response.status}`;
    try {
      msg = (await response.json())?.error ?? msg;
    } catch (_) {
      msg = await response.text();
    }
    throw new Error(`Impossibile leggere il file ${idOrUrl} -> ${msg}`);
  }

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  if (contentType.includes("application/json") || !isApiPath) {
    return await response.json();
  }

  const workbook = XLSX.read(new Uint8Array(await response.arrayBuffer()), {
    type: "array",
  });
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    defval: "",
  });
};

// --- COMPONENTE PRINCIPALE ---

const ConfezionatriceChart = ({ file, colonne, tenant }) => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchData = useCallback(async () => {
    if (!file) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const jsonSheet = await loadSheet(file, tenant);

      const normalized = jsonSheet.map((row) => ({
        ...row,
        _parsedDate: parseDate(row[colonne.dataOra]),
      }));

      setDataChart({ rows: normalized });
    } catch (err) {
      setErrorMsg(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [file, colonne.dataOra, tenant]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FILTRO E ORDINAMENTO
  const filtered = useMemo(() => {
    let f = dataChart?.rows || [];
    if (filterDate) {
      const selected = dayjs(filterDate);
      f = f.filter(
        (r) => r._parsedDate?.isValid() && r._parsedDate.isSame(selected, "day")
      );
    }
    return f.sort((a, b) => b._parsedDate.diff(a._parsedDate));
  }, [dataChart, filterDate]);

  // AGGREGAZIONE DATI GRAFICO
  const chartData = useMemo(() => {
    if (!filterDate || filtered.length === 0) return [];
    const aggregation = {};

    filtered.forEach((r) => {
      const key =
        r[colonne.descrizione] || r[colonne.bilancia] || "Sconosciuto";
      const pesoScaricato = parseNum(
        r[colonne.valorePeso] || r[colonne.valore]
      );
      const valoreRiservato = parseNum(r[colonne.valoreRiservato]);

      if (pesoScaricato > 0 || valoreRiservato > 0) {
        if (!aggregation[key]) {
          aggregation[key] = { name: key, "Peso Scaricato": 0, Riservato: 0 };
        }
        aggregation[key]["Peso Scaricato"] += pesoScaricato;
        aggregation[key]["Riservato"] += valoreRiservato;
      }
    });
    return Object.values(aggregation);
  }, [filtered, filterDate, colonne]);

  // --- RENDERING ---

  if (loading) return <div className="p-4 text-blue-600">Caricamento...</div>;
  if (errorMsg) return <div className="p-4 text-red-600">{errorMsg}</div>;
  if (!dataChart) return <div className="p-4">In attesa dati...</div>;

  return (
    <div style={{ padding: 32, width: "100%" }}>
      {/* 1. SELETTORE DATA E AZZERA FILTRO */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <div style={{ width: 240 }}>
          <label
            style={{
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 4,
              display: "block",
              color: "#333",
            }}
          >
            Seleziona giorno:
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "6px 8px",
              fontSize: 15,
            }}
          />
          <button
            type="button"
            onClick={() => setFilterDate("")}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "6px 8px",
              borderRadius: 6,
              background: "#f3f3f3",
              border: "1px solid #bbb",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Azzera filtro
          </button>
        </div>
      </div>

      {/* 2. GRAFICO A COLONNE */}
      <div
        style={{
          width: "100%",
          height: 350,
          marginBottom: 40,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          padding: 10,
        }}
      >
        <h3 style={{ margin: "0 0 10px 10px", color: "#555" }}>
          Produzione Confezionatrice
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                height={45}
                interval={0}
                style={{ fontSize: 11 }}
              />

              {/* === APPLICATA FORMATTAZIONE ALL'ASSE Y === */}
              <YAxis allowDecimals={false} tickFormatter={formatNumber} />

              {/* === APPLICATA FORMATTAZIONE AL TOOLTIP === */}
              <Tooltip formatter={formatNumber} />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: 10,
                  position: "relative",
                  marginTop: 10,
                }}
              />

              <Bar dataKey="Peso Scaricato" fill="#8884d8" />
              <Bar dataKey="Riservato" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: 50 }}>
            {filterDate
              ? "Nessun dato di produzione valido per il giorno selezionato."
              : "Seleziona una data per visualizzare l'aggregazione per Descrizione."}
          </div>
        )}
      </div>

      {/* 3. TABELLA DATI CONFEZIONATRICE */}
      <div
        style={{
          width: "100%",
          height: "100%",
          maxHeight: 420,
          overflowY: "auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          padding: 0,
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
        >
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              <th style={COMMON_STYLES.header}>Indice</th>
              <th style={COMMON_STYLES.header}>Data e Ora</th>
              <th style={COMMON_STYLES.header}>Peso Scaricato</th>
              <th style={COMMON_STYLES.header}>Bilancia</th>
              <th style={COMMON_STYLES.header}>Riservato</th>
              <th style={COMMON_STYLES.header}>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                  Nessun dato disponibile
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f7f7f9",
                    fontSize: 13,
                  }}
                >
                  <td style={COMMON_STYLES.cell}>
                    {r[colonne.indice] ?? i + 1}
                  </td>
                  <td style={COMMON_STYLES.cell}>
                    {r._parsedDate.isValid()
                      ? r._parsedDate.format("DD-MM-YYYY HH:mm")
                      : r[colonne.dataOra] ?? ""}
                  </td>
                  {/* === APPLICATA FORMATTAZIONE ALLA TABELLA (Peso Scaricato) === */}
                  <td style={COMMON_STYLES.cell}>
                    {formatNumber(
                      parseNum(r[colonne.valorePeso] ?? r[colonne.valore])
                    )}
                  </td>

                  <td style={COMMON_STYLES.cell}>{r[colonne.bilancia]}</td>

                  {/* === APPLICATA FORMATTAZIONE ALLA TABELLA (Riservato) === */}
                  <td style={COMMON_STYLES.cell}>
                    {formatNumber(parseNum(r[colonne.valoreRiservato]))}
                  </td>

                  <td
                    style={{
                      ...COMMON_STYLES.cell,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      maxWidth: 300,
                    }}
                  >
                    {r[colonne.descrizione]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfezionatriceChart;
