"use client";

import { Card } from "react-bootstrap";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import { useMemo } from "react";

// Normalizza e pulisci i dati del log nel formato richiesto dalla tabella
const cleanAndNormalizeLogData = (data) => {
  if (!data) return [];

  return data.map((item) => {
    const isCut =
      item["Colonna 2"] &&
      item["Colonna 2"].toUpperCase() === "DOUBLE HEAD CYCLE"; // Col 2 nel file raw
    const isCycle =
      item["Colonna 2"] && item["Colonna 2"].toUpperCase().includes("START");

    return {
      Timestamp: item["Colonna 1"],
      Evento: item["Colonna 2"] || item["Colonna 1"],
      Descrizione: item["Colonna 3"] || item["Colonna 2"] || "",

      Col1: isCut ? item["Colonna 7"] : null,
      Col2: isCut ? item["Colonna 16"] : null,
      Col3: isCut ? item["Colonna 17"] : null,
      Col4: isCut ? item["Colonna 18"] : null,
      Col5: isCut ? item["Colonna 19"] : null,
      Col6: isCycle ? item["Colonna 5"] : null,
    };
  });
};

function TroncatriceLogTable({ data, title }) {
  const logData = useMemo(() => cleanAndNormalizeLogData(data), [data]);

  return (
    <Card className="custom-card overflow-hidden">
      <Card.Header className="justify-content-between d-flex align-items-center">
        <div className="card-title">{title}</div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <SpkTablescomponent
            tableClass="text-nowrap table-hover"
            header={[
              { title: "Data/Ora" },
              { title: "Evento" },
              { title: "Descrizione" },
              { title: "Col 1" },
              { title: "Col 2" },
              { title: "Col 3" },
              { title: "Col 4" },
              { title: "Col 5" },
              { title: "Col 6" },
            ]}
          >
            {logData.map((row, index) => (
              <tr key={index}>
                <td>
                  {row.Timestamp
                    ? new Date(row.Timestamp).toLocaleString()
                    : ""}
                </td>

                <td>{row.Evento || ""}</td>

                <td>{row.Descrizione || ""}</td>

                <td>{row.Col1 || ""}</td>

                <td>{row.Col2 || ""}</td>

                <td>{row.Col3 || ""}</td>

                <td>{row.Col4 || ""}</td>

                <td>{row.Col5 || ""}</td>

                <td>{row.Col6 || ""}</td>
              </tr>
            ))}
          </SpkTablescomponent>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TroncatriceLogTable;
