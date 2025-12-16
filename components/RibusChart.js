// File: RibusChart.js (Il Componente Core)

"use client";

import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Importazioni Recharts per il grafico
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

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Stili base (mantenuti)
const headerStyle = {
  padding: "10px 6px",
  fontWeight: 700,
  fontSize: 14,
  borderBottom: "1px solid #ddd",
  background: "#f8f9fa",
  textAlign: "center",
};

const cellStyle = {
  padding: "8px 6px",
  borderBottom: "1px solid #eee",
  textAlign: "center",
};

// Funzione per il caricamento del foglio (mantenuta)
const loadSheet = async (idOrUrl, providedTenant) => {
  const tenant = providedTenant
    ? providedTenant
    : typeof window !== "undefined"
    ? window.location.pathname.split("/")[2]
    : null;

  const isApiPath = typeof idOrUrl === "string" && idOrUrl.startsWith("/api/");
  const url = isApiPath
    ? idOrUrl
    : `/api/fetch-excel-json?id=${encodeURIComponent(idOrUrl)}`;

  const headers = tenant ? { "x-tenant": tenant } : {};

  const response = await fetch(url, { headers });
  if (!response.ok) {
    let msg;
    try {
      const clone = response.clone();
      const json = await clone.json();
      msg = json?.error ?? JSON.stringify(json);
    } catch (_) {
      const clone2 = response.clone();
      msg = await clone2.text();
    }
    throw new Error(
      `Impossibile trovare o leggere il file con id: ${idOrUrl} -> ${msg}`
    );
  }

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  if (contentType.includes("application/json") || isApiPath === false) {
    return await response.json();
  }

  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

const RibusChart = ({ file, colonne, tenant }) => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // CARICO E NORMALIZZO I DATI
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted || !file) return;
      try {
        setLoading(true);
        setErrorMsg("");

        const jsonSheet = await loadSheet(file, tenant);

        const normalized = jsonSheet.map((row) => {
          const rawDate = row[colonne.dataOra];
          let parsed = dayjs("");

          try {
            if (!rawDate) {
              parsed = dayjs.invalid();
            } else if (typeof rawDate === "number" && rawDate > 1) {
              const d = XLSX.SSF.parse_date_code(rawDate);
              parsed = dayjs(new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S));
            } else {
              parsed = dayjs(rawDate);
            }
          } catch (e) {
            parsed = dayjs.invalid();
          }

          return { ...row, _parsedDate: parsed };
        });

        if (isMounted) setDataChart({ rows: normalized });
      } catch (err) {
        if (isMounted) setErrorMsg(`Errore: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => (isMounted = false);
  }, [file, colonne.dataOra, tenant]);

  // FILTRO PER DATA E ORDINAMENTO DECRESCENTE (per avere l'ultimo orario in cima)
  const filtered = useMemo(() => {
    let f = dataChart?.rows || [];
    if (filterDate) {
      const selected = dayjs(filterDate);
      if (selected.isValid()) {
        f = f.filter(
          (r) =>
            r._parsedDate?.isValid() && r._parsedDate.isSame(selected, "day")
        );
      }
    }
    // Ordinamento decrescente: b - a per avere il più recente per primo
    return f.sort((a, b) => b._parsedDate.diff(a._parsedDate));
  }, [dataChart, filterDate]);

  // PREPARAZIONE DATI PER IL GRAFICO (Worked Boxes/Pallets per Work ID)
  const chartData = useMemo(() => {
    if (!filterDate || filtered.length === 0) return [];

    const aggregation = {};

    filtered.forEach((r) => {
      // Usa Work ID come chiave, con fallback su Reference o ID
      const key =
        r[colonne.work_id] ||
        r[colonne.reference] ||
        r[colonne.id] ||
        "Sconosciuto";
      const workedBoxes = Number(r[colonne.worked_box] || 0);
      const workedPallets = Number(r[colonne.worked_pallet] || 0);

      if (workedBoxes > 0 || workedPallets > 0) {
        if (!aggregation[key]) {
          aggregation[key] = {
            name: key,
            "Scatole Lavorate": 0,
            "Pallet Lavorati": 0,
          };
        }

        aggregation[key]["Scatole Lavorate"] += workedBoxes;
        aggregation[key]["Pallet Lavorati"] += workedPallets;
      }
    });

    return Object.values(aggregation);
  }, [filtered, filterDate, colonne]);

  if (loading) return <div className="p-4 text-blue-600">Caricamento...</div>;
  if (errorMsg) return <div className="p-4 text-red-600">{errorMsg}</div>;
  if (!dataChart) return <div className="p-4">In attesa dati...</div>;

  // Riferimento alle colonne
  const RibusColumns = colonne;

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
          Produzione Ribus - Totali per Work ID (Giorno Selezionato)
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={50}
                interval={0}
                style={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar dataKey="Scatole Lavorate" fill="#8884d8" />
              <Bar dataKey="Pallet Lavorati" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: 50 }}>
            {filterDate
              ? "Nessun dato di produzione (Worked Boxes/Pallets) valido per il giorno selezionato."
              : "Seleziona una data per visualizzare l'aggregazione per Work ID."}
          </div>
        )}
      </div>

      {/* 3. TABELLA DATI RIBUS */}
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
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}
        >
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={headerStyle}>ID</th>
              <th style={headerStyle}>Data Inserimento</th>
              <th style={headerStyle}>Data Pianificata</th>
              <th style={headerStyle}>Work ID</th>
              <th style={headerStyle}>Referenza</th>
              <th style={headerStyle}>Lotto</th>
              <th style={headerStyle}>Scatole Totali</th>
              <th style={headerStyle}>Pallet Totali</th>
              <th style={headerStyle}>Start Time</th>
              <th style={headerStyle}>End Time</th>
              <th style={headerStyle}>Scatole Lavorate</th>
              <th style={headerStyle}>Pallet Lavorati</th>
              <th style={headerStyle}>Stato</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: "center", padding: 40 }}>
                  Nessun dato Ribus disponibile.
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
                  <td style={cellStyle}>{r[RibusColumns.id]}</td>
                  <td style={cellStyle}>
                    {r._parsedDate.isValid()
                      ? r._parsedDate.format("DD-MM-YYYY HH:mm")
                      : r[RibusColumns.insert_datetime]}
                  </td>
                  <td style={cellStyle}>
                    {dayjs(r[RibusColumns.planned_date]).isValid()
                      ? dayjs(r[RibusColumns.planned_date]).format("DD-MM-YYYY")
                      : r[RibusColumns.planned_date]}
                  </td>
                  <td style={cellStyle}>{r[RibusColumns.work_id]}</td>
                  <td style={cellStyle}>{r[RibusColumns.reference]}</td>
                  <td style={cellStyle}>{r[RibusColumns.lot]}</td>
                  <td style={cellStyle}>{r[RibusColumns.boxes_tot]}</td>
                  <td style={cellStyle}>{r[RibusColumns.pallet_tot]}</td>
                  <td style={cellStyle}>{r[RibusColumns.start_time]}</td>
                  <td style={cellStyle}>{r[RibusColumns.end_time]}</td>
                  <td style={cellStyle}>{r[RibusColumns.worked_box]}</td>
                  <td style={cellStyle}>{r[RibusColumns.worked_pallet]}</td>
                  <td style={cellStyle}>{r[RibusColumns.state]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RibusChart;
