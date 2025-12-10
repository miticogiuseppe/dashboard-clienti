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

// Componente ApexCharts caricato dinamicamente
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const Ecommerce = () => {
  const tenant = "Copral";

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
  const [orders, setOrders] = useState([]); // Tutti gli ordini unici per calcolare il tasso
  const [totalUniqueOrders, setTotalUniqueOrders] = useState(0); // DENOMINATORE
  const [totalQuantity, setTotalQuantity] = useState(0); // Qta da evadere totale
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);
  const [ordersCompletionRate, setOrdersCompletionRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch del foglio Excel
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
        {
          headers: { "x-tenant": tenant },
        }
      );
      let content = await res.json();
      content = parseDates(content, ["Data ord"]); // Converte le date in oggetti Moment/Date
      setSheetData(content);
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

    const grouped = sumByKey(filteredData, "descfam", "Qta da ev", true);
    setChartOptions(
      createOptions(grouped, "descfam", undefined, "bar", "#b94eed")
    );
    setChartSeries(createSeries(grouped, "Quantità da Evadere"));

    // ----------------------- Logica per Tabella (Ordini recenti)

    const sortedData = filteredData.sort((a, b) =>
      a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1
    );
    const tableData = sortedData.slice(0, 6); // 6 ordini più recenti filtrati
    setRecentOrders(tableData);

    // ----------------------- Logica per Card (Statistiche principali)

    // Totale ordini unici
    let orderNumbers = extractUniques(filteredData, "Nr.ord");
    setOrders(orderNumbers); // Lista di tutti i numeri d'ordine unici nel periodo
    setTotalUniqueOrders(orderNumbers.length); // DENOMINATORE

    // Totale clienti unici
    const uniqueCustomersCount = extractUniques(
      filteredData,
      "Ragione sociale"
    ).length;
    setTotalUniqueCustomers(uniqueCustomersCount);

    // ----------------------- Tasso di completamento degli ordini

    // 1. Ordini che sono stati evasi (Qta da ev = 0, null, o vuoto)
    const completedOrdersData = filteredData.filter(
      (item) =>
        parseFloat(item["Qta da ev"]) === 0 ||
        item["Qta da ev"] === null ||
        item["Qta da ev"] === ""
    );

    // 2. Conta gli ordini unici completati (NUMERATORE)
    const uniqueCompletedOrdersCount = extractUniques(
      completedOrdersData,
      "Nr.ord"
    ).length;

    // 3. Calcola la percentuale
    let completionRate = 0;
    if (orderNumbers.length > 0) {
      completionRate = (uniqueCompletedOrdersCount / orderNumbers.length) * 100;
    }
    setOrdersCompletionRate(Math.round(completionRate)); // Arrotonda all'intero

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

  // Funzioni di rendering SVG dalla versione MAIN
  const svg4 = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#000000"
      viewBox="0 0 256 256"
    >
      <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
    </svg>
  );
  const svg5 = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#000000"
      viewBox="0 0 256 256"
    >
      <path
        d="M10.23,200a88,88,0,0,1,147.54,0"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
      <path
        d="M172,160a87.93,87.93,0,0,1,73.77,40"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
      <circle
        cx="84"
        cy="108"
        r="52"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
      <path
        d="M152.69,59.7A52,52,0,1,1,172,160"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
    </svg>
  );
  const svg3 = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="#000000"
      viewBox="0 0 256 256"
    >
      <path d="M228,72v79.82a8,8,0,0,1-3.6,6.67L136,218.67a8,8,0,0,1-8,0L31.6,158.49A8,8,0,0,1,28,151.82V72a8,8,0,0,1,4-6.93l88-48.18a8,8,0,0,1,8,0l88,48.18A8,8,0,0,1,228,72ZM128,34.09,47.66,78.2l35.88,19.62,80.34-44.11ZM44,148.14l80,43.79V107.55l-80-43.78ZM136,107.55v84.38l80-43.79V78.2Z"></path>
    </svg>
  );

  // Cards unificate e dinamiche
  const dynamicCards = [
    {
      id: 1,
      title: "Totale ordini",
      svgIcon: svg4,
      backgroundColor: "primary3 svg-white",
      color: ordersCompletionRate > 0 ? "success" : "danger",
      count: totalUniqueOrders.toLocaleString("it-IT"),
      percentage: ordersCompletionRate,
    },
    {
      id: 2,
      title: "Totale clienti",
      svgIcon: svg5,
      backgroundColor: "primary svg-white",
      color: "success",
      count: totalUniqueCustomers.toLocaleString("it-IT"),
      percentage: "100",
    },
  ];

  return (
    <>
      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
          {/* */}
          <Seo title="Dashboards-Ecommerce" />

          <Pageheader
            title="Dashboards"
            currentpage="Generale"
            activepage="Generale"
            showActions={false}
          />
          {/* */}

          {/* */}
          <Row>
            {/* Card statistiche */}
            <Col xl={3} className="d-flex flex-column gap-3 force-bottom-align">
              {dynamicCards.map((idx) => (
                <Spkcardscomponent
                  key={idx.id}
                  svgIcon={idx.svgIcon}
                  cardClass="overflow-hidden main-content-card flex-grow-1 d-flex flex-column justify-content-end text-center"
                  headingClass="d-block fs-20 fw-semibold mb-2"
                  mainClass="d-flex align-items-center justify-content-center flex-column "
                  card={idx}
                  badgeClass="md"
                  dataClass="mb-0"
                />
              ))}
            </Col>

            {/* Grafico a Barre (Report indice importi famiglie) */}
            <Col xl={9}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">
                    Report quantità da evadere per famiglia
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
                <Card.Body className="pb-2">
                  <div id="sales-report">
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
                        Nessun dato per il grafico a barre nel periodo
                        selezionato
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Tabella Ordini Recenti */}
            <Col xxl={8} xl={12}>
              <Card className="custom-card overflow-hidden">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Ordini recenti</div>
                  <Link
                    scroll={false}
                    href="#!"
                    className="btn btn-outline-light border d-flex align-items-center text-muted btn-sm"
                  >
                    View All
                  </Link>
                </Card.Header>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <SpkTablescomponent
                      tableClass="text-nowrap table-hover"
                      header={[
                        { title: "Numero ordine" },
                        { title: "Sezionale" },
                        { title: "Ragione sociale" },
                        { title: "Agente" },
                        { title: "Data ordine" },
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
                              ? row["Data ord"].toDate().toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </SpkTablescomponent>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Grafico a Ciambella (Statistiche clienti per Totale €) */}
            <Col xxl={4} xl={12}>
              <Card className="custom-card overflow-hidden">
                <Card.Header className="justify-content-between">
                  <h6 className="card-title">Totale ordini per cliente (€)</h6>
                </Card.Header>
                <Card.Body>
                  <div className="vertical-center">
                    {pieData && <Pie data={pieData} options={pieOptions} />}
                  </div>
                </Card.Body>
                {/* Footer per legenda dei primi 3 clienti */}
                <div className="card-footer p-3 my-2">
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
                </div>
              </Card>
            </Col>
          </Row>
          {/* */}
        </>
      )}
    </>
  );
};

export default Ecommerce;
