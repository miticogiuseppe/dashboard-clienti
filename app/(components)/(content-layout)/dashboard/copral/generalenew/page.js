"use client";
import AppmerceTable from "@/components/AppmerceTable";
import DateRangeFilter from "@/components/Copral/DaterangeFilter";
import GlobalContext from "@/context/GlobalContext";
import "@/lib/chart-setup";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractUniques, parseDates, sumByKey } from "@/utils/excelUtils";
import { formatDate, formatTime } from "@/utils/format";
import {
  createOptions,
  createSeries,
  currencyFormatter,
  pieOptions,
  randomColor,
} from "@/utils/graphUtils";
import Preloader from "@/utils/Preloader";
import { fetchCsvCached } from "@/utils/resourceCache";
import _ from "lodash";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useState } from "react";
import { Card, Col, Dropdown, Row } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { FaUsers } from "react-icons/fa6";
import { IoIosCalendar } from "react-icons/io";
import { PiPackage } from "react-icons/pi";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false },
);

// ─── Componente riga multiselect riutilizzabile ───────────────────────────────
// Gestisce correttamente il click sia sulla checkbox che sul testo
const MultiSelectItem = ({ label, checked, onToggle, bold = false }) => (
  <Dropdown.Item
    as="div"
    onClick={(e) => e.stopPropagation()} // blocca Dropdown.Item, gestiamo noi
    style={{ cursor: "pointer" }}
    className="d-flex align-items-center gap-2 px-3 py-2"
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle} // onChange gestisce sia click su checkbox che su label
      className="form-check-input m-0 flex-shrink-0"
      style={{ cursor: "pointer" }}
      id={`chk-${label}`}
    />
    <label
      htmlFor={`chk-${label}`}
      className={`mb-0 w-100 ${bold ? "fw-semibold" : ""}`}
      style={{ cursor: "pointer" }}
    >
      {label}
    </label>
  </Dropdown.Item>
);

const Ecommerce = () => {
  const { username } = useContext(GlobalContext);

  const [sheetData, setSheetData] = useState(undefined);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fileDate, setFileDate] = useState(undefined);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);

  const t = useTranslations("Graph");

  const handleFlatpickrChange = (dates) => {
    if (dates.length === 2) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else if (dates.length === 0) {
      setStartDate(null);
      setEndDate(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const json = await fetchCsvCached(
        "/api/fetch-excel-json?id=APPMERCE-000",
        undefined,
        username,
      );
      let data = json.data;
      data = parseDates(data, ["Data ord"]);
      setSheetData(data);
      setFileDate(new Date(json.lwt));
      setIsFetching(false);
    };
    fetchData();
  }, []);

  const uniqueAgents = useMemo(() => {
    if (!sheetData) return [];
    return extractUniques(sheetData, "Des. Agente").sort();
  }, [sheetData]);

  // Clienti unici: se ci sono agenti selezionati mostra solo i loro clienti,
  // ma mantieni sempre in lista i clienti già selezionati anche se fuori filtro
  const uniqueCustomers = useMemo(() => {
    if (!sheetData) return [];
    const source =
      selectedAgents.length > 0
        ? sheetData.filter((item) =>
            selectedAgents.includes(item["Des. Agente"]),
          )
        : sheetData;
    const fromAgents = extractUniques(source, "Ragione sociale").sort();

    // Aggiungi i clienti già selezionati che potrebbero non essere nella lista filtrata
    const merged = [...new Set([...fromAgents, ...selectedCustomers])].sort();
    return merged;
  }, [sheetData, selectedAgents, selectedCustomers]);

  // ─── Toggle agente ────────────────────────────────────────────────────────
  const toggleAgent = (agent) => {
    const newAgents = selectedAgents.includes(agent)
      ? selectedAgents.filter((a) => a !== agent)
      : [...selectedAgents, agent];
    setSelectedAgents(newAgents);
  };

  // ─── Toggle cliente ───────────────────────────────────────────────────────
  const toggleCustomer = (customer) => {
    setSelectedCustomers((prev) =>
      prev.includes(customer)
        ? prev.filter((c) => c !== customer)
        : [...prev, customer],
    );
  };

  // ─── Seleziona/deseleziona tutti ─────────────────────────────────────────
  const toggleAllAgents = () => {
    if (selectedAgents.length === uniqueAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents([...uniqueAgents]);
    }
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === uniqueCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...uniqueCustomers]);
    }
  };

  // ─── Elaborazione dati ────────────────────────────────────────────────────
  const data = useMemo(() => {
    if (!sheetData) return null;

    const filtered = sheetData.filter((item) => {
      let dateMatch = true;
      if (startDate && endDate) {
        const d = item["Data ord"];
        dateMatch =
          d.isSameOrAfter(startDate, "day") && d.isSameOrBefore(endDate, "day");
      }
      const agentMatch =
        selectedAgents.length === 0 ||
        selectedAgents.includes(item["Des. Agente"]);
      const customerMatch =
        selectedCustomers.length === 0 ||
        selectedCustomers.includes(item["Ragione sociale"]);
      return dateMatch && agentMatch && customerMatch;
    });

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

    const sortedData = [...filtered].sort((a, b) =>
      a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1,
    );
    const recentOrders = _.uniqBy(sortedData, "Nr.ord");
    const totalOrders = extractUniques(filtered, "Nr.ord").length;
    const totalCustomers = extractUniques(filtered, "Ragione sociale").length;

    const pieChartData = {
      labels: [],
      datasets: [{ data: [], backgroundColor: [], borderWidth: 1 }],
    };

    const customerMap = {};
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

    const top3 = sortedCustomers
      .slice(0, 3)
      .map(([name, count], index) => ({ name, count, originalIndex: index }));

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
  }, [sheetData, startDate, endDate, selectedCustomers, selectedAgents]);

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
    setSelectedCustomers([]);
    setSelectedAgents([]);
    setStartDate(null);
    setEndDate(null);
  };

  const agentToggleLabel =
    selectedAgents.length === 0
      ? "Tutti gli Agenti"
      : selectedAgents.length === 1
        ? selectedAgents[0]
        : `${selectedAgents.length} Agenti`;

  const customerToggleLabel =
    selectedCustomers.length === 0
      ? "Tutti i Clienti"
      : selectedCustomers.length === 1
        ? selectedCustomers[0]
        : `${selectedCustomers.length} Clienti`;

  const hasActiveFilters =
    selectedCustomers.length > 0 ||
    selectedAgents.length > 0 ||
    startDate !== null;

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
        <div
          className="d-flex flex-wrap gap-2 align-items-center"
          style={{ overflow: "visible" }}
        >
          {/* 1. FILTRO DATA */}
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleFlatpickrChange}
          />

          {/* 2. DROPDOWN CLIENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border d-flex align-items-center text-muted no-caret"
            Toggletext={customerToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                minWidth: "220px",
              }}
            >
              <MultiSelectItem
                label="Tutti i Clienti"
                bold
                checked={
                  uniqueCustomers.length > 0 &&
                  selectedCustomers.length === uniqueCustomers.length
                }
                onToggle={toggleAllCustomers}
              />
              <Dropdown.Divider className="my-1" />
              {uniqueCustomers.map((c) => (
                <MultiSelectItem
                  key={c}
                  label={c}
                  checked={selectedCustomers.includes(c)}
                  onToggle={() => toggleCustomer(c)}
                />
              ))}
            </div>
          </SpkDropdown>

          {/* 3. DROPDOWN AGENTI */}
          <SpkDropdown
            toggleas="a"
            Customtoggleclass="btn btn-outline-light btn-sm border d-flex align-items-center text-muted no-caret"
            Toggletext={agentToggleLabel}
            Arrowicon={true}
            autoClose="outside"
          >
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                minWidth: "200px",
              }}
            >
              <MultiSelectItem
                label="Tutti gli Agenti"
                bold
                checked={
                  uniqueAgents.length > 0 &&
                  selectedAgents.length === uniqueAgents.length
                }
                onToggle={toggleAllAgents}
              />
              <Dropdown.Divider className="my-1" />
              {uniqueAgents.map((a) => (
                <MultiSelectItem
                  key={a}
                  label={a}
                  checked={selectedAgents.includes(a)}
                  onToggle={() => toggleAgent(a)}
                />
              ))}
            </div>
          </SpkDropdown>

          {/* 4. TASTO RESET */}
          {hasActiveFilters && (
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
