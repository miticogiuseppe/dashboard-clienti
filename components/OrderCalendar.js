import { useState, useCallback, useRef, useEffect, Fragment } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import OrderListModal from "./OrderListModal";
import Pageheader from "../shared/layouts-components/page-header/pageheader";
import { Card, Col, Row } from "react-bootstrap";
import Seo from "../shared/layouts-components/seo/seo";
import SearchBox from "@/components/SearchBox";

const OrderCalendar = ({ data }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [agentSearch, setAgentSearch] = useState({});
  const [clientSearch, setClientSearch] = useState({});
  const [orderSearch, setOrderSearch] = useState({});
  const [articleSearch, setArticleSearch] = useState({});

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000).toISOString().split("T")[0];
  };

  function checkRow(row, column, searchData) {
    if (searchData.selected) {
      return String(row[column]) === String(searchData.selected);
    } else {
      if (row[column] && searchData.search) {
        return String(row[column])
          .toLowerCase()
          .includes(String(searchData.search).toLowerCase());
      } else return true;
    }
  }

  // calcola ordini filtrati
  const filteredData = data.filter((order) => {
    const matchAgent = checkRow(order, "Des. Agente", agentSearch);
    const matchClient = checkRow(order, "Ragione sociale", clientSearch);
    const matchOrder = checkRow(order, "Nr.ord", orderSearch);
    const matchArticle = checkRow(order, "Articolo", articleSearch);
    return matchAgent && matchClient && matchOrder && matchArticle;
  });

  // raggruppa per "Data Cons.", escludendo ordini senza data
  const eventsByDate = {};
  filteredData.forEach((order) => {
    if (!order["Data Cons."]) return; // Esclude ordini senza Data Cons.

    const data =
      typeof order["Data Cons."] === "number"
        ? excelDateToJSDate(order["Data Cons."])
        : order["Data Cons."].replace(/\//g, "-");

    if (!eventsByDate[data]) eventsByDate[data] = [];
    eventsByDate[data].push(order);
  });

  // produce oggetti grafici
  const formattedEvents = Object.entries(eventsByDate).flatMap(
    ([data, eventi]) => {
      const visibili = eventi.slice(0, 2).map((order) => ({
        title: order.Articolo ?? "Sconosciuto",
        start: data,
        extendedProps: {
          cliente: order["Ragione sociale"] ?? "N/A",
          quantità: order["Qta da ev"] ?? "N/A",
          sezione: order.Sez ?? "N/A",
          agente: order["Des. Agente"] ?? "N/A",
          numOrdine: order["Nr.ord"] ?? "N/A",
          articolo: order.Articolo ?? "N/A",
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

    const ordiniGiorno = filteredData.filter((order) => {
      if (!order["Data Cons."]) return false; // ✅ Ignora ordini senza data

      const dataOrd =
        typeof order["Data Cons."] === "number"
          ? excelDateToJSDate(order["Data Cons."])
          : order["Data Cons."].replace(/\//g, "-");

      return dataOrd === clickedDate;
    });

    setSelectedOrders(
      ordiniGiorno.map((order) => ({
        numOrdine: order["Nr.ord"] ?? "N/A",
        cliente: order["Ragione sociale"] ?? "N/A",
        articolo: order.Articolo ?? "N/A",
        quantità: order["Qta da ev"] ?? "N/A",
        sezione: order.Sez ?? "N/A",
        agente: order["Des. Agente"] ?? "N/A",
      }))
    );
  };

  const onAgentSearch = useCallback(
    (data) => setAgentSearch(data),
    [setAgentSearch]
  );
  const onClientSearch = useCallback(
    (data) => setClientSearch(data),
    [setClientSearch]
  );
  const onOrderSearch = useCallback(
    (data) => setOrderSearch(data),
    [setOrderSearch]
  );
  const onArticleSearch = useCallback(
    (data) => setArticleSearch(data),
    [setArticleSearch]
  );

  const agents = Array.from(
    new Set(data.map((o) => String(o["Des. Agente"])).filter(Boolean))
  );
  const clients = Array.from(
    new Set(data.map((o) => String(o["Ragione sociale"])).filter(Boolean))
  );
  const orders = Array.from(
    new Set(data.map((o) => String(o["Nr.ord"])).filter(Boolean))
  );
  const articles = Array.from(
    new Set(data.map((o) => String(o["Articolo"])).filter(Boolean))
  );

  const filteredAgents = agents.filter(
    (c) => !c || c.toLowerCase().includes(agentSearch.search.toLowerCase())
  );
  const filteredClients = clients.filter(
    (c) => !c || c.toLowerCase().includes(clientSearch.search.toLowerCase())
  );
  const filteredOrders = orders.filter(
    (n) => !n || n.toLowerCase().includes(orderSearch.search.toLowerCase())
  );
  const filteredArticles = articles.filter(
    (a) => !a || a.toLowerCase().includes(articleSearch.search.toLowerCase())
  );

  return (
    <Fragment>
      <Seo title="Calendario consegna ordini" />
      <Pageheader title="Apps" currentpage="Calendario consegna ordini" />
      <Row>
        <Col xl={12}>
          <Card className="custom-card overflow-hidden">
            <Card.Header
              className="d-flex align-items-center justify-content-center"
              style={{ minHeight: "70px" }}
            >
              <div
                className="card-title"
                style={{
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: "26px",
                  letterSpacing: "0.6px",
                  color: "#1f2937",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                Calendario consegna ordini
              </div>

              {/* FILTRI ORIZZONTALI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                  width: "100%",
                  alignItems: "start",
                }}
              >
                {/* AGENTE */}
                <SearchBox
                  data={filteredAgents}
                  name="Agente"
                  placeholder="Cerca agente..."
                  onSearch={onAgentSearch}
                />

                {/* CLIENTE */}
                <SearchBox
                  data={filteredClients}
                  name="Cliente"
                  placeholder="Cerca cliente..."
                  onSearch={onClientSearch}
                />

                {/* NUM. ORDINE */}
                <SearchBox
                  data={filteredOrders}
                  name="Num. Ordine"
                  placeholder="Cerca numero ordine..."
                  onSearch={onOrderSearch}
                />

                {/* ARTICOLO */}
                <SearchBox
                  data={filteredArticles}
                  name="Articolo"
                  placeholder="Cerca articolo..."
                  onSearch={onArticleSearch}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <FullCalendar
                plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                events={formattedEvents}
                eventClick={handleEventClick}
                height="auto"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gestione del modal con chiusura funzionante */}
      <OrderListModal
        orders={selectedOrders}
        onClose={() => setSelectedOrders([])} // qui la funzione di chiusura
      />
    </Fragment>
  );
};

export default OrderCalendar;
