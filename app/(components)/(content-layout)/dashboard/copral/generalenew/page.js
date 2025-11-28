"use client";
import { loadSheetFromFile, sumByKey } from "@/utils/excelUtils";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkActivityCard from "@/shared/@spk-reusable-components/reusable-dashboards/spk-ecommerceactivity";
import SpkProgress from "@/shared/@spk-reusable-components/reusable-uielements/spk-progress";
import SpkTooltips from "@/shared/@spk-reusable-components/reusable-uielements/spk-tooltips";
import SpkTablescomponent from "@/shared/@spk-reusable-components/reusable-tables/tables-component";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkDropdown from "@/shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import {
  Ecommercecard,
  Newlydata,
  Orderoptions,
  Orderseries,
  Payment,
  Recentactivity,
  Reportoptions,
  Reportseries,
  TopSellingdata,
  Visitoroptions,
  Visitorseries,
  tableData,
} from "@/shared/data/dashboard/ecommercedata";
import SpkButton from "@/shared/@spk-reusable-components/reusable-uielements/spk-button";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Dropdown, Pagination, Row } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
import { extractValues } from "@/utils/excelUtils";
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

  const tenant = "Copral";

  const parseDate = (dateValue) => {
    if (!dateValue || dateValue === 0) {
      // Gestione di valori nulli, undefined o 0
      return new Date(0);
    }

    // 1. CASO: E' un NUMERO SERIALE Excel (il tuo 45853 è questo)
    if (typeof dateValue === "number" && dateValue > 40000) {
      // 45853 corrisponde a 12/11/2025
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
        setRecentOrders(tableData);

        // Raggruppa per 'descfam' e somma 'Qta da ev'
        const grouped = sumByKey(sheetData, "descfam", "Qta da ev", true);

        setSalesCategories(grouped.map((x) => x.descfam));
        setSalesSeries(grouped.map((x) => x.count));

        let orders = extractValues(sheetData, "Nr.ord");
        setOrders(orders);

        // 💡 NUOVA LOGICA: Calcola e imposta il totale degli ordini unici
        const uniqueOrdersCount = new Set(orders).size;
        setTotalUniqueOrders(uniqueOrdersCount);

        // 💡 LOGICA AGGIUNTIVA: Calcola e imposta la quantità totale (se la funzione sumByKey lo permette)
        // Ho supposto che sumByKey con keyToGroup=null restituisca la somma totale, altrimenti è necessaria una funzione di utilità separata.
        const totalQta = sumByKey(sheetData, null, "Qta da ev");
        setTotalQuantity(totalQta);
      } catch (err) {
        console.error("Errore caricamento Excel:", err);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    ...Reportoptions,
    xaxis: {
      categories: salesCategories,
    },
  };

  const dynamicCards = Ecommercecard.map((card) => {
    // Trova la card "Total Orders" (supponendo che sia l'unica con quel titolo)
    if (card.title === "Total Orders") {
      // Restituisce una nuova card con il conteggio aggiornato dallo stato
      return {
        ...card,
        count: totalUniqueOrders.toLocaleString("it-IT"),
      };
    }
    // Restituisce le altre card invariate
    return card;
  });

  // Aggiungi qui un controllo per la Card dei "Total Orders" nel box del grafico grande
  // Siccome la hai anche nel box grande qui sotto, è una ripetizione del dato (ma lo gestiamo)
  const totalOrdersCardData =
    dynamicCards.find((c) => c.title === "Total Orders") || {};
  // La proprietà 'count' di questo oggetto è il valore formattato.

  return (
    <Fragment>
      {/* <!-- Start::page-header --> */}
      <Seo title="Dashboards-Ecommerce" />

      <Pageheader
        title="Dashboards"
        currentpage="Ecommerce"
        activepage="Ecommerce"
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
                  card={idx} // Ora idx è l'oggetto AGGIORNATO da dynamicCards
                  badgeClass="md"
                  dataClass="mb-0"
                />
              ))}
            </Col>
            <Col xl={9}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <div className="card-title">Sales Report</div>
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
                        { title: "Ragione Sociale" },
                        { title: "Data Acquisto" },
                      ]}
                    >
                      {/* {tableData.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <Link
                              scroll={false}
                              href="#!"
                              className="text-primary"
                            >
                              {row.id}
                            </Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2 lh-1">
                                <span className="avatar avatar-sm">
                                  <img src={row.imageSrc} alt={row.name} />
                                </span>
                              </div>
                              <div>
                                <Link
                                  scroll={false}
                                  href="#!"
                                  className="fs-14 fw-medium"
                                >
                                  {row.name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="d-block text-muted">
                              {row.date}
                            </span>
                          </td>
                        </tr>
                      ))} */}

                      {recentOrders.map((row, index) => (
                        <tr key={index}>
                          {/* 1. Order ID (Sostituisci 'numero_documento' con la colonna Order ID del tuo Excel) */}
                          <td>{row["Nr.ord"] || "N/A"}</td>

                          {/* 2. Customer (Ho usato 'descfam' come nome, ma puoi usare qualsiasi campo) */}
                          <td>
                            <div className="d-flex align-items-center">
                              {/* Se non hai l'immagine del cliente, puoi rimuovere il div avatar */}
                              {/* <div className="avatar avatar-sm avatar-rounded me-3">
              <img src={'/path/to/default/image.jpg'} alt="" />
            </div> */}
                              <div className="fw-semibold">
                                {row["Ragione sociale"] || "Cliente Generico"}
                              </div>
                            </div>
                          </td>

                          {/* 3. Date (Formattazione standard per la data) */}
                          <td>
                            {row["Data ord"]
                              ? parseDate(row["Data ord"]).toLocaleDateString()
                              : "N/A"}
                          </td>

                          {/* ... Aggiungi altre <td> per eventuali altre colonne ... */}
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
                  {/* <SpkDropdown
                    // Togglevariant=""
                   // toggleas="a"
                    // Customtoggleclass=""
                    // Toggletext="View All"
                    // Navigate="#!"
                    Arrowicon={false}
                    // Menulabel="dropdownMenuButton1"
                    // Id="dropdownMenuButton1"
                  >
                     <li>
                      <Dropdown.Item href="#!">Yearly</Dropdown.Item>
                    </li> 
                     <li>
                      <Dropdown.Item href="#!">Monthly</Dropdown.Item>
                    </li>
                    <li>
                      <Dropdown.Item href="#!">Weakly</Dropdown.Item>
                    </li> 
                  </SpkDropdown> */}
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-center align-items-center text-center bg-light p-3 rounded-1 order-content">
                    <div>
                      <p className="mb-1">Ordini Totali Unici</p>
                      <h4 className="text-primary mb-0">
                        {totalUniqueOrders.toLocaleString("it-IT")}
                      </h4>
                    </div>
                    {/* <div>
                      <p className="mb-1 text-center">
                        Overall Growth from Last Year
                      </p>
                      <h5 className="text-success mb-0 text-center">+15%</h5>
                    </div> */}
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
          <div className="row">
            {/* <div className="col-xxl-5 ">
              <div className="card custom-card">
                <div className="card-header justify-content-between flex-wrap pb-0">
                  <div className="card-title">New Visitors</div>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-outline-light btn-icons btn-sm text-muted no-caret"
                    Navigate="#!"
                    Icon={true}
                    IconClass="fe fe-more-vertical"
                  >
                    <Dropdown.Item className="border-bottom" href="#!">
                      Today
                    </Dropdown.Item>
                    <Dropdown.Item className="border-bottom" href="#!">
                      This Week
                    </Dropdown.Item>
                    <Dropdown.Item as="li" href="#!">
                      Last Week
                    </Dropdown.Item>
                  </SpkDropdown>
                </div>
                <Card.Body>
                  <div className="row align-items-end mx-0">
                    <div className="col-5">
                      <h3 className="fw-medium mb-0">5,642</h3>
                      <div>
                        <i className="ri-checkbox-blank-circle-fill text-primary lh-1 align-middle fs-10"></i>{" "}
                        Total New Visitors
                      </div>
                    </div>
                    <div className="col-7">
                      <div className="fw-medium">
                        Percentage of New Visitors
                      </div>
                      <div className="text-muted fs-12">
                        Last 30 Days: Increased By{" "}
                        <span className="text-success fw-medium">
                          42.5%<i className="ti ti-arrow-narrow-up fs-16"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
                <div className="card-body p-0">
                  <div id="websitedesign">
                    <Spkapexcharts
                      chartOptions={Visitoroptions}
                      chartSeries={Visitorseries}
                      type="bar"
                      width={"100%"}
                      height={190}
                    />
                  </div>
                </div>
              </div>
            </div> */}
            {/* <Col xxl={3} md={6}>
              <Card className="custom-card overflow-hidden">
                <div className="card-header justify-content-between">
                  <div className="card-title">Payment Methods</div>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-outline-light btn-icons btn-sm text-muted no-caret"
                    Navigate="#!"
                    Icon={true}
                    IconClass="fe fe-more-vertical"
                  >
                    <Dropdown.Item className="border-bottom" href="#!">
                      Today
                    </Dropdown.Item>
                    <Dropdown.Item className="border-bottom" href="#!">
                      This Week
                    </Dropdown.Item>
                    <Dropdown.Item as="li" href="#!">
                      Last Week
                    </Dropdown.Item>
                  </SpkDropdown>
                </div>
                <Card.Body className="p-0">
                  <ul className="list-group list-group-flush">
                    {Payment.map((idx) => (
                      <li
                        className="list-group-item d-flex justify-content-between align-items-center"
                        key={Math.random()}
                      >
                        <div>
                          <i
                            className={`${idx.icon} p-1 bg-${idx.color}-transparent lh-1 me-2 fs-22 rounded-1`}
                          ></i>
                          {idx.title}
                        </div>
                        <SpkBadge variant="primary" Customclass="rounded-pill">
                          {idx.percent}
                        </SpkBadge>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col> */}
            {/* <Col xxl={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <div className="card-header justify-content-between pb-3">
                  <div className="card-title">Traffic Sources</div>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-light btn-sm text-muted no-caret"
                    Navigate="#!"
                    Arrowicon={true}
                    Toggletext="View All"
                  >
                    <Dropdown.Item as="li" href="#!">
                      Download
                    </Dropdown.Item>
                    <Dropdown.Item as="li" href="#!">
                      Import
                    </Dropdown.Item>
                    <Dropdown.Item as="li" href="#!">
                      Export
                    </Dropdown.Item>
                  </SpkDropdown>
                </div>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <SpkTablescomponent
                      tableClass="table-hover text-nowrap"
                      header={[
                        { title: "Browser" },
                        { title: "Traffic" },
                        { title: "Sessions" },
                      ]}
                    >
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar  avatar-sm p-2 bg-primary3-transparent me-2">
                              <i className="ri-chrome-line fs-18"></i>
                            </span>
                            <div className="fw-medium">Chrome</div>
                          </div>
                        </td>
                        <td>
                          <SpkProgress
                            variant="primary3"
                            mainClass="progress progress-sm"
                            striped={true}
                            animated={true}
                            now={78}
                          />
                        </td>
                        <td>
                          <span>
                            15,248
                            <i className="ri-arrow-up-s-fill ms-1 text-success align-middle fs-18"></i>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm p-2 bg-primary2-transparent me-2">
                              <i className="ri-safari-line fs-18"></i>
                            </span>
                            <div className="fw-medium">Safari</div>
                          </div>
                        </td>
                        <td>
                          <SpkProgress
                            variant="primary2"
                            mainClass="progress progress-sm"
                            striped={true}
                            animated={true}
                            now={56}
                          />
                        </td>
                        <td>
                          <span>
                            22,945
                            <i className="ri-arrow-up-s-fill ms-1 text-success align-middle fs-18"></i>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm p-2 bg-primary1-transparent me-2">
                              <i className="ri-opera-line fs-18"></i>
                            </span>
                            <div className="fw-medium">Opera</div>
                          </div>
                        </td>
                        <td>
                          <SpkProgress
                            variant="primary1"
                            mainClass="progress progress-sm"
                            striped={true}
                            animated={true}
                            now={62}
                          />
                        </td>
                        <td>
                          <span>
                            32,453
                            <i className="ri-arrow-down-s-fill ms-1 text-danger align-middle fs-18"></i>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar  avatar-sm p-2 bg-primary-transparent me-2">
                              <i className="ri-edge-fill fs-18"></i>
                            </span>
                            <div className="fw-medium">Edge</div>
                          </div>
                        </td>
                        <td>
                          <SpkProgress
                            variant="primary"
                            mainClass="progress progress-sm"
                            striped={true}
                            animated={true}
                            now={45}
                          />
                        </td>
                        <td>
                          <span>
                            9,886
                            <i className="ri-arrow-up-s-fill ms-1 text-success align-middle fs-18"></i>
                          </span>
                        </td>
                      </tr>
                    </SpkTablescomponent>
                  </div>
                </Card.Body>
              </Card>
            </Col> */}
          </div>
        </Col>
        {/* <div className="col-xxl-3">
          <div className="card custom-card offer-card">
            <div className="card-body p-3 pe-0">
              <div className="d-flex align-items-end">
                <div className="offer-card-details">
                  <div className="offer-item">
                    <div className="avatar avatar-xl mb-3">
                      <img
                        src="../../assets/images/ecommerce/png/17.png"
                        alt="Product Image"
                        className="img-fluid"
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="mb-2 fw-medium text-fixed-white">
                        Today's Sale
                      </h4>
                      <span className="mb-1 text-success fw-semibold fs-12">
                        Up to 20% Off on{" "}
                      </span>
                      <span className="mb-3 text-fixed-white h6">
                        {" "}
                        HeadPhones
                      </span>
                    </div>
                    <span className="text-fixed-white">Price: $9.99</span>
                    <span className="text-fixed-white ps-2">Discount: 20%</span>
                  </div>
                  <SpkButton Buttonvariant="primary1" Customclass="mt-4 shadow">
                    Add to Cart
                  </SpkButton>
                </div>
                <img
                  src="../../assets/images/media/media-90.png"
                  alt="Product Image"
                  className="img-fluid offer-item-img ms-auto"
                />
              </div>
            </div>
          </div>
          <div className="card custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Top-Selling Products</div>
              <Link
                scroll={false}
                href="#!"
                className="btn btn-outline-light border d-flex align-items-center text-muted btn-sm"
              >
                View All
              </Link>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0" id="product-list">
                {TopSellingdata.map((idx) => (
                  <li className="" key={Math.random()}>
                    <div className="d-flex align-items-center flex-wrap">
                      <div className="me-3 lh-1">
                        <span className="avatar avatar-lg bg-gray-200">
                          <img src={idx.src} alt="" />
                        </span>
                      </div>
                      <div className=" flex-fill">
                        <span className="fs-14 d-block mb-0 fw-medium">
                          {idx.header}
                        </span>
                        <span className="text-muted fs-12">{idx.data}</span>
                      </div>
                      <div className="text-end">
                        <p className="mb-0 fs-14 fw-medium">{idx.price}</p>
                        <p className="mb-0 text-muted fs-14">{idx.sales}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card custom-card">
            <div className="card-header justify-content-between pb-0">
              <div className="card-title"> Recent Activity </div>
              <SpkDropdown
                toggleas="a"
                Customtoggleclass="fs-12 text-muted bg-light rounded btn btn-sm btn-light no-caret"
                Navigate="#!"
                Arrowicon={true}
                Toggletext="View All"
              >
                <li>
                  <Dropdown.Item className="">Today</Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item className="">This Week</Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item className="">Last Week</Dropdown.Item>
                </li>
              </SpkDropdown>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0 ecommerce-recent-activity">
                {Recentactivity.map((activity) => (
                  <li
                    className="ecommerce-recent-activity-content d-flex gap-3 align-items-top"
                    key={activity.Id}
                  >
                    <SpkActivityCard productactivity={activity} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div> */}
      </Row>
      {/* <!-- End:: row-1 --> */}

      {/* <!-- Start:: row-2 --> */}
      {/* <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <div className="card-header justify-content-between">
              <div className="card-title">Newly Added Products</div>
              <div className="d-sm-flex">
                <div className="me-3 mb-3 mb-sm-0">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="Search"
                    aria-label=".form-control-sm example"
                  />
                </div>
                <SpkDropdown
                  toggleas="a"
                  Customtoggleclass="btn btn-primary btn-sm no-caret"
                  Navigate="#!"
                  Arrowicon={true}
                  Toggletext="Sort By"
                >
                  <li>
                    <Dropdown.Item as="li">New</Dropdown.Item>
                  </li>
                  <li>
                    <Dropdown.Item as="li">Popular</Dropdown.Item>
                  </li>
                  <li>
                    <Dropdown.Item as="li">Relevant</Dropdown.Item>
                  </li>
                </SpkDropdown>
              </div>
            </div>
            <Card.Body>
              <div className="table-responsive">
                <SpkTablescomponent
                  tableClass="text-nowrap table-bordered"
                  header={[
                    { title: "Product Id" },
                    { title: "Product Name" },
                    { title: "Category" },
                    { title: "% Discount" },
                    { title: "Price" },
                    { title: "Status" },
                    { title: "Added Date" },
                    { title: "Actions" },
                  ]}
                >
                  {Newlydata.map((idx) => (
                    <tr key={Math.random()}>
                      <td>
                        <span className="fw-medium">{idx.product}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2 lh-1">
                            <span className="avatar avatar-md bg-light">
                              <img src={idx.src} alt="" />
                            </span>
                          </div>
                          <div className="fs-14">{idx.prdtname}</div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium">{idx.category}</span>
                      </td>
                      <td>
                        <SpkBadge variant="primary">{idx.discount}%</SpkBadge>
                      </td>
                      <td>{idx.price}</td>
                      <td>
                        <span className={`badge bg-${idx.color}-transparent`}>
                          {idx.status}
                        </span>
                      </td>
                      <td>
                        <span className="fw-medium">{idx.date}</span>
                      </td>
                      <td>
                        <div className="btn-list">
                          <SpkTooltips placement="top" title="View">
                            <Link
                              aria-label="anchor"
                              href="#!"
                              scroll={false}
                              className="btn  btn-icon btn-secondary-light"
                            >
                              <i className="ti ti-eye"></i>
                            </Link>
                          </SpkTooltips>
                          <SpkTooltips placement="top" title="Edit">
                            <Link
                              aria-label="anchor"
                              href="#!"
                              scroll={false}
                              className="btn  btn-icon btn-info-light"
                            >
                              <i className="ti ti-pencil"></i>
                            </Link>
                          </SpkTooltips>
                          <SpkTooltips placement="top" title="Delete">
                            <Link
                              aria-label="anchor"
                              href="#!"
                              scroll={false}
                              className="btn  btn-icon  btn-primary2-light"
                            >
                              <i className="ti ti-trash"></i>
                            </Link>
                          </SpkTooltips>
                        </div>
                      </td>
                    </tr>
                  ))}
                </SpkTablescomponent>
              </div>
            </Card.Body>
            <div className="card-footer">
              <div className="d-flex align-items-center">
                <div>
                  Showing 5 Entries{" "}
                  <i className="bi bi-arrow-right ms-2 fw-medium"></i>
                </div>
                <div className="ms-auto">
                  <nav
                    aria-label="Page navigation"
                    className="pagination-style-4"
                  >
                    <Pagination className="pagination mb-0 overflow-auto">
                      <Pagination.Item disabled>Previous</Pagination.Item>
                      <Pagination.Item active>1</Pagination.Item>
                      <Pagination.Item>2</Pagination.Item>
                      <Pagination.Item className="pagination-next text-primary">
                        next
                      </Pagination.Item>
                    </Pagination>
                  </nav>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row> */}
      {/* <!-- End:: row-2 --> */}
    </Fragment>
  );
};

export default Ecommerce;
