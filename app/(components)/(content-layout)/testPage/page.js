"use client";
const Spkapexcharts = dynamic(
  () =>
    import(
      "../../../../shared/@spk-reusable-components/reusable-plugins/spk-apexcharts"
    ),
  { ssr: false }
);
import Spkcardscomponent from "../../../../shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import SpkCountrycard from "../../../../shared/@spk-reusable-components/reusable-dashboards/spk-countrycard";
import SpkActivityCard from "../../../../shared/@spk-reusable-components/reusable-dashboards/spk-recentacticvecard";
import SpkFlatpickr from "../../../../shared/@spk-reusable-components/reusable-plugins/spk-flatpicker";
import SpkDropdown from "../../../../shared/@spk-reusable-components/reusable-uielements/spk-dropdown";
import SpkButton from "../../../../shared/@spk-reusable-components/reusable-uielements/spk-button";
import SpkBreadcrumb from "../../../../shared/@spk-reusable-components/reusable-uielements/spk-breadcrumb";
import SpkBadge from "../../../../shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkTablescomponent from "../../../../shared/@spk-reusable-components/reusable-tables/tables-component";
import {
  Cardsdata,
  Countrydata,
  Graph2options,
  Graph2series,
  Graph3options,
  Graph3series,
  Graph4options,
  Graph4series,
  Graph5options,
  Graph5series,
  Graphoptions,
  Graphseries,
  Latestdata,
  Overoptions,
  Overseries,
  Recentorders,
  Saleoptions,
  Saleseries,
  Sellingdata,
  Staticoptions,
  Staticseries,
  activityData,
} from "../../../../shared/data/dashboard/salesdata";
import dynamic from "next/dynamic";
import Link from "next/link";
import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import { Card, Col, Dropdown, ProgressBar, Row } from "react-bootstrap";
import Seo from "../../../../shared/layouts-components/seo/seo";
import {
  loadSheet,
  sheetCount,
  parseDates,
  filterByWeek,
  orderSheet,
  extractValues,
  filterSheet,
  filterByRange,
} from "@/utils/excelUtils";
import { createSeries, createOptions } from "@/utils/graphUtils";

const Sales = () => {
  const [sheetData, setSheetData] = useState(undefined);
  const [graphSeries, setGraphSeries] = useState([]);
  const [graphOptions, setGraphOptions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(undefined);
  const [startDate, setStartDate] = useState(undefined);
  const [pickerDate, setPickerDate] = useState(undefined);
  const [productCount, setProductCount] = useState(undefined);

  const handleDateChange = (date) => {
    setPickerDate(date);
    if (date && date[0] && date[1]) {
      setStartDate({ ...date });
    }
  };

  const [data, allData] = useState(Recentorders);
  const handleRemove = (id) => {
    const list = data.filter((idx) => idx.id !== id);
    allData(list);
  };

  useEffect(() => {
    (async () => {
      const response = await fetch("/data/APPMERCE-000.xlsx");
      const blob = await response.blob();

      let jsonSheet = await loadSheet(blob, "APPMERCE-000_1");
      setSheetData(jsonSheet);

      let agents = extractValues(jsonSheet, "Des. Agente");
      setAgents(agents);
    })();
  }, [setSheetData]);

  useEffect(() => {
    if (!sheetData) return;

    let jsonSheet = sheetData;
    jsonSheet = parseDates(jsonSheet, ["Data ord"]);
    jsonSheet = orderSheet(jsonSheet, ["Data ord"], ["asc"]);
    if (startDate && startDate[0] && startDate[1]) {
      jsonSheet = filterByRange(
        jsonSheet,
        "Data ord",
        moment(startDate[0]),
        moment(startDate[1])
      );
    } else
      jsonSheet = filterByWeek(jsonSheet, "Data ord", moment("2025-09-20"), 2);
    if (selectedAgent)
      jsonSheet = filterSheet(jsonSheet, "Des. Agente", selectedAgent);
    const counters = sheetCount(jsonSheet, ["Data ord"]);
    const series = createSeries(counters);
    const options = createOptions(
      counters,
      "Data ord",
      (d) => d.format("DD/MM/YYYY"),
      "bar"
    );
    setGraphSeries(series);
    setGraphOptions(options);
  }, [sheetData, selectedAgent, startDate]);

  return (
    <Fragment>
      <Seo title="Copral Dashboard" />

      {/* <!-- Start::page-header --> */}
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          <SpkBreadcrumb Customclass="mb-1">
            <li className="breadcrumb-item">
              <Link scroll={false} href="#!">
                Dashboards
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Sales
            </li>
          </SpkBreadcrumb>
          <h1 className="page-title fw-medium fs-18 mb-0">Sales Dashboard</h1>
        </div>
        <div className="sc-container">
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-text bg-white border">
                {" "}
                <i className="ri-calendar-line" />{" "}
              </div>
              <SpkFlatpickr
                inputClass="form-control"
                options={{ mode: "range", dateFormat: "Y-m-d" }}
                onfunChange={handleDateChange}
                value={pickerDate}
                placeholder={["2016-10-10", "2016-10-20"]}
              />
              <button
                type="button"
                className="btn btn-light ms-2"
                onClick={() => {
                  setStartDate(undefined);
                  setPickerDate(undefined);
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <SpkDropdown
            Toggletext="Group By"
            Togglevariant="white"
            Customclass="inline-block"
          >
            <Dropdown.Item onClick={() => setSelectedAgent(undefined)}>
              --- Tutti gli agenti ---
            </Dropdown.Item>
            {agents.map((x) => (
              <Dropdown.Item key={x} onClick={() => setSelectedAgent(x)}>
                {x}
              </Dropdown.Item>
            ))}
          </SpkDropdown>
          <SpkButton Buttonvariant="white">
            <i className="ri-filter-3-line align-middle me-1 lh-1" /> Filter
          </SpkButton>
          <SpkButton Buttonvariant="primary" Customclass="me-0">
            <i className="ri-share-forward-line me-1" /> Share
          </SpkButton>
        </div>
      </div>
      {/* <!-- End::page-header --> */}

      {/* <!-- Start:: row-1 --> */}
      <Row>
        <Col xl={8}>
          <Row>
            {Cardsdata.map((idx) => (
              <Col xxl={3} xl={6} key={Math.random()}>
                <Spkcardscomponent
                  cardClass="overflow-hidden main-content-card"
                  headingClass="d-block mb-1"
                  mainClass="d-flex align-items-start justify-content-between mb-2"
                  Icon={true}
                  iconClass={idx.iconClass}
                  card={idx}
                  badgeClass="md rounded-pill"
                  dataClass="mb-0"
                />
              </Col>
            ))}
            <Col xxl={8} xl={6}>
              <Card className="custom-card">
                <Card.Header className="justify-content-between">
                  <Card.Title>Sales Overview</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Customtoggleclass="btn btn-sm btn-light text-muted"
                    Toggletext="Sort By"
                  >
                    <Dropdown.Item href="#!">This Week</Dropdown.Item>
                    <Dropdown.Item href="#!">Last Week</Dropdown.Item>
                    <Dropdown.Item href="#!">This Month</Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body>
                  <div id="sales-overview">
                    {graphSeries.length > 0 && graphOptions?.chart?.type && (
                      <Spkapexcharts
                        chartOptions={graphOptions}
                        chartSeries={graphSeries}
                        type={graphOptions.chart.type}
                        width={"100%"}
                        height={315}
                      />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xxl={4} xl={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Header className="pb-0 justify-content-between">
                  <Card.Title>Order Statistics</Card.Title>
                  <SpkDropdown
                    toggleas="a"
                    Navigate="#!"
                    Customtoggleclass="btn btn-light btn-icons btn-sm text-muted no-caret"
                    IconClass="fe fe-more-vertical"
                    Icon={true}
                  >
                    <Dropdown.Item className="border-bottom" href="#!">
                      Today
                    </Dropdown.Item>
                    <Dropdown.Item className="border-bottom" href="#!">
                      This Week
                    </Dropdown.Item>
                    <Dropdown.Item href="#!">Last Week</Dropdown.Item>
                  </SpkDropdown>
                </Card.Header>
                <Card.Body className="pt-4 px-3">
                  <div className="d-flex gap-3 mb-3 flex-wrap">
                    <div className="avatar avatar-md bg-primary-transparent">
                      <i className="ti ti-trending-up fs-5" />
                    </div>
                    <div className="flex-fill d-flex align-items-start justify-content-between">
                      <div>
                        <span className="fs-11 mb-1 d-block fw-medium">
                          TOTAL ORDERS
                        </span>
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="mb-0 d-flex align-items-center">
                            3,736
                            <span className="text-success fs-12 ms-2 op-1">
                              <i className="ti ti-trending-up align-middle me-1" />
                              0.57%
                            </span>
                          </h4>
                        </div>
                      </div>
                      <Link
                        scroll={false}
                        href="#!"
                        className="text-success fs-12 text-decoration-underline"
                      >
                        Earnings ?
                      </Link>
                    </div>
                  </div>
                  <div id="orders" className="my-2">
                    <Spkapexcharts
                      chartOptions={Staticoptions}
                      chartSeries={Staticseries}
                      type="donut"
                      width={"100%"}
                      height={175}
                    />
                  </div>
                </Card.Body>
                <div className="card-footer border-top border-block-start-dashed">
                  <div className="d-grid">
                    <SpkButton
                      Buttonvariant="primary-ghost"
                      Customclass="fw-medium waves-effect waves-light table-icon"
                    >
                      Complete Statistics
                      <i className="ti ti-arrow-narrow-right ms-2 fs-16 d-inline-block" />
                    </SpkButton>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xl={4}>
          {/*  <Row>
                         <Col xl={12}>
                            <Card className="custom-card main-dashboard-banner overflow-hidden">
                                <Card.Body className="p-4">
                                    <div className="row justify-content-between">
                                        <Col xxl={7} xl={5} lg={5} md={5} sm={5} className="">
                                            <h4 className="mb-3 fw-medium text-fixed-white">Upgrade to get more</h4>
                                            <p className="mb-4 text-fixed-white">Maximize sales insights. Optimize performance. Achieve success with pro.</p>
                                            <Link href="#!" scroll={false} className="fw-medium text-fixed-white text-decoration-underline">Upgrade To Pro<i className="ti ti-arrow-narrow-right"></i></Link>
                                        </Col>
                                        <Col xxl={4} xl={7} lg={7} md={7} sm={7} className="d-sm-block d-none text-end my-auto">
                                            <img src="../../assets/images/media/media-86.png" alt="" className="img-fluid" />
                                        </Col>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col> */}
          {/* <Col xl={12}>
                            <Card className="custom-card overflow-hidden">
                                <Card.Header className="justify-content-between">
                                    <Card.Title>
                                        Top Selling Categories
                                    </Card.Title>
                                    <SpkDropdown toggleas="a" Navigate="#!" Customtoggleclass="btn btn-sm btn-light text-muted" Toggletext="Sort By" Icon={true}>
                                        <Dropdown.Item href="#!">This Week</Dropdown.Item>
                                        <Dropdown.Item href="#!">Last Week</Dropdown.Item>
                                        <Dropdown.Item href="#!">This Month</Dropdown.Item>
                                    </SpkDropdown>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="p-3 pb-0">
                                        <ProgressBar className="progress-stacked progress-sm mb-2 gap-1">
                                            <ProgressBar key={1} variant="primary" now={25} />
                                            <ProgressBar key={2} variant="primary1" now={15} />
                                            <ProgressBar key={3} variant="primary2" now={15} />
                                            <ProgressBar key={4} variant="primary3" now={25} />
                                            <ProgressBar key={5} variant="secondary" now={20} />
                                        </ProgressBar>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div>Overall Sales</div>
                                            <div className="h6 mb-0"><span className="text-success me-2 fs-11">2.74%<i className="ti ti-arrow-narrow-up"></i></span>1,25,875</div>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <SpkTablescomponent tableClass="text-nowrap">
                                            {Sellingdata.map((idx) => (
                                                <tr key={Math.random()}>
                                                    <td>
                                                        <span className={`fw-medium top-category-name ${idx.data}`}>{idx.heading}</span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">{idx.price}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="text-muted fs-12">{idx.percent}% Gross</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <span className={`badge bg-${idx.color1}`}>{idx.percent1}% <i className={`ti ti-trending-${idx.icon}`}></i></span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </SpkTablescomponent>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col> 
                    </Row> */}
        </Col>
      </Row>

      {/* <!-- End:: row-1 --> */}

      {/* <!-- Start:: row-2 --> */}
      <span>
        {/* <Row>
                <Col xxl={3} xl={6}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="justify-content-between">
                            <Card.Title>
                                Latest Transactions
                            </Card.Title>
                            <Link href="#!" scroll={false} className="btn btn-light btn-wave btn-sm text-muted">View All<i className="ti ti-arrow-narrow-right ms-1"/></Link>
                        </Card.Header>
                        <Card.Body className="p-0 pt-1">
                            <div className="table-responsive">
                                <SpkTablescomponent tableClass="table text-nowrap" header={[{ title: 'Product' }, { title: 'Price' }, { title: 'Status' }]}>
                                    {Latestdata.map((idx) => (
                                        <tr key={Math.random()}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="lh-1">
                                                        <span className="avatar avatar-sm">
                                                            <img src={idx.src} alt="" />
                                                        </span>
                                                    </div>
                                                    <div className="fw-medium">{idx.product}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="fw-medium">{idx.price}</span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${idx.color}`}>{idx.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </SpkTablescomponent>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} xl={6}>
                    <Card className="custom-card">
                        <Card.Header className="justify-content-between">
                            <Card.Title>
                                Recent Activity
                            </Card.Title>
                            <Link href="#!" scroll={false} className="btn btn-light btn-wave btn-sm text-muted waves-effect waves-light">View All</Link>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled recent-activity-list">
                                {activityData.map((activity, index) => (
                                    <SpkActivityCard showTime={true} key={index} activityCard={activity} />
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} xl={6}>
                    <Card className="custom-card">
                        <Card.Header className="justify-content-between">
                            <Card.Title>
                                Sales Statistics
                            </Card.Title>
                            <SpkDropdown toggleas="a" Navigate="#!" Customtoggleclass="btn btn-sm btn-light text-muted" Toggletext="Sort By">
                                <li><Dropdown.Item>This Week</Dropdown.Item></li>
                                <li><Dropdown.Item>Last Week</Dropdown.Item></li>
                                <li><Dropdown.Item>This Month</Dropdown.Item></li>
                            </SpkDropdown>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-wrap gap-2 justify-content-between flex-fill pb-3">
                                <div className="py-3 px-4 rounded border border-dashed bg-light">
                                    <span>Total Sales</span>
                                    <p className="fw-medium fs-14 mb-0">$3.478B</p>
                                </div>
                                <div className="py-3 px-4 rounded border border-dashed bg-light">
                                    <span>This Year</span>
                                    <p className="text-success fw-medium fs-14 mb-0">4,25,349</p>
                                </div>
                                <div className="py-3 px-4 rounded border border-dashed bg-light">
                                    <span>Last Year</span>
                                    <p className="text-danger fw-medium fs-14 mb-0">3,41,622</p>
                                </div>
                            </div>
                            <div id="sales-statistics">
                                <Spkapexcharts chartOptions={Saleoptions} chartSeries={Saleseries} type="line" width={"100%"} height={265} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} xl={6}>
                    <Card className="custom-card overflow-hidden">
                        <Card.Header className="pb-0 justify-content-between">
                            <Card.Title>
                                Overall Statistics
                            </Card.Title>
                            <Link href="#!" scroll={false} className="btn btn-light btn-wave btn-sm text-muted waves-effect waves-light">View All</Link>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-group activity-feed">
                                <li className="list-group-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="lh-1">
                                            <p className="mb-2 fs-13 text-muted">Total Expenses</p>
                                            <h6 className="fw-medium mb-0">$134,032<span className="fs-12 text-success ms-2 fw-normal d-inline-block">0.45%<i className="ti ti-trending-up ms-1"></i></span></h6>
                                        </div>
                                        <div className="text-end">
                                            <div id="line-graph1">
                                                <Spkapexcharts chartOptions={Graphoptions} chartSeries={Graphseries} type="line" width={100} height={30} />
                                            </div>
                                            <Link scroll={false} href="#!" className="fs-12">
                                                <span>See more</span>
                                                <span className="table-icon"><i className="ms-1 d-inline-block ri-arrow-right-line"></i></span>
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="lh-1">
                                            <p className="mb-2 fs-13 text-muted">General Leads</p>
                                            <h6 className="fw-medium mb-0">74,354<span className="fs-12 text-danger ms-2 fw-normal d-inline-block">3.84%<i className="ti ti-trending-down ms-1"></i></span></h6>
                                        </div>
                                        <div className="text-end">
                                            <div id="line-graph2">
                                                <Spkapexcharts chartOptions={Graph2options} chartSeries={Graph2series} type="line" width={100} height={30} />
                                            </div>
                                            <Link scroll={false} href="#!" className="fs-12">
                                                <span>See more</span>
                                                <span className="table-icon"><i className="ms-1 d-inline-block ri-arrow-right-line"></i></span>
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="lh-1">
                                            <p className="mb-2 fs-13 text-muted">Churn Rate</p>
                                            <h6 className="fw-medium mb-0">6.02%<span className="fs-12 text-success ms-2 fw-normal d-inline-block">0.72%<i className="ti ti-trending-up ms-1"></i></span></h6>
                                        </div>
                                        <div className="text-end">
                                            <div id="line-graph3">
                                                <Spkapexcharts chartOptions={Graph3options} chartSeries={Graph3series} type="line" width={100} height={30} />
                                            </div>
                                            <Link scroll={false} href="#!" className="fs-12">
                                                <span>See more</span>
                                                <span className="table-icon"><i className="ms-1 d-inline-block ri-arrow-right-line"></i></span>
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="lh-1">
                                            <p className="mb-2 fs-13 text-muted">New Users</p>
                                            <h6 className="fw-medium mb-0">7,893<span className="fs-12 text-success ms-2 fw-normal d-inline-block">11.05%<i className="ti ti-trending-up ms-1"></i></span></h6>
                                        </div>
                                        <div className="text-end">
                                            <div id="line-graph4">
                                                <Spkapexcharts chartOptions={Graph4options} chartSeries={Graph4series} type="line" width={100} height={30} />
                                            </div>
                                            <Link scroll={false} href="#!" className="fs-12">
                                                <span>See more</span>
                                                <span className="table-icon"><i className="ms-1 d-inline-block ri-arrow-right-line"></i></span>
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="lh-1">
                                            <p className="mb-2 fs-13 text-muted">Returning Users</p>
                                            <h6 className="fw-medium mb-0">3,258<span className="fs-12 text-success ms-2 fw-normal d-inline-block">1.69%<i className="ti ti-trending-up ms-1"></i></span></h6>
                                        </div>
                                        <div className="text-end">
                                            <div id="line-graph5">
                                                <Spkapexcharts chartOptions={Graph5options} chartSeries={Graph5series} type="line" width={100} height={30} />
                                            </div>
                                            <Link scroll={false} href="#!" className="fs-12">
                                                <span>See more</span>
                                                <span className="table-icon"><i className="ms-1 d-inline-block ri-arrow-right-line"></i></span>
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}
      </span>
      {/* <!-- End:: row-2 --> */}

      {/* <!-- Start:: row-3 --> */}
      <Row>
        <Col xl={9}>
          <Card className="custom-card overflow-hidden">
            <Card.Header className="justify-content-between">
              <Card.Title>Recent Orders</Card.Title>
              <Link
                href="#!"
                scroll={false}
                className="btn btn-light btn-wave btn-sm text-muted waves-effect waves-light"
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <SpkTablescomponent
                  showCheckbox={true}
                  tableClass="text-nowrap"
                  Customcheckclass="text-center"
                  header={[
                    { title: "Customer" },
                    { title: "Product" },
                    { title: "Quantity", headerClassname: "text-center" },
                    { title: "Amount", headerClassname: "text-center" },
                    { title: "Status" },
                    { title: "date Ordered" },
                    { title: "Actions" },
                  ]}
                >
                  {data.map((idx) => (
                    <tr key={Math.random()}>
                      <td className="text-center">{idx.checked}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="lh-1">
                            <span className="avatar avatar-sm">
                              <img src={idx.src1} alt="" />
                            </span>
                          </div>
                          <div>
                            <span className="d-block fw-medium">
                              {idx.class}
                            </span>
                            <span className="d-block fs-11 text-muted">
                              {idx.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{idx.product}</td>
                      <td className="text-center">{idx.quantity}</td>
                      <td className="text-center">{idx.amount}</td>
                      <td>
                        <SpkBadge variant={idx.color}>{idx.status}</SpkBadge>
                      </td>
                      <td>{idx.date}</td>
                      <td>
                        <div className="btn-list">
                          <SpkButton
                            Buttonvariant="success-light"
                            Size="sm"
                            Customclass="btn-icon"
                          >
                            <i className="ri-pencil-line" />
                          </SpkButton>
                          <SpkButton
                            Buttonvariant="danger-light"
                            Size="sm"
                            Customclass="btn-icon"
                            onClickfunc={() => handleRemove(idx.id)}
                          >
                            <i className="ri-delete-bin-line" />
                          </SpkButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </SpkTablescomponent>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <div className="col-xl-3">
          <Card className="custom-card">
            <Card.Header className="justify-content-between">
              <Card.Title>Sales By Country</Card.Title>
              <Link
                scroll={false}
                href="#!"
                className="btn btn-light btn-wave btn-sm text-muted waves-effect waves-light"
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled sales-country-list">
                {Countrydata.map((idx) => (
                  <SpkCountrycard
                    key={Math.random()}
                    src={idx.src}
                    states={idx.states}
                    color={idx.color}
                    count={idx.data}
                    now={idx.now}
                  />
                ))}
              </ul>
            </Card.Body>
          </Card>
        </div>
      </Row>
      {/* <!-- End:: row-3 --> */}
    </Fragment>
  );
};

export default Sales;
