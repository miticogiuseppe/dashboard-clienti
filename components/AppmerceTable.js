"use client";

import { Card } from "react-bootstrap";
import { FiDownload } from "react-icons/fi"; // icona Excel/download
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";

function AppmerceTable({ recentOrders, parseDate, title, fileExcel, tenant }) {
  // Funzione per scaricare file Excel dal server con header x-tenant
  const downloadExcel = async () => {
    if (!fileExcel) return;

    try {
      const res = await fetch(fileExcel);

      if (!res.ok) {
        alert("Errore nel download del file");
        return;
      }

      const blob = await res.blob();
      const tempUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = tempUrl;

      // Nome file dalle response headers
      const filename =
        res.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "download.xlsx";

      a.download = filename;
      a.click();
      URL.revokeObjectURL(tempUrl);
    } catch (err) {
      console.error("Errore download Excel:", err);
      alert("Errore nel download del file Excel");
    }
  };

  return (
    <Card className="custom-card overflow-hidden">
      <Card.Header className="justify-content-between d-flex align-items-center">
        <div className="card-title">{title}</div>
        {fileExcel && tenant && (
          <button
            onClick={downloadExcel}
            className="btn btn-outline-light border d-flex align-items-center text-muted btn-sm"
          >
            <FiDownload className="me-1" /> Excel
          </button>
        )}
      </Card.Header>

      <div className="card-body p-0">
        <div className="table-responsive">
          <SpkTablescomponent
            tableClass="text-nowrap table-hover"
            header={[
              { title: "Num. ord." },
              { title: "Sez." },
              { title: "Rag. Soc." },
              { title: "Agente" },
              { title: "Data ord." },
            ]}
          >
            {recentOrders.map((row, index) => (
              <tr key={index}>
                <td>{row["Nr.ord"] || "N/A"}</td>
                <td>{row["Sez"] ?? "N/A"}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="fw-semibold">
                      {row["Ragione sociale"] || "Cliente Generico"}
                    </div>
                  </div>
                </td>
                <td>{row["Des. Agente"] || "N/A"}</td>
                <td>
                  {row["Data ord"]
                    ? parseDate(row["Data ord"]).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </SpkTablescomponent>
        </div>
      </div>
    </Card>
  );
}

export default AppmerceTable;
