"use client";

import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import fileDownload from "@/utils/fileDownload";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { FiDownload } from "react-icons/fi"; // icona Excel/download
import moment from "moment";
import { useTranslations } from "next-intl";
import VisibilityChecker from "./VisibilityChecker";

function AppmerceTable({
  data,
  title,
  fileExcel,
  dateColumn,
  tableHeaders,
  filterDate,
  className,
}) {
  const t = useTranslations("Graph");

  const ITEMS_PER_PAGE = 50;
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);
  const [prevData, setPrevData] = useState(undefined);

  // Ordino gli ultimi 7 ordini per data
  const filteredData = useMemo(() => {
    if (!data) return [];
    let sorted = [...data].sort((a, b) =>
      moment.isMoment(a[dateColumn]) &&
      moment.isMoment(b[dateColumn]) &&
      a[dateColumn].isBefore(b[dateColumn])
        ? 1
        : -1
    );
    if (filterDate && filterDate.length === 2)
      sorted = sorted.filter(
        (x) =>
          moment.isMoment(x[dateColumn]) &&
          x[dateColumn].isSameOrAfter(moment(filterDate[0])) &&
          x[dateColumn].isBefore(moment(filterDate[1]).add(1, "days"))
      );
    return sorted;
  }, [data, dateColumn, filterDate]);

  if (filteredData !== prevData) {
    setVisibleItemsCount(ITEMS_PER_PAGE);
    setPrevData(filteredData);
  }

  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleItemsCount);
  }, [filteredData, visibleItemsCount]);

  const downloadExcel = async () => {
    fileDownload(fileExcel);
  };

  const handlePageLoad = useCallback(() => {
    if (visibleItemsCount < filteredData.length) {
      setVisibleItemsCount((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [visibleItemsCount, filteredData.length]);
  return (
    <Card className={className ? className : "custom-card fixed-height-card"}>
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

      <Card.Body className="p-2">
        {filteredData.length > 0 ? (
          <div className="scroller-container">
            <SpkTablescomponent
              tableClass="table-hover table-break-word sticky-header-table customable"
              header={tableHeaders.map((header) => ({
                title: header.title,
                className: header.className,
              }))}
            >
              {displayedData.map((row, index) => (
                <tr key={index}>
                  {tableHeaders.map((header, index) => (
                    <td
                      className={
                        (header.bold ? "fw-semibold" : "") +
                        " " +
                        (header.type === "number" ? "text-right" : "")
                      }
                      key={index}
                    >
                      {moment.isDuration(row[header.column])
                        ? moment("1900-01-01")
                            .add(row[header.column])
                            .format("m:ss")
                        : moment.isMoment(row[header.column])
                        ? header.showSeconds
                          ? row[header.column].format("DD/MM/YYYY HH:mm:ss")
                          : row[header.column].format("DD/MM/YYYY")
                        : row[header.column] !== "" &&
                          row[header.column] !== null &&
                          row[header.column] !== undefined
                        ? row[header.column]
                        : header.default ||
                          (header.allowZero
                            ? "0"
                            : header.allowEmpty
                            ? ""
                            : "N/A")}
                    </td>
                  ))}
                </tr>
              ))}
            </SpkTablescomponent>
            {visibleItemsCount < filteredData.length && (
              <VisibilityChecker onLoading={handlePageLoad} />
            )}
          </div>
        ) : (
          <div className="no-data text-muted">{t("NoData")}</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default AppmerceTable;
