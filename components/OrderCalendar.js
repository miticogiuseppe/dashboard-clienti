import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import OrderListModal from "./OrderListModal";
import "./OrderCalendar.css";
import Pageheader from "../shared/layouts-components/page-header/pageheader";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import React, { Fragment } from "react";
import Seo from "../shared/layouts-components/seo/seo";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";

const OrderCalendar = ({ orders }) => {
  //console.log("Orders in OrderCalendar:", orders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("Tutti");
  const [selectedClient, setSelectedClient] = useState("Tutti");

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000).toISOString().split("T")[0];
  };

  const filteredOrders = orders.filter((order) => {
    const matchAgent =
      selectedAgent === "Tutti" || order["Des. Agente"] === selectedAgent;
    const matchClient =
      selectedClient === "Tutti" || order["Ragione sociale"] === selectedClient;
    return matchAgent && matchClient;
  });

  const eventiPerData = {};
  filteredOrders.forEach((order) => {
    const data =
      typeof order["Data ord"] === "number"
        ? excelDateToJSDate(order["Data ord"])
        : order["Data ord"].replace(/\//g, "-");

    if (!eventiPerData[data]) eventiPerData[data] = [];
    eventiPerData[data].push(order);
  });

  const formattedEvents = Object.entries(eventiPerData).flatMap(
    ([data, eventi]) => {
      const visibili = eventi.slice(0, 2).map((order) => ({
        title: order.Articolo ?? "Sconosciuto",
        start: data,
        extendedProps: {
          cliente: order["Ragione sociale"] ?? "N/A",
          quantità: order["Qta da ev"] ?? "N/A",
          sezione: order.Sez ?? "N/A",
          agente: order["Des. Agente"] ?? "N/A",
        },
      }));

      const nascosti = eventi.length - 2;

      const extra =
        nascosti > 0
          ? [
              {
                title: `+${nascosti} altri`,
                start: data,
                extendedProps: { isMoreLink: true },
                className: "more-link-event",
              },
            ]
          : [];

      return [...visibili, ...extra];
    }
  );

  const handleEventClick = (info) => {
    const clickedDate = info.event.startStr;

    const ordiniGiorno = filteredOrders.filter((order) => {
      const dataOrdine =
        typeof order["Data ord"] === "number"
          ? excelDateToJSDate(order["Data ord"])
          : order["Data ord"].replace(/\//g, "-");

      return dataOrdine === clickedDate;
    });

    setSelectedOrders(
      ordiniGiorno.map((order) => ({
        cliente: order["Ragione sociale"] ?? "N/A",
        quantità: order["Qta da ev"] ?? "N/A",
        sezione: order.Sez ?? "N/A",
        agente: order["Des. Agente"] ?? "N/A",
      }))
    );
  };

  const agenti = [
    "Tutti",
    ...Array.from(new Set(orders.map((o) => o["Des. Agente"]).filter(Boolean))),
  ];
  const clienti = [
    "Tutti",
    ...Array.from(
      new Set(orders.map((o) => o["Ragione sociale"]).filter(Boolean))
    ),
  ];

  return (
    <Fragment>
      <Seo title="Calendario APPMERCE di Copral" />
      <Pageheader
        title="Apps"
        currentpage="Calendario Ordini"
        activepage="Calendario Ordini APPMERCE di Copral"
      />
      <Row>
        <Col xl={12} className="mb-0">
          <Card className="custom-card overflow-hidden">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="card-title">Calendario Ordini</div>
              <div className="d-flex gap-3 align-items-center">
                <label className="mb-0">Agente:</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {agenti.map((agente, idx) => (
                    <option key={idx} value={agente}>
                      {agente}
                    </option>
                  ))}
                </select>
                <label className="mb-0">Cliente:</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  {clienti.map((cliente, idx) => (
                    <option key={idx} value={cliente}>
                      {cliente}
                    </option>
                  ))}
                </select>
              </div>
            </Card.Header>
            <Card.Body>
              <div id="calendar2" className="overflow-hidden">
                <FullCalendar
                  plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                  }}
                  initialView="dayGridMonth"
                  events={formattedEvents}
                  eventClick={handleEventClick}
                  eventOrder={(a, b) => {
                    if (a.extendedProps?.isMoreLink) return 1;
                    if (b.extendedProps?.isMoreLink) return -1;
                    return 0;
                  }}
                />
                <OrderListModal
                  orders={selectedOrders}
                  onClose={() => setSelectedOrders([])}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default OrderCalendar;
