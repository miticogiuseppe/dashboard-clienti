"use client";
import { useState, useMemo, Fragment } from "react";
import { Card, Col, Row, Table } from "react-bootstrap";
import SearchBox from "@/components/SearchBox";
import { checkRow } from "@/utils/filters";
import Spkcardscomponent from "@/shared/@spk-reusable-components/reusable-dashboards/spk-cards";
import { IoIosStats, IoIosPeople, IoIosCart } from "react-icons/io";

const VendutoAgente = ({ data }) => {
  // Stato unico per i filtri (più facile da gestire)
  const [filters, setFilters] = useState({
    agente: {},
    cliente: {},
    articolo: {},
  });

  const handleFilter = (key) => (val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  // 1. Applichiamo i filtri ai dati
  const filteredData = useMemo(() => {
    return (
      data?.filter((item) => {
        return (
          return checkRow(item, "CLIENTI", filters.cliente);
        );
      }) ?? []
    );
  }, [data, filters]);

  // 2. Calcoliamo i totali per le card (es. Fatturato Totale)
  const stats = useMemo(() => {
    const totale = filteredData.reduce(
      (acc, curr) => acc + (curr.Valore || 0),
      0,
    );
    const pezzi = filteredData.reduce((acc, curr) => acc + (curr.Qta || 0), 0);

    return {
      fatturato: totale.toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      }),
      quantita: pezzi,
      clientiUnici: new Set(filteredData.map((d) => d["Ragione sociale"])).size,
    };
  }, [filteredData]);

  return (
    <Fragment>
      {/* CARD DEI TOTALI */}
      <Row className="mb-4">
        <Col xl={4}>
          <Card className="custom-card">
            <Card.Body>
              <h6>Fatturato Filtrato</h6>
              <h3>{stats.fatturato}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="custom-card">
            <Card.Body>
              <h6>Totale Pezzi</h6>
              <h3>{stats.quantita}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="custom-card">
            <Card.Body>
              <h6>Clienti Attivi</h6>
              <h3>{stats.clientiUnici}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FILTRI */}
      <Card className="custom-card">
        <Card.Body>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            <SearchBox
              data={Array.from(new Set(data.map((d) => d["Des. Agente"])))}
              name="Agente"
              onSearch={handleFilter("agente")}
            />
            <SearchBox
              data={Array.from(new Set(data.map((d) => d["Ragione sociale"])))}
              name="Cliente"
              onSearch={handleFilter("cliente")}
            />
            <SearchBox
              data={Array.from(new Set(data.map((d) => d["Articolo"])))}
              name="Articolo"
              onSearch={handleFilter("articolo")}
            />
          </div>
        </Card.Body>
      </Card>

      {/* TABELLA RISULTATI */}
      <Card className="custom-card">
        <Card.Header>Dettaglio Vendite</Card.Header>
        <Card.Body>
          <Table responsive striped bordered>
            <thead>
              <tr>
                <th>Agente</th>
                <th>Cliente</th>
                <th>Articolo</th>
                <th>Quantità</th>
                <th>Valore</th>
              </tr>
            </thead>
            <tbody>
  {filteredData.map((row, i) => (
    <tr key={i}>
      <td>{row["CLIENTI"]}</td>
      <td>{row["2024"]?.toLocaleString()}€</td>
      <td>{row["2025"]?.toLocaleString()}€</td>
      <td>{row["2026"]?.toLocaleString()}€</td>
      <td style={{ fontWeight: 'bold' }}>{row["Totale complessivo"]?.toLocaleString()}€</td>
    </tr>
  ))}
</tbody>
          </Table>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default VendutoAgente;
