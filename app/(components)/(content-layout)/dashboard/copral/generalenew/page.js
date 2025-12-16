"use client";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractUniques, sumByKey, parseDates } from "@/utils/excelUtils";
import {
  createSeries,
  createOptions,
  randomColor,
  pieOptions,
} from "@/utils/graphUtils";
import Preloader from "@/utils/Preloader";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card, Col, Row } from "react-bootstrap";
import PeriodSelector from "@/components/PeriodSelector";
import "@/lib/chart-setup";
import { Pie } from "react-chartjs-2";
import { formatDate } from "@/utils/format";
import { FaUsers } from "react-icons/fa6";
import { PiPackage } from "react-icons/pi";
import { IoIosCalendar } from "react-icons/io";
import _ from "lodash";

// Componente ApexCharts caricato dinamicamente
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const Ecommerce = () => {
  // Stati unificati e logica di filtro per data
  const [isLoading, setIsLoading] = useState(true);
  const [sheetData, setSheetData] = useState(undefined);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Dati per il grafico a barre (Report indice importi famiglie)
  const [chartOptions, setChartOptions] = useState(undefined); // Options per il grafico a barre
  const [chartSeries, setChartSeries] = useState(undefined);

  // Dati per il grafico a ciambella (Statistiche clienti)
  const [pieData, setPieData] = useState(undefined);
  const [top3, setTop3] = useState([]);

  // Dati per la tabella e le card
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalUniqueOrders, setTotalUniqueOrders] = useState(0); // DENOMINATORE
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);

  // data del file
  const [fileDate, setFileDate] = useState(undefined);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch del foglio Excel
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1"
      );
      let resp = await res.json();
      let data = resp.data;
      data = parseDates(data, ["Data ord"]); // Converte le date in oggetti Moment/Date
      setSheetData(data);
      setFileDate(resp.lwt);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!sheetData) return;
    let filteredData = sheetData;

    // ----------------------- Filtra i dati in base all'intervallo di date

    if (startDate && endDate) {
      const start = startDate;
      const end = endDate;

      filteredData = sheetData.filter((item) => {
        const d = item["Data ord"];
        return d.isSameOrAfter(start, "day") && d.isSameOrBefore(end, "day");
      });
    }

    // ----------------------- Logica per Grafico a Barre (Famiglie di prodotti - Qta da evadere)

    let grouped = sumByKey(filteredData, "descfam", "Qta da ev", true);
    grouped = grouped.filter((x) => x["descfam"] !== "0");
    setChartOptions(
      createOptions(grouped, "descfam", undefined, "bar", "#b94eed")
    );
    setChartSeries(createSeries(grouped, "Quantità"));

    // ----------------------- Logica per Tabella (Ordini recenti)

    const sortedData = filteredData.sort((a, b) =>
      a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1
    );
    const uniqData = _.uniqBy(sortedData, "Nr.ord");
    setRecentOrders(uniqData);

    // ----------------------- Logica per Card (Statistiche principali)

    // Totale ordini unici
    let orderNumbers = extractUniques(filteredData, "Nr.ord");
    setTotalUniqueOrders(orderNumbers.length); // DENOMINATORE

    // Totale clienti unici
    const uniqueCustomersCount = extractUniques(
      filteredData,
      "Ragione sociale"
    ).length;
    setTotalUniqueCustomers(uniqueCustomersCount);

    // ----------------------- Logica per Grafico a torta (Ordini totali € per cliente)

    const newPie = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        },
      ],
    };

    let map = {};
    filteredData.forEach((item) => {
      const customer = item["Ragione sociale"] || "Senza Nome";

      // Pulizia del valore totale
      let orderValue = item["ValoreTotale"];
      if (typeof orderValue === "string") {
        orderValue = orderValue.replace(".", "").replace(",", ".");
      }
      const total = parseFloat(orderValue) || 0;

      if (!map[customer]) {
        map[customer] = 0;
      }

      map[customer] += total;
    });
    let ordersByCustomer = Object.entries(map);

    ordersByCustomer = ordersByCustomer.map((x) => [
      x[0],
      Math.round(x[1] * 100) / 100,
      x[1].toLocaleString("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ]);

    let filterList = [...ordersByCustomer]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((x) => x[0]);

    for (let item of ordersByCustomer) {
      if (filterList.includes(item[0])) {
        newPie.labels.push(item[0]);
        newPie.datasets[0].data.push(item[1]);
        newPie.datasets[0].backgroundColor.push(randomColor());
      }
    }

    setPieData(newPie);

    setTop3([...ordersByCustomer].sort((a, b) => b[1] - a[1]).slice(0, 3));

    // ----------------------- fine caricamento

    setIsLoading(false);
  }, [sheetData, startDate, endDate]);

  // Cards unificate e dinamiche
  const dynamicCards = [
    {
      id: 1,
      title: "Ultimo aggiornamento",
      count: formatDate(new Date(fileDate)),
      svgIcon: <IoIosCalendar />,
      backgroundColor: "info svg-white",
      color: "success",
    },
    {
      id: 2,
      title: "Totale ordini",
      count: totalUniqueOrders.toLocaleString("it-IT"),
      svgIcon: <PiPackage />,
      backgroundColor: "primary3 svg-white",
      color: "success",
    },
    {
      id: 3,
      title: "Totale clienti",
      count: totalUniqueCustomers.toLocaleString("it-IT"),
      svgIcon: <FaUsers />,
      backgroundColor: "primary svg-white",
      color: "success",
    },
  ];

  return (
    <>
      <Seo title="Copral Generale" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          <Pageheader
            title="Dashboards"
            currentpage="Generale"
            activepage="Generale"
            showActions={false}
          />

          <Row>
            {/* Card statistiche */}
            {dynamicCards.map((idx) => (
              <Col xxl={3} xl={3} lg={6} key={idx.id}>
                <Spkcardscomponent
                  cardClass="overflow-hidden main-content-card"
                  headingClass="d-block mb-1"
                  mainClass="d-flex align-items-start justify-content-between mb-2"
                  svgIcon={idx.svgIcon}
                  card={idx}
                  badgeClass="md"
                  dataClass="mb-0"
                />
              </Col>
            ))}
          </Row>
          <Row>
            {/* Grafico a Barre (Report indice importi famiglie) */}
            <Col xl={12}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">
                    Incidenza degli importi sulle famiglie
                  </div>
                  <div className="d-flex align-items-center">
                    <PeriodSelector
                      onChange={(range) => {
                        setStartDate(range.startDate);
                        setEndDate(range.endDate);
                      }}
                    />
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {chartSeries &&
                  chartSeries.length > 0 &&
                  chartOptions?.xaxis?.categories.length > 0 ? (
                    <Spkapexcharts
                      chartOptions={chartOptions}
                      chartSeries={chartSeries}
                      type="bar"
                      width={"100%"}
                      height={397}
                    />
                  ) : (
                    <div className="text-center text-muted p-5">
                      Nessun dato per il grafico a barre nel periodo selezionato
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="stretch-row">
            {/* Tabella Ordini */}
            <Col xxl={8} xl={12} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Ordini</div>
                </Card.Header>

                {/* Importante: Card.Body SENZA className="p-0" */}
                <Card.Body>
                  <div className="scroller-container">
                    <SpkTablescomponent
                      // 1. RIMOSSA la classe "text-nowrap" per consentire al testo di andare a capo
                      // 2. AGGIUNTA la classe "text-center" per centrare tutte le colonne
                      tableClass="table-hover table-break-word sticky-header-table text-center"
                      header={[
                        // Aggiunta la classe "text-center" per centrare le intestazioni
                        { title: "Numero ordine", className: "text-center" },
                        { title: "Sezionale", className: "text-center" },
                        { title: "Ragione sociale", className: "text-center" },
                        { title: "Agente", className: "text-center" },
                        { title: "Data ordine", className: "text-center" },
                        // L'intestazione "Articolo" ora avrà più spazio per il contenuto
                      ]}
                    >
                      {recentOrders.map((row, index) => (
                        <tr key={index}>
                          {/* Le classi text-center sulla tabella e sulle intestazioni dovrebbero bastare, ma puoi aggiungerle anche qui se necessario */}
                          <td>{row["Nr.ord"] || "N/A"}</td>
                          <td>{row["Sez"] ?? "N/A"}</td>
                          <td className="fw-semibold">
                            {row["Ragione sociale"] || "Cliente Generico"}
                          </td>
                          <td>{row["Des. Agente"] || "N/A"}</td>
                          <td>
                            {row["Data ord"]
                              ? row["Data ord"].toDate().toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </SpkTablescomponent>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Grafico a Ciambella (Statistiche clienti per Totale €) */}
            <Col xxl={4} xl={12}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">
                    Totale ordini per cliente (€)
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="vertical-center">
                    {pieData && <Pie data={pieData} options={pieOptions} />}
                  </div>
                </Card.Body>
                {/* Footer per legenda dei primi 3 clienti */}
                <Card.Footer>
                  <div className="row row-cols-12">
                    {top3.map((item, idx) => (
                      <div className="col p-0" key={idx}>
                        <div className="text-center">
                          <i
                            className={`ri-circle-fill p-1 lh-1 fs-17 rounded-2`}
                            style={{
                              color: pieData.datasets[0].backgroundColor[idx],
                            }}
                          ></i>
                          <span className="text-muted fs-12 mb-1 rounded-dot d-inline-block ms-2">
                            {item[0]}
                          </span>
                          <div>
                            <span className="fs-16 fw-medium">{item[2]} €</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Ecommerce;
