"use client";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import {
  Ecommercecard,
  Orderoptions,
  Orderseries,
  Reportoptions,
} from "@/shared/data/dashboard/ecommercedata";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractValues, sumByKey } from "@/utils/excelUtils";
import Preloader from "@/utils/Preloader";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const Ecommerce = () => {
  const [salesCategories, setSalesCategories] = useState([]);
  const [salesSeries, setSalesSeries] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalUniqueOrders, setTotalUniqueOrders] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);
  const [ordersCompletionRate, setOrdersCompletionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const tenant = "Copral";

  const parseDate = (dateValue) => {
    if (!dateValue || dateValue === 0) {
      // Gestione di valori nulli, undefined o 0
      return new Date(0);
    }

    // 1. CASO: E' un NUMERO SERIALE Excel
    if (typeof dateValue === "number" && dateValue > 40000) {
      const excelEpoch = new Date("1899-12-30");
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(
        excelEpoch.getTime() + dateValue * millisecondsPerDay
      );

      // Controllo di validità
      if (isNaN(date.getTime())) {
        return new Date(0);
      }
      return date;
    }

    // 2. CASO: E' una STRINGA (Solo se il valore originale non era un numero Excel)
    const dateString = String(dateValue).trim();

    // 2A. Formato ISO standard AAAA-MM-GG (es. "2025-11-12")
    if (dateString.includes("-") && dateString.split("-").length === 3) {
      return new Date(dateString);
    }

    // 2B. Formato Italiano GG/MM/AAAA (es. "12/11/2025")
    const parts = dateString.split("/");
    if (parts.length === 3) {
      // Conversione: GG/MM/AAAA -> MM/GG/AAAA per new Date()
      return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
    }

    // Fallback se nessun formato è stato riconosciuto
    return new Date(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
          {
            headers: { "x-tenant": tenant },
          }
        );
        const sheetData = await res.json();
        const sortedData = sheetData.sort(
          (a, b) => parseDate(b["Data ord"]) - parseDate(a["Data ord"])
        );

        const tableData = sortedData.slice(0, 6);
        setRecentOrders(tableData); // Raggruppa per 'descfam' e somma 'Qta da ev'

        const grouped = sumByKey(sheetData, "descfam", "Qta da ev", true);

        setSalesCategories(grouped.map((x) => x.descfam));
        setSalesSeries(grouped.map((x) => x.count));

        let orders = extractValues(sheetData, "Nr.ord");
        setOrders(orders); // Calcola e imposta il totale degli ordini unici (DENOMINATORE)

        const uniqueOrdersCount = new Set(orders).size;
        setTotalUniqueOrders(uniqueOrdersCount); // Calcola e imposta il totale dei clienti unici

        const customerNames = extractValues(sheetData, "Ragione sociale");
        const uniqueCustomersCount = new Set(customerNames).size;
        setTotalUniqueCustomers(uniqueCustomersCount); // Calcola e imposta la quantità totale

        const totalQta = sumByKey(sheetData, null, "Qta da ev");
        setTotalQuantity(totalQta); // Calcola e imposta la percentuale di completamento degli ordini

        // Ordini che sono stati evasi.
        const completedOrdersData = sheetData.filter(
          (item) =>
            parseFloat(item["Qta da ev"]) === 0 ||
            item["Qta da ev"] === null ||
            item["Qta da ev"] === ""
        );

        // 2. Conta gli ordini unici completati (NUMERATORE)
        const completedOrdersNumbers = extractValues(
          completedOrdersData,
          "Nr.ord"
        );
        const uniqueCompletedOrdersCount = new Set(completedOrdersNumbers).size;

        // 3. Calcola la percentuale
        let completionRate = 0;
        if (uniqueOrdersCount > 0) {
          completionRate =
            (uniqueCompletedOrdersCount / uniqueOrdersCount) * 100;
        }

        // 4. Imposta lo Stato (arrotondato all'intero)
        setOrdersCompletionRate(Math.round(completionRate));
      } catch (err) {
        console.error("Errore caricamento Excel:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  const chartOptions = {
    ...Reportoptions,
    xaxis: {
      categories: salesCategories,
    },
    yaxis: {
      labels: {
        formatter: (value) => Number(value.toFixed(0)),
      },
    },
  };

  const dynamicCards = Ecommercecard.map((card) => {
    // Trova la card "Totale ordini"
    if (card.title === "Totale ordini") {
      // Restituisce una nuova card con il conteggio aggiornato dallo stato
      return {
        ...card,
        count: totalUniqueOrders.toLocaleString("it-IT"),
        percentage: ordersCompletionRate,
      };
    }

    if (card.title === "Totale clienti") {
      // Usa il nuovo stato 'totalUniqueCustomers'
      return {
        ...card,
        count: totalUniqueCustomers.toLocaleString("it-IT"),
      };
    }

    if (card.title === "Total Quantity") {
      // Usa lo stato 'totalQuantity'
      return {
        ...card,
        count: totalQuantity.toLocaleString("it-IT"),
      };
    }

    return card;
  });

  const totalOrdersCardData =
    dynamicCards.find((c) => c.title === "Totale ordini") || {};
  // La proprietà 'count' di questo oggetto è il valore formattato.

  return (
    <Fragment>
      {/* <!-- Start::page-header --> */}
      <Preloader show={isLoading} />
      <Seo title="Dashboards-Ecommerce" />

      <Pageheader
        title="Dashboards"
        currentpage="Generale"
        activepage="Generale"
        showActions={false}
      />
      {/* <!-- End::page-header --> */}

      {/* <!-- Start: row-1 --> */}
      <Row>
        <Col xxl={12}>
          <Row>
            <Col xl={3} className="d-flex flex-column gap-3 force-bottom-align">
              {dynamicCards.map((idx) => (
                <Spkcardscomponent
                  key={idx.id}
                  svgIcon={idx.svgIcon}
                  cardClass="overflow-hidden main-content-card flex-grow-1 d-flex flex-column justify-content-end text-center"
                  headingClass="d-block fs-20 fw-semibold mb-2"
                  mainClass="d-flex align-items-center justify-content-center flex-column "
                  card={idx} // idx è aggiornato da dynamicCards
                  badgeClass="md"
                  dataClass="mb-0"
                />
              ))}
            </Col>
            <Col xl={9}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Report</div>
                  <div className="d-flex gap-2">
                    <div className="btn btn-sm btn-outline-light">Today</div>
                    <div className="btn btn-sm btn-outline-light">Weakly</div>
                    <div className="btn btn-sm btn-light">Yearly</div>
                  </div>
                </Card.Header>
                <Card.Body className="pb-2">
                  <div id="sales-report">
                    <Spkapexcharts
                      chartOptions={chartOptions}
                      chartSeries={[{ name: "Sales", data: salesSeries }]}
                      //type="line"
                      width={"100%"}
                      height={397}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xxl={8} xl={7}>
              <Card className="custom-card overflow-hidden">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Ordini Recenti</div>
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
                        { title: "Numero Ordine" },
                        { title: "Sezione" },
                        { title: "Ragione Sociale" },
                        { title: "Agente" },
                        { title: "Data ordine" },
                      ]}
                    >
                      {recentOrders.map((row, index) => (
                        <tr key={index}>
                          {/* Numero Ordine */}
                          <td>{row["Nr.ord"] || "N/A"}</td>

                          {/* Sezione */}
                          <td>{row["Sez"] ?? "N/A"}</td>

                          {/* Ragione Sociale */}
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="fw-semibold">
                                {row["Ragione sociale"] || "Cliente Generico"}
                              </div>
                            </div>
                          </td>

                          {/* Agente */}
                          <td>{row["Des. Agente"] || "N/A"}</td>

                          {/* Data Ordine */}
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
            </Col>
            <div className="col-xxl-4 col-xl-5">
              <div className="card custom-card">
                <div className="card-header justify-content-between">
                  <div className="card-title">Totale ordini</div>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-center align-items-center text-center bg-light p-3 rounded-1 order-content">
                    <div>
                      <p className="mb-1">Ordini Totali Unici</p>
                      <h4 className="text-primary mb-0">
                        {totalUniqueOrders.toLocaleString("it-IT")}
                      </h4>
                    </div>
                  </div>
                  <div id="total-orders">
                    <Spkapexcharts
                      chartOptions={Orderoptions}
                      chartSeries={Orderseries}
                      type="radialBar"
                      width={"100%"}
                      height={300}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </Col>
      </Row>
      {/* <!-- End:: row-1 --> */}
    </Fragment>
  );
};

export default Ecommerce;
