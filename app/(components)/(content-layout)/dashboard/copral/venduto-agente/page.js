"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { Row, Col, Card, Table, Badge } from "react-bootstrap";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import Seo from "@/shared/layouts-components/seo/seo";
import Preloader from "@/utils/Preloader";
import SearchBox from "@/components/SearchBox";
import { checkRow } from "@/utils/filters";
import { formatCurrency } from "@/utils/currency";

const VendutoAgente = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    cliente: { search: "", selected: undefined },
  });

  // 1. Caricamento dati dall'API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "/api/fetch-excel-json?id=STATISTICA_VENDUTO_1",
        );
        const json = await response.json();
        if (json.data) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati Agente 1:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 2. Logica dei filtri stabilizzata
  const handleFilter = useCallback((val) => {
    setFilters((prev) => ({ ...prev, cliente: val }));
  }, []);

  const listaClienti = useMemo(() => {
    return Array.from(
      new Set(data?.map((d) => d["CLIENTI"]).filter(Boolean) || []),
    );
  }, [data]);

  const filteredData = useMemo(() => {
    return (
      data?.filter((item) => checkRow(item, "CLIENTI", filters.cliente)) ?? []
    );
  }, [data, filters]);

  // 3. Calcolo statistiche per le Card (basate sui dati filtrati)
  const stats = useMemo(() => {
    const v24 = filteredData.reduce(
      (acc, curr) => acc + (Number(curr["2024"]) || 0),
      0,
    );
    const v25 = filteredData.reduce(
      (acc, curr) => acc + (Number(curr["2025"]) || 0),
      0,
    );
    const delta = v24 !== 0 ? ((v25 - v24) / v24) * 100 : 0;

    return {
      v24: formatCurrency(v24),
      v25: formatCurrency(v25),
      delta: delta.toFixed(1),
      isPositive: delta >= 0,
      count: filteredData.length,
    };
  }, [filteredData]);

  return (
    <Fragment>
      <Seo title="Venduto Agente 1 - STAVEN-1" />

      {isLoading ? (
        <Preloader show={true} />
      ) : (
        <Fragment>
          <Pageheader
            title="Vendite Agente"
            currentpage="Agente 1 (STAVEN-1)"
            activepage="Analisi"
          />

          {/* --- CARD DEI TOTALI --- */}
          <Row className="mb-4">
            <Col xl={4} md={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-light">
                <Card.Body>
                  <p className="text-muted mb-1 fs-12 uppercase fw-semibold">
                    Fatturato Filtrato 2024
                  </p>
                  <h4 className="fw-bold mb-0">{stats.v24}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} md={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-light">
                <Card.Body>
                  <p className="text-primary mb-1 fs-12 uppercase fw-semibold">
                    Fatturato Filtrato 2025
                  </p>
                  <h4 className="fw-bold mb-0">{stats.v25}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} md={4}>
              <Card className="custom-card shadow-sm border-top border-4 border-light">
                <Card.Body>
                  <p className="text-muted mb-1 fs-12 uppercase fw-semibold">
                    Trend Performance
                  </p>
                  <h4
                    className={`fw-bold mb-0 ${stats.isPositive ? "text-success" : "text-danger"}`}
                  >
                    {stats.isPositive ? "+" : ""}
                    {stats.delta}%
                    <i
                      className={`${stats.isPositive ? "ri-arrow-up-fill" : "ri-arrow-down-fill"} ms-1`}
                    ></i>
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* BOX DI RICERCA */}
          <Card className="custom-card mb-4 shadow-sm">
            <Card.Body>
              <SearchBox
                data={listaClienti}
                name="Cerca nel portafoglio Clienti"
                onSearch={handleFilter}
                placeholder="Inserisci ragione sociale..."
              />
            </Card.Body>
          </Card>

          {/* TABELLA DETTAGLIO */}
          <Card className="custom-card shadow-sm">
            <Card.Header className="justify-content-between">
              <Card.Title>Dettaglio Clienti Agente 1</Card.Title>
              <Badge bg="primary-transparent">
                {stats.count} Clienti visualizzati
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover striped className="mb-0 align-middle">
                <thead>
                  <tr className="table-light">
                    <th className="ps-3">Ragione Sociale</th>
                    <th className="text-end">Fatturato 2024</th>
                    <th className="text-end text-primary">Fatturato 2025</th>
                    <th className="text-end">Delta 25/24</th>
                    <th className="text-end pe-3">Totale Complessivo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, i) => {
                      const d24 = Number(row["DELTA 25/24"]) || 0;
                      return (
                        <tr key={i}>
                          <td className="ps-3 fw-medium">{row["CLIENTI"]}</td>
                          <td className="text-end">
                            {formatCurrency(row["2024"])}
                          </td>
                          <td className="text-end text-primary fw-bold">
                            {formatCurrency(row["2025"])}
                          </td>
                          <td
                            className={`text-end fw-semibold ${d24 >= 0 ? "text-success" : "text-danger"}`}
                          >
                            {(d24 * 100).toFixed(1).replace(".", ",")}%
                            <i
                              className={
                                d24 >= 0
                                  ? "ri-arrow-up-fill ms-1"
                                  : "ri-arrow-down-fill ms-1"
                              }
                            ></i>
                          </td>
                          <td className="text-end pe-3 fw-bold">
                            {formatCurrency(row["Totale complessivo"])}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-muted">
                        Nessun dato trovato per i criteri di ricerca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Fragment>
      )}
    </Fragment>
  );
};

export default VendutoAgente;
