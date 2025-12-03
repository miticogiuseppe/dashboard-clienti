"use client";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import {
  Ecommercecard,
  Orderoptions,
  Orderseries,
} from "@/shared/data/dashboard/ecommercedata";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractUniques, sumByKey, parseDates } from "@/utils/excelUtils";
import {
  createSeries,
  createOptions,
  emptySeries,
  emptyOptions,
} from "@/utils/graphUtils";
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
    let orders = extractUniques(sheetData, "Nr.ord");
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
    const uniqueCustomersCount = extractUniques(
      sheetData,
      "Ragione sociale"
    ).length;
    setTotalUniqueCustomers(uniqueCustomersCount);

    // calcola somma delle qta da evadere
    const totalQta = sumByKey(sheetData, null, "Qta da ev");
    setTotalQuantity(totalQta);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

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
      fill="#000000" // Il tuo template usa fill sul tag SVG
      viewBox="0 0 256 256"
    >
         {" "}
      {/* Ho rimosso <rect> e ho corretto gli attributi dei path e circle.
        Ho anche rimosso gli attributi 'stroke' e 'fill' dal contenuto,
        lasciando che il 'fill' sul tag <svg> gestisca il colore.
        NOTA: l'icona originale è fatta con STROKE, potresti dover
        provare a cambiarla in "fill" per il tuo template.
    */}
          <circle cx="84" cy="108" r="52" opacity="0.2" />   {" "}
      <path
        d="M10.23,200a88,88,0,0,1,147.54,0"
        stroke="#000000" // Manteniamo lo stroke per l'icona di "linea"
        strokeLinecap="round" // Correzione CamelCase
        strokeLinejoin="round" // Correzione CamelCase
        strokeWidth="16" // Correzione CamelCase
        fill="none" // Importante: mantieni fill="none" se è un tratto di linea
      />
         {" "}
      <path
        d="M172,160a87.93,87.93,0,0,1,73.77,40"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
         {" "}
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
         {" "}
      <path
        d="M152.69,59.7A52,52,0,1,1,172,160"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        fill="none"
      />
       {" "}
    </svg>
  );

  const cards = [
    {
      id: 1,
      title: "Totale ordini",
      // inc: "Increased By",
      //percentageChange: "2.3%",
      //icon: "ti ti-trending-up",
      svgIcon: svg4,
      backgroundColor: "primary3 svg-white",
      color: "success",
      count: orders.length.toLocaleString("it-IT"),
      percentage: ordersCompletionRate,
    },
    {
      id: 2,
      title: "Totale Clienti",
      //inc: "Increased By",
      //percentageChange: "5.1%",
      //icon: "ti ti-trending-up",
      svgIcon: svg5,
      backgroundColor: "primary svg-white",
      color: "success",
      count: totalUniqueCustomers.toLocaleString("it-IT"),
    },
  ];

  return (
    <>
      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <>
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
                <Col
                  xl={3}
                  className="d-flex flex-column gap-3 force-bottom-align"
                >
                  {cards.map((idx) => (
                    <Spkcardscomponent
                      key={idx.id}
                      svgIcon={idx.svgIcon}
                      cardClass="overflow-hidden main-content-card flex-grow-1 d-flex flex-column justify-content-end text-center"
                      headingClass="d-block fs-20 fw-semibold mb-2"
                      mainClass="d-flex align-items-center justify-content-center flex-column "
                      card={idx} // idx è aggiornato da cards
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
                        <div className="btn btn-sm btn-outline-light">
                          Today
                        </div>
                        <div className="btn btn-sm btn-outline-light">
                          Weakly
                        </div>
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
                                    {row["Ragione sociale"] ||
                                      "Cliente Generico"}
                                  </div>
                                </div>
                              </td>

                              <td>
                                {row["Data ord"]
                                  ? row["Data ord"]
                                      .toDate()
                                      .toLocaleDateString()
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
      )}
    </>
  );
};

export default Ecommerce;
