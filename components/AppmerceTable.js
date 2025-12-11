"use client";

import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import fileDownload from "@/utils/fileDownload";
import { useMemo } from "react";
import { Card } from "react-bootstrap";
import { FiDownload } from "react-icons/fi"; // icona Excel/download
import moment from "moment";

function AppmerceTable({ data, title, fileExcel, dateColumn, tableHeaders }) {
  // Ordino gli ultimi 7 ordini per data
  const filteredData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) =>
      a[dateColumn].isBefore(b[dateColumn]) ? 1 : -1
    );
    return sorted.slice(0, 7);
  }, [data, dateColumn]);

  const downloadExcel = async () => {
    fileDownload(fileExcel);
  };

  return (
    <Card className="custom-card overflow-hidden">
      <Card.Header className="justify-content-between d-flex align-items-center">
        <div className="card-title">{title}</div>
        {fileExcel && (
          <button
            onClick={downloadExcel}
            className="btn btn-outline-light border d-flex align-items-center text-muted btn-sm"
          >
            <FiDownload className="me-1" /> Excel
          </button>
        )}
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <SpkTablescomponent
            tableClass="text-nowrap table-hover"
            header={tableHeaders.map((header) => ({ title: header.title }))}
          >
            {filteredData.map((row, index) => (
              <tr key={index}>
                {tableHeaders.map((header, index) => (
                  <td className={header.bold ? "fw-semibold" : ""} key={index}>
                    {moment.isMoment(row[header.column])
                      ? row[header.column].toDate().toLocaleDateString()
                      : row[header.column] || header.default || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </SpkTablescomponent>
        </div>
      </Card.Body>
    </Card>
  );
}

export default AppmerceTable;
