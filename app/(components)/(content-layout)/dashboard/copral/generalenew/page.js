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
import { extractValues, sumByKey, parseDates } from "@/utils/excelUtils";
import { createSeries, createOptions } from "@/utils/graphUtils";
import Preloader from "@/utils/Preloader";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useEffect, useState, useCallback } from "react";
import { Card, Col, Row } from "react-bootstrap";

const Spkapexcharts = dynamic(
  () =>
    import("@/shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"),
  { ssr: false }
);

const Ecommerce = () => {
  const tenant = "Copral";

  const [isLoading, setIsLoading] = useState(true);

  // dati grafici
  const [chartOptions, setChartOptions] = useState(undefined);
  const [chartSeries, setChartSeries] = useState(undefined);

  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);
  const [ordersCompletionRate, setOrdersCompletionRate] = useState(0);

  const getData = useCallback(async () => {
    try {
      // fetch del foglio Excel
      const res = await fetch(
        "/api/fetch-excel-json?id=APPMERCE-000&sheet=APPMERCE-000_1",
        {
          headers: { "x-tenant": tenant },
        }
      );
      let sheetData = await res.json();
      sheetData = parseDates(sheetData, ["Data ord"]);

      // ottiene tutti i numeri d'ordine (univoci)
      let orders = extractValues(sheetData, "Nr.ord");
      setOrders(orders);

      // ottiene i 6 ordini più recenti
      const sortedData = sheetData.sort((a, b) =>
        a["Data ord"].isBefore(b["Data ord"]) ? 1 : -1
      );
      const tableData = sortedData.slice(0, 6);
      setRecentOrders(tableData);

      // calcola sommatorie 'Qta da ev' raggruppate per 'descfam'
      const grouped = sumByKey(sheetData, "descfam", "Qta da ev", true);
      setChartOptions(createOptions(grouped, "descfam"));
      setChartSeries(createSeries(grouped, "Sales"));

      // Calcola e imposta il totale dei clienti unici
      const uniqueCustomersCount = extractValues(
        sheetData,
        "Ragione sociale"
      ).length;
      setTotalUniqueCustomers(uniqueCustomersCount);

      // calcola somma delle qta da evadere
      const totalQta = sumByKey(sheetData, null, "Qta da ev");
      setTotalQuantity(totalQta);
    } catch (err) {
      console.error("Errore caricamento Excel:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const dynamicCards = Ecommercecard.map((card) => {
    // Trova la card "Total Orders"
    if (card.title === "Total Orders") {
      // Restituisce una nuova card con il conteggio aggiornato dallo stato
      return {
        ...card,
        count: orders.length.toLocaleString("it-IT"),
        percentage: ordersCompletionRate,
      };
    }

    if (card.title === "Total Unique Customers") {
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
    dynamicCards.find((c) => c.title === "Total Orders") || {};
  // La proprietà 'count' di questo oggetto è il valore formattato.

  return (
    <>
      <Preloader show={isLoading} />

      {/* <!-- Start::page-header --> */}
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
                      chartSeries={chartSeries}
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
                        { title: "Ragione Sociale" },
                        { title: "Data Acquisto" },
                      ]}
                    >
                      {recentOrders.map((row, index) => (
                        <tr key={index}>
                          <td>{row["Nr.ord"] || "N/A"}</td>

                          <td>
                            <div className="d-flex align-items-center">
                              <div className="fw-semibold">
                                {row["Ragione sociale"] || "Cliente Generico"}
                              </div>
                            </div>
                          </td>

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
            <div className="col-xxl-4 col-xl-5">
              <div className="card custom-card">
                <div className="card-header justify-content-between">
                  <div className="card-title">Total Orders</div>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-center align-items-center text-center bg-light p-3 rounded-1 order-content">
                    <div>
                      <p className="mb-1">Ordini Totali Unici</p>
                      <h4 className="text-primary mb-0">
                        {orders.length.toLocaleString("it-IT")}
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
    </>
  );
};

export default Ecommerce;
