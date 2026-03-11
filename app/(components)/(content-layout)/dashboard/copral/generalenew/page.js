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
import { useEffect, useState, useMemo } from "react";
import { Dropdown, Card, Col, Row } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { FaUsers } from "react-icons/fa6";
import { IoIosCalendar } from "react-icons/io";
import { PiPackage } from "react-icons/pi";
import { useTranslations } from "next-intl";
import AppmerceTable from "@/components/AppmerceTable";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import { Fragment } from "react";
import SpkFlatpickr from "@/shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import DateRangeFilter from "@/components/Copral/DaterangeFilter";

// Componente ApexCharts caricato dinamicamente
const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false },
);

const Ecommerce = () => {
  // Stati unificati e logica di filtro per data
  const [sheetData, setSheetData] = useState(undefined);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fileDate, setFileDate] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);

  // Gestore per il nuovo SpkFlatpickr (Range Mode)
  const handleFlatpickrChange = (dates) => {
    if (dates.length === 2) {
      // Flatpickr restituisce oggetti Date puri, li salviamo negli stati
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else if (dates.length === 0) {
      // Gestione del reset/clear
      setStartDate(null);
      setEndDate(null);
    }
  };

  const t = useTranslations("Graph");

  const [selectedCustomer, setSelectedCustomer] = useState("Tutti i Clienti");
  const [selectedAgent, setSelectedAgent] = useState("Tutti gli Agenti");

  // Estrae i clienti unici dai dati originali per il dropdown
  const uniqueCustomers = useMemo(() => {
    if (!sheetData) return ["Tutti i Clienti"];

    // Se è selezionato un agente, estraiamo solo i suoi clienti
    let dataForCustomers = sheetData;
    if (selectedAgent !== "Tutti gli Agenti") {
      dataForCustomers = sheetData.filter(
        (item) => item["Des. Agente"] === selectedAgent,
      );
    }

    const customers = extractUniques(
      dataForCustomers,
      "Ragione sociale",
    ).sort();
    return ["Tutti i Clienti", ...customers];
  }, [sheetData, selectedAgent]); // Ricalcola quando cambia l'agente

  // Estrae gli agenti unici dai dati originali per il dropdown
  const uniqueAgents = useMemo(() => {
    if (!sheetData) return ["Tutti gli Agenti"];
    return [
      "Tutti gli Agenti",
      ...extractUniques(sheetData, "Des. Agente").sort(),
    ];
  }, [sheetData]);

  // Effetto per il caricamento dati (Solo una volta al mount)
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
      );
      let json = await response.json();
      let data = json.data;
      data = parseDates(data, ["Data ord"]); // Converte le date
      setSheetData(data);
      setFileDate(new Date(json.lwt));

      setIsFetching(false);
    };
    fetchData();
  }, []);

  // 3. Logica di Elaborazione Dati (useMemo)
  const data = useMemo(() => {
    if (!sheetData) return null;

    // --- FILTRAGGIO ---
    let filtered = sheetData.filter((item) => {
      // Filtro Data
      let dateMatch = true;
      if (startDate && endDate) {
        const d = item["Data ord"];
        dateMatch =
          d.isSameOrAfter(startDate, "day") && d.isSameOrBefore(endDate, "day");
      }

      // Filtro Agente
      const agentMatch =
        selectedAgent === "Tutti gli Agenti" ||
        item["Des. Agente"] === selectedAgent;

      // Filtro Cliente
      const customerMatch =
        selectedCustomer === "Tutti i Clienti" ||
        (item["Ragione sociale"] === selectedCustomer && agentMatch);

      return dateMatch && agentMatch && customerMatch;
    });
    // --- GRAFICO A BARRE (Famiglie) ---
    let groupedFam = sumByKey(filtered, "descfam", "Totale gen", true);
    groupedFam = groupedFam.filter((x) => x["descfam"] !== "0");

    const chartOptions = createOptions(
      groupedFam,
      "descfam",
      undefined,
      currencyFormatter,
      "bar",
      "#b94eed",
    );
    const chartSeries = createSeries(groupedFam, "Importo");

    // --- TABELLA E STATISTICHE ---
    const sortedData = [...filtered].sort((a, b) =>
      a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1,
    );
    const recentOrders = _.uniqBy(sortedData, "Nr.ord");
    const totalOrders = extractUniques(filtered, "Nr.ord").length;
    const totalCustomers = extractUniques(filtered, "Ragione sociale").length;

    // --- GRAFICO A TORTA (Clienti) ---
    const pieChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 1,
        },
      ],
    };

    let customerMap = {};
    recentOrders.forEach((item) => {
      const customer = item["Ragione sociale"] || "Senza Nome";
      customerMap[customer] = (customerMap[customer] || 0) + 1;
    });

    const sortedCustomers = Object.entries(customerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    sortedCustomers.forEach(([name, count]) => {
      pieChartData.labels.push(name);
      pieChartData.datasets[0].data.push(count);
      pieChartData.datasets[0].backgroundColor.push(randomColor());
    });

    const top3 = sortedCustomers.slice(0, 3).map(([name, count], index) => ({
      name,
      count,
      originalIndex: index,
    }));

    return {
      chartOptions,
      chartSeries,
      recentOrders,
      totalOrders,
      totalCustomers,
      pieChartData,
      top3,
      categoryCount: chartOptions?.xaxis?.categories?.length || 0,
    };
  }, [sheetData, startDate, endDate, selectedCustomer, selectedAgent]);

  // Configurazione Card Dinamiche
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
      count: (data?.totalOrders || 0).toLocaleString("it-IT"),
      svgIcon: <PiPackage />,
      backgroundColor: "primary3 svg-white",
      color: "success",
    },
    {
      id: 3,
      title: "Totale clienti",
      count: (data?.totalCustomers || 0).toLocaleString("it-IT"),
      svgIcon: <FaUsers />,
      backgroundColor: "primary svg-white",
      color: "success",
    },
  ];

  const handleResetFilters = () => {
    setSelectedCustomer("Tutti i Clienti");
    setSelectedAgent("Tutti gli Agenti");
    setStartDate(null);
    setEndDate(null);
  };

  if (isFetching) return <Preloader show={true} />;

  return (
    <>
      <Seo title="Copral Generale" />
      <Pageheader
        title="Dashboards"
        currentpage="Generale"
        activepage="Generale"
        showActions={true}
      >
        {/* Aggiungiamo overflow visible per evitare che il calendario venga tagliato */}
        <div
          className="d-flex flex-wrap gap-2 align-items-center"
          style={{ overflow: "visible" }}
        >
          {/* 1. CALENDARIO (Spostato per primo così ha spazio a destra per aprirsi) */}
          {/* <div
            className="input-group"
            style={{ width: "auto", minWidth: "210px" }}
          >
            <div
              className="input-group-text bg-white border py-0"
              style={{ height: "31px" }}
            >
              <i className="ri-calendar-line text-muted"></i>
            </div>

            <SpkFlatpickr
              inputClass="form-control form-control-sm border"
              value={[startDate, endDate]}
              options={{
                mode: "range",
                dateFormat: "d-m-Y",
                showMonths: 1,
                static: true,
              }}
              onfunChange={handleFlatpickrChange}
              placeholder="Seleziona periodo..."
            />
          </div> */}

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleFlatpickrChange}
          />

          {/* 2. DROPDOWN CLIENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border d-flex align-items-center text-muted no-caret"
            Toggletext={selectedCustomer}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                minWidth: "200px",
              }}
            >
              {uniqueCustomers.map((c) => (
                <Dropdown.Item key={c} onClick={() => setSelectedCustomer(c)}>
                  {c}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>

          {/* 3. DROPDOWN AGENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border d-flex align-items-center text-muted no-caret"
            Toggletext={selectedAgent}
            Arrowicon={true}
          >
            <div
              className="dropdown-menu-filter"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {uniqueAgents.map((a) => (
                <Dropdown.Item
                  key={a}
                  onClick={() => {
                    setSelectedAgent(a);
                    setSelectedCustomer("Tutti i Clienti");
                  }}
                >
                  {a}
                </Dropdown.Item>
              ))}
            </div>
          </SpkDropdown>

          {/* 4. TASTO RESET */}
          {(selectedCustomer !== "Tutti i Clienti" ||
            selectedAgent !== "Tutti gli Agenti" ||
            startDate !== null) && (
            <button
              className="btn btn-danger-light btn-sm btn-icon"
              onClick={handleResetFilters}
              title="Reset filtri"
            >
              <i className="ti ti-refresh"></i>
            </button>
          )}
        </div>
      </Pageheader>
      {/* Cards */}
      <Row>
        {dynamicCards.map((card) => (
          <Col xxl={3} xl={3} lg={6} key={card.id}>
            <Spkcardscomponent
              cardClass="overflow-hidden main-content-card"
              headingClass="d-block mb-1"
              mainClass="d-flex align-items-start justify-content-between mb-2"
              svgIcon={card.svgIcon}
              card={card}
              badgeClass="md"
              dataClass="mb-0"
            />
          </Col>
        ))}
      </Row>

      <Row>
        {/* Grafico a Barre */}
        <Col xl={8} lg={8} className="stretch-column">
          <Card className="custom-card stretch-card">
            <Card.Header className="justify-content-between">
              <div className="card-title">
                Incidenza degli importi sulle famiglie (€)
              </div>
            </Card.Header>
            <Card.Body className="fill">
              {data?.chartSeries?.[0]?.data?.length > 0 ? (
                <Spkapexcharts
                  chartOptions={data.chartOptions}
                  chartSeries={data.chartSeries}
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

        {/* Classifica Famiglie */}
        <Col xl={4} lg={12} className="stretch-column">
          <Card className="custom-card stretch-card">
            <Card.Header>
              <div className="card-title">Classifica famiglie</div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 text-nowrap">
                  <tbody>
                    {data?.chartOptions?.xaxis?.categories
                      ?.map((label, idx) => ({
                        label,
                        value: data.chartSeries[0]?.data[idx] || 0,
                      }))
                      .sort((a, b) => b.value - a.value)
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
                Totale ripartito su {data?.categoryCount} categorie
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
            data={data?.recentOrders || []}
            title="Ordini"
            dateColumn="Data ord"
            enableSearch={true}
            tableHeaders={[
              { title: "Numero ordine", column: "Nr.ord", type: "number" },
              { title: "Sezionale", column: "Sez", type: "number" },
              {
                title: "Ragione sociale",
                column: "Ragione sociale",
                default: "Cliente Generico",
                bold: true,
              },
              { title: "Agente", column: "Des. Agente" },
              { title: "Data ordine", column: "Data ord" },
            ]}
          />
        </Col>

        {/* Grafico a Torta */}
        <Col xxl={4} xl={12} className="stretch-column">
          <Card className="custom-card fixed-height-card">
            <Card.Header>
              <div className="card-title">Totale ordini per cliente</div>
            </Card.Header>
            <Card.Body>
              <div className="vertical-center fill">
                {data?.pieChartData && (
                  <Pie data={data.pieChartData} options={pieOptions} />
                )}
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="row row-cols-12">
                {data?.top3.map((item, idx) => (
                  <div className="col p-0" key={idx}>
                    <div className="text-center">
                      <i
                        className="ri-circle-fill p-1 lh-1 fs-17 rounded-2"
                        style={{
                          color:
                            data.pieChartData.datasets[0].backgroundColor[
                              item.originalIndex
                            ],
                        }}
                      ></i>
                      <span className="text-muted fs-12 mb-1 rounded-dot d-inline-block ms-2">
                        {item.name}
                      </span>
                      <div>
                        <span className="fs-16 fw-medium">{item.count}</span>
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
  );
};

export default Ecommerce;
