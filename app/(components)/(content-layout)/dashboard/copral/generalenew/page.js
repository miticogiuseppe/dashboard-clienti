"use client";
import PeriodDropdown from "@/components/PeriodDropdown";
import "@/lib/chart-setup";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { computeDate } from "@/utils/dateUtils";
import { extractUniques, parseDates, sumByKey } from "@/utils/excelUtils";
import { formatDate, formatTime } from "@/utils/format";
import {
  createOptions,
  createSeries,
  pieOptions,
  randomColor,
  currencyFormatter,
} from "@/utils/graphUtils";
import Preloader from "@/utils/Preloader";
import _ from "lodash";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { FaUsers } from "react-icons/fa6";
import { IoIosCalendar } from "react-icons/io";
import { PiPackage } from "react-icons/pi";
import { useTranslations } from "next-intl";
import AppmerceTable from "@/components/AppmerceTable";

// Componente ApexCharts caricato dinamicamente
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false },
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

  const t = useTranslations("Graph");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch del foglio Excel
      const response = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
      );
      let json = await response.json();
      let data = json.data;
      data = parseDates(data, ["Data ord"]); // Converte le date in oggetti Moment/Date
      setSheetData(data);
      setFileDate(new Date(json.lwt));
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

    // ----------------------- Logica per Grafico a Barre (Famiglie di prodotti - Importi)

    let grouped = sumByKey(filteredData, "descfam", "Totale gen", true);
    grouped = grouped.filter((x) => x["descfam"] !== "0");
    setChartOptions(
      createOptions(
        grouped,
        "descfam",
        undefined,
        currencyFormatter,
        "bar",
        "#b94eed",
      ),
    );
    setChartSeries(createSeries(grouped, "count"));

    // ----------------------- Logica per Tabella (Ordini recenti)

    const sortedData = filteredData.sort((a, b) =>
      a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1,
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
      "Ragione sociale",
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
    uniqData.forEach((item) => {
      const customer = item["Ragione sociale"] || "Senza Nome";

      if (!map[customer]) map[customer] = 0;
      map[customer] += 1;
    });
    let ordersByCustomer = Object.entries(map);

    ordersByCustomer = ordersByCustomer.map((x) => [x[0], x[1]]);

    let filterList = [...ordersByCustomer]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((x) => x[0]);

    let top20 = [];
    for (let item of ordersByCustomer)
      if (filterList.includes(item[0])) top20.push(item);

    for (let item of top20) {
      newPie.labels.push(item[0]);
      newPie.datasets[0].data.push(item[1]);
      newPie.datasets[0].backgroundColor.push(randomColor());
    }

    setPieData(newPie);

    setTop3(
      top20
        .map((item, index) => ({
          ...item,
          originalIndex: index,
        }))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    );

    // ----------------------- fine caricamento

    setIsLoading(false);
  }, [sheetData, startDate, endDate]);

  // Cards unificate e dinamiche
  const dynamicCards = [
    {
      id: 1,
      title: "Ultimo aggiornamento",
      count: formatDate(fileDate),
      inc: formatTime(fileDate),
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
            <Col xl={8} lg={8} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">
                    Incidenza degli importi sulle famiglie (€)
                  </div>
                  <div className="d-flex align-items-center">
                    <PeriodDropdown
                      onChange={(period) => {
                        let date = computeDate(undefined, period);
                        setStartDate(date[0]);
                        setEndDate(date[1]);
                      }}
                    />
                  </div>
                </Card.Header>
                <Card.Body className="fill">
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
                    <div className="no-data text-muted">{t("NoData")}</div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xl={4} lg={12} className="stretch-column">
              <Card className="custom-card stretch-card">
                <Card.Header>
                  <div className="card-title">Classifica famiglie</div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 text-nowrap">
                      <tbody>
                        {chartOptions?.xaxis?.categories
                          .map((label, idx) => ({
                            label,
                            value: chartSeries[0]?.data[idx] || 0,
                          }))
                          .sort((a, b) => b.value - a.value) // Ordine decrescente
                          .map((item, idx) => (
                            <tr key={idx}>
                              <td className="border-top-0">
                                <div className="d-flex align-items-center">
                                  <span className="avatar avatar-xs bg-primary-transparent fw-bold me-2">
                                    {idx + 1}
                                  </span>
                                  <div
                                    className="fw-medium fs-13 text-truncate"
                                    style={{ maxWidth: "160px" }}
                                  >
                                    {item.label}
                                  </div>
                                </div>
                              </td>
                              <td className="text-end border-top-0">
                                <span className="fw-semibold">
                                  {currencyFormatter(item.value)} €
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-light p-2 text-center">
                  <small className="text-muted">
                    Totale ripartito su {chartOptions?.xaxis?.categories.length}{" "}
                    categorie
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>

          <Row className="stretch-row">
            {/* Tabella Ordini */}
            <Col xxl={8} xl={12} className="stretch-column">
              <AppmerceTable
                className="custom-card sibling-card"
                data={recentOrders}
                title="Ordini"
                dateColumn="Data ord"
                enableSearch={true}
                tableHeaders={[
                  {
                    title: "Numero ordine",
                    column: "Nr.ord",
                    type: "number",
                  },
                  {
                    title: "Sezionale",
                    column: "Sez",
                    type: "number",
                  },
                  {
                    title: "Ragione sociale",
                    column: "Ragione sociale",
                    default: "Cliente Generico",
                    bold: true,
                  },
                  {
                    title: "Agente",
                    column: "Des. Agente",
                  },
                  {
                    title: "Data ordine",
                    column: "Data ord",
                  },
                ]}
              />
            </Col>

            {/* Grafico a Ciambella (Statistiche clienti per Totale €) */}
            <Col xxl={4} xl={12} className="stretch-column">
              <Card className="custom-card fixed-height-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Totale ordini per cliente</div>
                </Card.Header>
                <Card.Body>
                  <div className="vertical-center fill">
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
                              color:
                                pieData.datasets[0].backgroundColor[
                                  item.originalIndex
                                ],
                            }}
                          ></i>
                          <span className="text-muted fs-12 mb-1 rounded-dot d-inline-block ms-2">
                            {item[0]}
                          </span>
                          <div>
                            <span className="fs-16 fw-medium">{item[1]}</span>
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
