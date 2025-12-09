import { useState, useRef, useEffect, Fragment } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import OrderListModal from "./OrderListModal";
import "./OrderCalendar.css";
import Pageheader from "../shared/layouts-components/page-header/pageheader";
import { Card, Col, Row } from "react-bootstrap";
import Seo from "../shared/layouts-components/seo/seo";

const OrderCalendar = ({ orders }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [selectedAgent, setSelectedAgent] = useState("Tutti");
  const [selectedClient, setSelectedClient] = useState("Tutti");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("Tutti");
  const [selectedArticle, setSelectedArticle] = useState("Tutti");

  const [searchCliente, setSearchCliente] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchArticle, setSearchArticle] = useState("");

  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showOrderNumberSearch, setShowOrderNumberSearch] = useState(false);
  const [showArticleSearch, setShowArticleSearch] = useState(false);

  const clientContainerRef = useRef(null);
  const orderNumberContainerRef = useRef(null);
  const articleContainerRef = useRef(null);

  const clientInputRef = useRef(null);
  const orderNumberInputRef = useRef(null);
  const articleInputRef = useRef(null);

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000).toISOString().split("T")[0];
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        showClientSearch &&
        clientContainerRef.current &&
        !clientContainerRef.current.contains(e.target)
      ) {
        setShowClientSearch(false);
      }
      if (
        showOrderNumberSearch &&
        orderNumberContainerRef.current &&
        !orderNumberContainerRef.current.contains(e.target)
      ) {
        setShowOrderNumberSearch(false);
      }
      if (
        showArticleSearch &&
        articleContainerRef.current &&
        !articleContainerRef.current.contains(e.target)
      ) {
        setShowArticleSearch(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showClientSearch, showOrderNumberSearch, showArticleSearch]);

  useEffect(() => {
    if (showClientSearch && clientInputRef.current)
      clientInputRef.current.focus();
    if (showOrderNumberSearch && orderNumberInputRef.current)
      orderNumberInputRef.current.focus();
    if (showArticleSearch && articleInputRef.current)
      articleInputRef.current.focus();
  }, [showClientSearch, showOrderNumberSearch, showArticleSearch]);

  // FILTRI
  const filteredOrders = orders.filter((order) => {
    const matchAgent =
      selectedAgent === "Tutti" || order["Des. Agente"] === selectedAgent;

    const matchClient =
      selectedClient === "Tutti"
        ? order["Ragione sociale"]
          ? order["Ragione sociale"]
              .toLowerCase()
              .includes(searchCliente.toLowerCase())
          : true
        : order["Ragione sociale"] === selectedClient;

    const matchOrderNumber =
      selectedOrderNumber === "Tutti"
        ? String(order["Nr.ord"])
            .toLowerCase()
            .includes(searchOrderNumber.toLowerCase())
        : String(order["Nr.ord"]) === String(selectedOrderNumber);

    const matchArticle =
      selectedArticle === "Tutti"
        ? order.Articolo
          ? order.Articolo.toLowerCase().includes(searchArticle.toLowerCase())
          : true
        : order.Articolo === selectedArticle;

    return matchAgent && matchClient && matchOrderNumber && matchArticle;
  });

  // GROUP BY DATA CONS. SOLO ORDINI CON DATA
  const eventiPerData = {};
  filteredOrders.forEach((order) => {
    if (!order["Data Cons."]) return; // ✅ Esclude ordini senza Data Cons.

    const data =
      typeof order["Data Cons."] === "number"
        ? excelDateToJSDate(order["Data Cons."])
        : order["Data Cons."].replace(/\//g, "-");

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

    const ordiniGiorno = filteredOrders.filter((order) => {
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

  // LISTE SELECT
  const agenti = [
    "Tutti",
    ...new Set(orders.map((o) => o["Des. Agente"]).filter(Boolean)),
  ];
  const clientiCompleti = [
    "Tutti",
    ...Array.from(
      new Set(orders.map((o) => o["Ragione sociale"]).filter(Boolean))
    ),
  ];
  const numeriOrdine = [
    "Tutti",
    ...new Set(orders.map((o) => String(o["Nr.ord"])).filter(Boolean)),
  ];
  const articoli = [
    "Tutti",
    ...new Set(orders.map((o) => o.Articolo).filter(Boolean)),
  ];

  const clientiFiltrati = clientiCompleti.filter(
    (c) =>
      c === "Tutti" || c.toLowerCase().includes(searchCliente.toLowerCase())
  );
  const numeriOrdineFiltrati = numeriOrdine.filter(
    (n) =>
      n === "Tutti" || n.toLowerCase().includes(searchOrderNumber.toLowerCase())
  );
  const articoliFiltrati = articoli.filter(
    (a) =>
      a === "Tutti" || a.toLowerCase().includes(searchArticle.toLowerCase())
  );

  return (
    <Fragment>
      <Seo title="Calendario consegna ordini" />
      <Pageheader
        title="Apps"
        currentpage="Calendario consegna ordini"
        //activepage="Calendario consegna ordini"
      />
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <label
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                  >
                    Agente
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#f9f9f9",
                      textAlignLast: "left",
                    }}
                  >
                    {agenti.map((agente, idx) => (
                      <option key={idx} value={agente}>
                        {agente}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CLIENTE */}
                <div
                  ref={clientContainerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <label
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                  >
                    Cliente
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowClientSearch((prev) => !prev)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      background: "#f9f9f9",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "4px",
                      color:
                        selectedClient === "Tutti" && searchCliente
                          ? "#007bff"
                          : "black",
                      fontWeight:
                        selectedClient === "Tutti" && searchCliente
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {selectedClient}{" "}
                    {selectedClient === "Tutti" &&
                      searchCliente &&
                      `(Filtro: "${searchCliente}")`}
                  </button>
                  {showClientSearch && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 10,
                        width: "100%",
                        border: "1px solid #007bff",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        marginTop: "4px",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <input
                          ref={clientInputRef}
                          type="text"
                          placeholder="Cerca cliente..."
                          value={searchCliente}
                          onChange={(e) => setSearchCliente(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setShowClientSearch(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {clientiFiltrati.map((cliente, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setSelectedClient(cliente);
                              setShowClientSearch(false);
                              setSearchCliente("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              background:
                                selectedClient === cliente
                                  ? "#007bff"
                                  : "transparent",
                              color:
                                selectedClient === cliente ? "white" : "black",
                              textAlign: "left",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {cliente}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* NUM. ORDINE */}
                <div
                  ref={orderNumberContainerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <label
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                  >
                    Num. Ordine
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOrderNumberSearch((prev) => !prev)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      background: "#f9f9f9",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "4px",
                      color:
                        selectedOrderNumber === "Tutti" && searchOrderNumber
                          ? "#007bff"
                          : "black",
                      fontWeight:
                        selectedOrderNumber === "Tutti" && searchOrderNumber
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {selectedOrderNumber}{" "}
                    {selectedOrderNumber === "Tutti" &&
                      searchOrderNumber &&
                      `(Filtro: "${searchOrderNumber}")`}
                  </button>
                  {showOrderNumberSearch && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 10,
                        width: "100%",
                        border: "1px solid #007bff",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        marginTop: "4px",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <input
                          ref={orderNumberInputRef}
                          type="text"
                          placeholder="Cerca numero ordine..."
                          value={searchOrderNumber}
                          onChange={(e) => setSearchOrderNumber(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape")
                              setShowOrderNumberSearch(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {numeriOrdineFiltrati.map((num, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setSelectedOrderNumber(num);
                              setShowOrderNumberSearch(false);
                              setSearchOrderNumber("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              background:
                                selectedOrderNumber === num
                                  ? "#007bff"
                                  : "transparent",
                              color:
                                selectedOrderNumber === num ? "white" : "black",
                              textAlign: "left",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {num}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ARTICOLO */}
                <div
                  ref={articleContainerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <label
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                  >
                    Articolo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowArticleSearch((prev) => !prev)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      background: "#f9f9f9",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "4px",
                      color:
                        selectedArticle === "Tutti" && searchArticle
                          ? "#007bff"
                          : "black",
                      fontWeight:
                        selectedArticle === "Tutti" && searchArticle
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {selectedArticle}{" "}
                    {selectedArticle === "Tutti" &&
                      searchArticle &&
                      `(Filtro: "${searchArticle}")`}
                  </button>
                  {showArticleSearch && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 10,
                        width: "100%",
                        border: "1px solid #007bff",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        marginTop: "4px",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <input
                          ref={articleInputRef}
                          type="text"
                          placeholder="Cerca articolo..."
                          value={searchArticle}
                          onChange={(e) => setSearchArticle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setShowArticleSearch(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {articoliFiltrati.map((art, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setSelectedArticle(art);
                              setShowArticleSearch(false);
                              setSearchArticle("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              background:
                                selectedArticle === art
                                  ? "#007bff"
                                  : "transparent",
                              color:
                                selectedArticle === art ? "white" : "black",
                              textAlign: "left",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {art}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
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
