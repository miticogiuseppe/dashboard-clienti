"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

const ConfezionatriceChart = ({ file, colonne, tenant }) => {
  const [dataChart, setDataChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // CARICO I DATI
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
  }, [file, colonne, tenant]);

  if (loading) return <div className="p-4 text-blue-600">Caricamento...</div>;
  if (errorMsg) return <div className="p-4 text-red-600">{errorMsg}</div>;
  if (!dataChart) return <div className="p-4">In attesa dati...</div>;

  // FILTRO PER DATA
  let filtered = dataChart.rows || [];
  if (filterDate) {
    const selected = dayjs(filterDate);
    if (selected.isValid()) {
      filtered = filtered.filter(
        (r) => r._parsedDate?.isValid() && r._parsedDate.isSame(selected, "day")
      );
    }
  }

  return (
    <div style={{ padding: 32, width: "100%" }}>
      {/* FILTRO A SINISTRA */}
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

      {/* TABELLA SCROLLABILE FULL WIDTH/HEIGHT */}
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
            <tr style={{ background: "#f8f9fa" }}>
              <th style={headerStyle}>{colonne.indice}</th>
              <th style={headerStyle}>{colonne.dataOra}</th>
              <th style={headerStyle}>
                {colonne.valorePeso || colonne.valore || "Valore"}
              </th>
              <th style={headerStyle}>{colonne.bilancia}</th>
              <th style={headerStyle}>
                {colonne.valoreRiservato || "Riservato"}
              </th>
              <th style={headerStyle}>{colonne.descrizione}</th>
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
                  <td style={cellStyle}>{r[colonne.indice] ?? i + 1}</td>
                  <td style={cellStyle}>
                    {r._parsedDate.isValid()
                      ? r._parsedDate.format("YYYY-MM-DD HH:mm")
                      : ""}
                  </td>
                  <td style={cellStyle}>
                    {Number(r[colonne.valorePeso] ?? r[colonne.valore] ?? 0)}
                  </td>
                  <td style={cellStyle}>{r[colonne.bilancia]}</td>
                  <td style={cellStyle}>{r[colonne.valoreRiservato] ?? ""}</td>
                  <td
                    style={{
                      ...cellStyle,
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
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
