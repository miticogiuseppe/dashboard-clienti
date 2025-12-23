import { useState, useCallback, Fragment } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import DibartoloListModal from "./DibartoloListModal";
import Pageheader from "../shared/layouts-components/page-header/pageheader";
import { Card, Col, Row } from "react-bootstrap";
import Seo from "../shared/layouts-components/seo/seo";
import SearchBox from "@/components/SearchBox";

const OrdersDibartolo = ({ data }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [groupSearch, setGroupSearch] = useState({});
  const [clientSearch, setClientSearch] = useState({});
  const [orderSearch, setOrderSearch] = useState({});
  const [articleSearch, setArticleSearch] = useState({});
  const [serSearch, setSerSearch] = useState({});

  const handleEventClick = (info) => {
    const clickedDate = info.event.startStr;

    const ordiniGiorno = filteredData.filter((order) => {
      if (!order["Data cons. rich."]) return false;

      // Assumendo che le date siano oggetti Moment/Day.js come nel componente Copral
      const dataOrd = order["Data cons. rich."].format("YYYY-MM-DD");

      return dataOrd === clickedDate;
    });

    setSelectedOrders(
      ordiniGiorno.map((order) => ({
        numOrdine: order["Nr. ord."] ?? "N/A",
        cliente: order["Ragione sociale"] ?? "N/A",
        articolo: order.Articolo ?? "N/A",
        quantità: order["Qta/kg da ev."] ?? "N/A",
        sezione: order["Ser."] ?? "N/A",
        gruppo: order["Desc gr/sgru"] ?? "N/A",
        famiglia: order["Descrizione famiglia"] ?? "N/A",
      }))
    );
  };

  const handleGroupSearch = useCallback(
    (data) => setGroupSearch(data),
    [setGroupSearch]
  );
  const handleClientSearch = useCallback(
    (data) => setClientSearch(data),
    [setClientSearch]
  );
  const handleOrderSearch = useCallback(
    (data) => setOrderSearch(data),
    [setOrderSearch]
  );
  const handleArticleSearch = useCallback(
    (data) => setArticleSearch(data),
    [setArticleSearch]
  );
  const handleSerSearch = useCallback(
    (data) => setSerSearch(data),
    [setSerSearch]
  );

  // Funzione di filtraggio
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

  const filteredData = data.filter((order) => {
    const matchGroup = checkRow(order, "Desc gr/sgru", groupSearch);
    const matchClient = checkRow(order, "Ragione sociale", clientSearch);
    const matchOrder = checkRow(order, "Nr. ord.", orderSearch);
    const matchArticle = checkRow(order, "Articolo", articleSearch);
    const matchSer = checkRow(order, "Ser.", serSearch);
    return matchGroup && matchClient && matchOrder && matchArticle && matchSer;
  });

  // Raggruppamento per calendario
  const eventsByDate = {};
  filteredData.forEach((order) => {
    if (!order["Data cons. rich."]) return;

    const dateStr = order["Data cons. rich."].format("YYYY-MM-DD");

    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(order);
  });

  const formattedEvents = Object.entries(eventsByDate).flatMap(
    ([date, eventi]) => {
      const visibili = eventi.slice(0, 2).map((order) => ({
        title: order.Articolo ?? "Sconosciuto",
        start: date,
        extendedProps: {
          cliente: order["Ragione sociale"] ?? "N/A",
          quantità: order["Qta/kg da ev."] ?? "N/A",
          sezione: order["Ser."] ?? "N/A",
          numOrdine: order["Nr. ord."] ?? "N/A",
          articolo: order.Articolo ?? "N/A",
          famiglia: order["Descrizione famiglia"] ?? "N/A",
        },
      }));

      const nascosti = eventi.length - 2;

      const extra =
        nascosti > 0
          ? [
              {
                title: `+${nascosti} altri`,
                start: date,
                extendedProps: { isMoreLink: true },
                className: "more-link-event",
              },
            ]
          : [];

      return [...visibili, ...extra];
    }
  );

  // Liste per i SearchBox
  const groups = Array.from(
    new Set(data.map((o) => String(o["Desc gr/sgru"])).filter(Boolean))
  );
  const clients = Array.from(
    new Set(data.map((o) => String(o["Ragione sociale"])).filter(Boolean))
  );
  const orders = Array.from(
    new Set(data.map((o) => String(o["Nr. ord."])).filter(Boolean))
  );
  const ser = Array.from(
    new Set(data.map((o) => String(o["Ser."])).filter(Boolean))
  );
  const articles = Array.from(
    new Set(data.map((o) => String(o.Articolo)).filter(Boolean))
  );

  const filteredGroups = groups.filter(
    (g) =>
      !g || g.toLowerCase().includes((groupSearch.search || "").toLowerCase())
  );
  const filteredClients = clients.filter(
    (c) =>
      !c || c.toLowerCase().includes((clientSearch.search || "").toLowerCase())
  );
  const filteredOrders = orders.filter(
    (n) =>
      !n || n.toLowerCase().includes((orderSearch.search || "").toLowerCase())
  );

  const filteredSer = ser.filter(
    (n) =>
      !n || n.toLowerCase().includes((serSearch.search || "").toLowerCase())
  );
  const filteredArticles = articles.filter(
    (a) =>
      !a || a.toLowerCase().includes((articleSearch.search || "").toLowerCase())
  );

  return (
    <Fragment>
      <Seo title="Calendario Consegne" />
      <Pageheader title="Apps" currentpage="Calendario Dibartolo" />
      <Row>
        <Col xl={12}>
          <Card className="custom-card overflow-hidden">
            <Card.Header className="vertical-center">
              <span className="sc-title">Calendario Consegne</span>
            </Card.Header>
            <Card.Body>
              <div
                className="spacing"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                  width: "100%",
                  alignItems: "start",
                }}
              >
                {/* GRUPPO */}
                <SearchBox
                  data={filteredGroups}
                  name="Gruppo"
                  placeholder="Cerca gruppo..."
                  onSearch={handleGroupSearch}
                />

                {/* CLIENTE */}
                <SearchBox
                  data={filteredClients}
                  name="Cliente"
                  placeholder="Cerca cliente..."
                  onSearch={handleClientSearch}
                />

                {/* NUM. ORDINE */}
                <SearchBox
                  data={filteredOrders}
                  name="N.Ordine"
                  placeholder="Cerca numero ordine..."
                  onSearch={handleOrderSearch}
                />

                {/* SER */}
                <SearchBox
                  data={filteredSer}
                  name="Ser."
                  placeholder="Cerca numero sezione..."
                  onSearch={handleSerSearch}
                />

                {/* ARTICOLO */}
                <SearchBox
                  data={filteredArticles}
                  name="Articolo"
                  placeholder="Cerca articolo..."
                  onSearch={handleArticleSearch}
                />
              </div>

              <FullCalendar
                plugins={[dayGridPlugin, listPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                events={formattedEvents}
                eventClick={handleEventClick}
                locale="it"
                height="auto"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <DibartoloListModal
        orders={selectedOrders}
        onClose={() => setSelectedOrders([])}
      />
    </Fragment>
  );
};

export default OrdersDibartolo;
